import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '@kalpak/db'
import { AppError } from '../middleware/errorHandler.js'
import type { CreateWorkerPaymentInput, CreateVendorPaymentInput } from '@kalpak/shared'

export async function listWorkerPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: project_id } = req.params
    const { data, error } = await supabaseAdmin
      .from('worker_payments')
      .select('*, workers(full_name, trade), profiles!paid_by(full_name)')
      .eq('project_id', project_id)
      .order('payment_date', { ascending: false })

    if (error) throw new AppError(500, 'DB_ERROR', error.message)

    // Build per-worker summaries
    const workerMap = new Map<string, {
      worker_id: string; worker_name: string; trade: string
      total_paid: number; payment_count: number; last_payment_date: string | null
    }>()
    for (const p of (data ?? []) as Array<Record<string, unknown>>) {
      const wid = p.worker_id as string
      const w = p.workers as { full_name: string; trade: string } | null
      if (!workerMap.has(wid)) {
        workerMap.set(wid, {
          worker_id: wid,
          worker_name: w?.full_name ?? 'Unknown',
          trade: w?.trade ?? 'other',
          total_paid: 0,
          payment_count: 0,
          last_payment_date: null,
        })
      }
      const entry = workerMap.get(wid)!
      entry.total_paid += Number(p.amount)
      entry.payment_count += 1
      const pd = p.payment_date as string
      if (!entry.last_payment_date || pd > entry.last_payment_date) {
        entry.last_payment_date = pd
      }
    }

    const payments = (data ?? []).map((p: Record<string, unknown>) => ({
      ...p,
      worker: p.workers,
      paid_by_profile: p.profiles,
    }))

    res.json({ data: payments, worker_summaries: Array.from(workerMap.values()) })
  } catch (err) {
    next(err)
  }
}

export async function createWorkerPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: project_id } = req.params
    const input = req.body as CreateWorkerPaymentInput
    const { data, error } = await supabaseAdmin
      .from('worker_payments')
      .insert({ ...input, project_id, paid_by: req.user!.id })
      .select('*, workers(full_name, trade)')
      .single()

    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.status(201).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function deleteWorkerPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user!.role !== 'partner') throw new AppError(403, 'FORBIDDEN', 'Partners only')
    const { paymentId } = req.params
    const { error } = await supabaseAdmin.from('worker_payments').delete().eq('id', paymentId)
    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

export async function listVendorPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: project_id } = req.params
    const { data, error } = await supabaseAdmin
      .from('vendor_payments')
      .select('*, profiles!paid_by(full_name)')
      .eq('project_id', project_id)
      .order('payment_date', { ascending: false })

    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    const payments = (data ?? []).map((p: Record<string, unknown>) => ({
      ...p,
      paid_by_profile: p.profiles,
    }))
    res.json({ data: payments })
  } catch (err) {
    next(err)
  }
}

export async function createVendorPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: project_id } = req.params
    const input = req.body as CreateVendorPaymentInput
    const { data, error } = await supabaseAdmin
      .from('vendor_payments')
      .insert({ ...input, project_id, paid_by: req.user!.id })
      .select()
      .single()

    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.status(201).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function deleteVendorPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user!.role !== 'partner') throw new AppError(403, 'FORBIDDEN', 'Partners only')
    const { paymentId } = req.params
    const { error } = await supabaseAdmin.from('vendor_payments').delete().eq('id', paymentId)
    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

export async function getFinancialSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: project_id } = req.params

    const [workerRes, vendorRes, projectRes] = await Promise.all([
      supabaseAdmin.from('worker_payments').select('amount, payment_mode').eq('project_id', project_id),
      supabaseAdmin.from('vendor_payments').select('amount, payment_mode').eq('project_id', project_id),
      supabaseAdmin.from('projects').select('total_budget').eq('id', project_id).single(),
    ])

    const workerPayments = (workerRes.data ?? []) as Array<{ amount: number; payment_mode: string | null }>
    const vendorPayments = (vendorRes.data ?? []) as Array<{ amount: number; payment_mode: string | null }>

    const workerTotal = workerPayments.reduce((s, p) => s + Number(p.amount), 0)
    const vendorTotal = vendorPayments.reduce((s, p) => s + Number(p.amount), 0)
    const totalSpent = workerTotal + vendorTotal
    const budget = projectRes.data?.total_budget ?? null

    const paymentByMode = { cash: 0, upi: 0, bank_transfer: 0, cheque: 0 } as Record<string, number>
    for (const p of [...workerPayments, ...vendorPayments]) {
      const mode = p.payment_mode ?? 'cash'
      paymentByMode[mode] = (paymentByMode[mode] ?? 0) + Number(p.amount)
    }

    res.json({
      data: {
        total_budget: budget,
        total_worker_payments: workerTotal,
        total_vendor_payments: vendorTotal,
        total_spent: totalSpent,
        remaining_budget: budget !== null ? budget - totalSpent : null,
        budget_utilization_percent: budget && budget > 0 ? Math.round((totalSpent / budget) * 100) : null,
        worker_payment_count: workerPayments.length,
        vendor_payment_count: vendorPayments.length,
        payment_by_mode: paymentByMode,
      },
    })
  } catch (err) {
    next(err)
  }
}
