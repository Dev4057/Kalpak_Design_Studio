import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '@kalpak/db'
import { AppError } from '../middleware/errorHandler.js'
import type { CreateWorkerPaymentInput, CreateVendorPaymentInput } from '@kalpak/shared'

export async function listWorkerPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: project_id } = req.params
    const { data, error } = await supabaseAdmin
      .from('worker_payments')
      .select('*, workers(full_name, trade)')
      .eq('project_id', project_id)
      .order('payment_date', { ascending: false })

    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.json({ data })
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
      .select()
      .single()

    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.status(201).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function listVendorPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: project_id } = req.params
    const { data, error } = await supabaseAdmin
      .from('vendor_payments')
      .select('*, profiles(full_name)')
      .eq('project_id', project_id)
      .order('payment_date', { ascending: false })

    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.json({ data })
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

export async function getPaymentSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: project_id } = req.params

    const [workerRes, vendorRes, projectRes] = await Promise.all([
      supabaseAdmin
        .from('worker_payments')
        .select('amount')
        .eq('project_id', project_id),
      supabaseAdmin
        .from('vendor_payments')
        .select('amount')
        .eq('project_id', project_id),
      supabaseAdmin
        .from('projects')
        .select('total_budget')
        .eq('id', project_id)
        .single(),
    ])

    const workerTotal = (workerRes.data ?? []).reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0)
    const vendorTotal = (vendorRes.data ?? []).reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0)
    const totalSpent = workerTotal + vendorTotal
    const budget = projectRes.data?.total_budget ?? null

    res.json({
      data: {
        worker_payments_total: workerTotal,
        vendor_payments_total: vendorTotal,
        total_spent: totalSpent,
        total_budget: budget,
        remaining_budget: budget !== null ? budget - totalSpent : null,
      },
    })
  } catch (err) {
    next(err)
  }
}
