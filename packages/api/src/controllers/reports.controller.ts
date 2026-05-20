import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '@kalpak/db'
import { AppError } from '../middleware/errorHandler.js'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'

export async function getReportsOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user!.role !== 'partner') throw new AppError(403, 'FORBIDDEN', 'Partners only')

    const now = new Date()
    const thisMonthStart = startOfMonth(now).toISOString()
    const thisMonthEnd = endOfMonth(now).toISOString()
    const lastMonthStart = startOfMonth(subMonths(now, 1)).toISOString()
    const lastMonthEnd = endOfMonth(subMonths(now, 1)).toISOString()

    const [
      thisMonthWorker, thisMonthVendor, lastMonthWorker, lastMonthVendor,
      thisMonthLeads, lastMonthLeads,
      thisMonthCompleted, lastMonthCompleted,
      allProjects,
      allWorkerPayments,
    ] = await Promise.all([
      supabaseAdmin.from('worker_payments').select('amount').gte('payment_date', thisMonthStart.slice(0, 10)).lte('payment_date', thisMonthEnd.slice(0, 10)),
      supabaseAdmin.from('vendor_payments').select('amount').gte('payment_date', thisMonthStart.slice(0, 10)).lte('payment_date', thisMonthEnd.slice(0, 10)),
      supabaseAdmin.from('worker_payments').select('amount').gte('payment_date', lastMonthStart.slice(0, 10)).lte('payment_date', lastMonthEnd.slice(0, 10)),
      supabaseAdmin.from('vendor_payments').select('amount').gte('payment_date', lastMonthStart.slice(0, 10)).lte('payment_date', lastMonthEnd.slice(0, 10)),
      supabaseAdmin.from('leads').select('id', { count: 'exact' }).gte('created_at', thisMonthStart).lte('created_at', thisMonthEnd),
      supabaseAdmin.from('leads').select('id', { count: 'exact' }).gte('created_at', lastMonthStart).lte('created_at', lastMonthEnd),
      supabaseAdmin.from('projects').select('id', { count: 'exact' }).eq('status', 'completed').gte('updated_at', thisMonthStart).lte('updated_at', thisMonthEnd),
      supabaseAdmin.from('projects').select('id', { count: 'exact' }).eq('status', 'completed').gte('updated_at', lastMonthStart).lte('updated_at', lastMonthEnd),
      supabaseAdmin.from('projects').select('id, name, status, total_budget, clients(full_name)').not('status', 'in', '("completed","on_hold")'),
      supabaseAdmin.from('worker_payments').select('worker_id, amount, payment_date, workers(full_name, trade)').gte('payment_date', thisMonthStart.slice(0, 10)).lte('payment_date', thisMonthEnd.slice(0, 10)),
    ])

    const sumAmounts = (rows: Array<{ amount: number }> | null) =>
      (rows ?? []).reduce((s, r) => s + Number(r.amount), 0)

    const thisMonthTotalWorker = sumAmounts(thisMonthWorker.data)
    const thisMonthTotalVendor = sumAmounts(thisMonthVendor.data)
    const lastMonthTotalWorker = sumAmounts(lastMonthWorker.data)
    const lastMonthTotalVendor = sumAmounts(lastMonthVendor.data)

    // Per-project totals for budget health
    const [allWP, allVP] = await Promise.all([
      supabaseAdmin.from('worker_payments').select('project_id, amount'),
      supabaseAdmin.from('vendor_payments').select('project_id, amount'),
    ])
    const projectSpend = new Map<string, number>()
    for (const p of [...(allWP.data ?? []), ...(allVP.data ?? [])] as Array<{ project_id: string; amount: number }>) {
      projectSpend.set(p.project_id, (projectSpend.get(p.project_id) ?? 0) + Number(p.amount))
    }

    const byProject = ((allProjects.data ?? []) as Array<Record<string, unknown>>).map((proj) => {
      const spent = projectSpend.get(proj.id as string) ?? 0
      const budget = proj.total_budget as number | null
      const client = proj.clients as { full_name: string } | null
      return {
        project_id: proj.id,
        project_name: proj.name,
        client_name: client?.full_name ?? '—',
        total_budget: budget,
        total_spent: spent,
        budget_utilization_percent: budget && budget > 0 ? Math.round((spent / budget) * 100) : null,
        status: proj.status,
      }
    })

    // Top workers this month by payment amount
    const workerTotals = new Map<string, { worker_id: string; worker_name: string; trade: string; total_paid: number }>()
    for (const p of (allWorkerPayments.data ?? []) as Array<Record<string, unknown>>) {
      const wid = p.worker_id as string
      const w = p.workers as { full_name: string; trade: string } | null
      if (!workerTotals.has(wid)) {
        workerTotals.set(wid, { worker_id: wid, worker_name: w?.full_name ?? 'Unknown', trade: w?.trade ?? 'other', total_paid: 0 })
      }
      workerTotals.get(wid)!.total_paid += Number(p.amount)
    }
    const topWorkers = Array.from(workerTotals.values())
      .sort((a, b) => b.total_paid - a.total_paid)
      .slice(0, 5)

    // Monthly spend trend (last 6 months)
    const monthlyTrend = []
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i)
      const mStart = startOfMonth(d).toISOString().slice(0, 10)
      const mEnd = endOfMonth(d).toISOString().slice(0, 10)
      const [mw, mv] = await Promise.all([
        supabaseAdmin.from('worker_payments').select('amount').gte('payment_date', mStart).lte('payment_date', mEnd),
        supabaseAdmin.from('vendor_payments').select('amount').gte('payment_date', mStart).lte('payment_date', mEnd),
      ])
      monthlyTrend.push({
        month: format(d, 'MMM yyyy'),
        worker_payments: sumAmounts(mw.data),
        vendor_payments: sumAmounts(mv.data),
      })
    }

    res.json({
      data: {
        this_month: {
          total_worker_payments: thisMonthTotalWorker,
          total_vendor_payments: thisMonthTotalVendor,
          total_spent: thisMonthTotalWorker + thisMonthTotalVendor,
          new_leads: thisMonthLeads.count ?? 0,
          projects_completed: thisMonthCompleted.count ?? 0,
        },
        last_month: {
          total_worker_payments: lastMonthTotalWorker,
          total_vendor_payments: lastMonthTotalVendor,
          total_spent: lastMonthTotalWorker + lastMonthTotalVendor,
          new_leads: lastMonthLeads.count ?? 0,
          projects_completed: lastMonthCompleted.count ?? 0,
        },
        by_project: byProject,
        top_workers_by_payment: topWorkers,
        monthly_spend_trend: monthlyTrend,
      },
    })
  } catch (err) {
    next(err)
  }
}
