import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '@kalpak/db'
import { AppError } from '../middleware/errorHandler.js'
import { startOfMonth, endOfMonth } from 'date-fns'

export async function getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user!.role !== 'partner') throw new AppError(403, 'FORBIDDEN', 'Partners only')

    const now = new Date()
    const monthStart = startOfMonth(now).toISOString()
    const monthEnd = endOfMonth(now).toISOString()

    const [
      activeProjectsRes,
      newLeadsRes,
      workersOnSiteRes,
      thisMonthWorkerRes,
      thisMonthVendorRes,
      projectStatusRes,
      recentActivityRes,
      newLeadsListRes,
      allWPRes,
      allVPRes,
      allProjectsRes,
    ] = await Promise.all([
      supabaseAdmin.from('projects').select('id', { count: 'exact' }).in('status', ['confirmed', 'in_progress', 'snagging']),
      supabaseAdmin.from('leads').select('id', { count: 'exact' }).gte('created_at', monthStart).lte('created_at', monthEnd),
      supabaseAdmin.from('project_workers').select('workers_needed', { count: 'exact' }).eq('is_active', true),
      supabaseAdmin.from('worker_payments').select('amount').gte('payment_date', monthStart.slice(0, 10)).lte('payment_date', monthEnd.slice(0, 10)),
      supabaseAdmin.from('vendor_payments').select('amount').gte('payment_date', monthStart.slice(0, 10)).lte('payment_date', monthEnd.slice(0, 10)),
      supabaseAdmin.from('projects').select('status'),
      supabaseAdmin.from('site_updates').select('id, project_id, update_text, update_date, created_at, posted_by, projects(name), profiles!posted_by(full_name)').order('created_at', { ascending: false }).limit(10),
      supabaseAdmin.from('leads').select('id, full_name, phone, city, project_type, budget_range, created_at, status').order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('worker_payments').select('project_id, amount'),
      supabaseAdmin.from('vendor_payments').select('project_id, amount'),
      supabaseAdmin.from('projects').select('id, name, total_budget').not('status', 'in', '("completed","on_hold")'),
    ])

    const sumAmounts = (rows: Array<{ amount: number }> | null) =>
      (rows ?? []).reduce((s, r) => s + Number(r.amount), 0)

    const totalSpentThisMonth = sumAmounts(thisMonthWorkerRes.data) + sumAmounts(thisMonthVendorRes.data)

    const statusBreakdown: Record<string, number> = {}
    for (const p of (projectStatusRes.data ?? []) as Array<{ status: string }>) {
      statusBreakdown[p.status] = (statusBreakdown[p.status] ?? 0) + 1
    }

    const recentActivity = ((recentActivityRes.data ?? []) as Array<Record<string, unknown>>).map((u) => ({
      id: u.id,
      project_id: u.project_id,
      project_name: (u.projects as { name: string } | null)?.name ?? '—',
      posted_by_name: (u.profiles as { full_name: string } | null)?.full_name ?? '—',
      update_text: String(u.update_text).slice(0, 120),
      update_date: u.update_date,
      created_at: u.created_at,
    }))

    // Budget alerts: projects with utilization > 85%
    const projectSpend = new Map<string, number>()
    for (const p of [...(allWPRes.data ?? []), ...(allVPRes.data ?? [])] as Array<{ project_id: string; amount: number }>) {
      projectSpend.set(p.project_id, (projectSpend.get(p.project_id) ?? 0) + Number(p.amount))
    }
    const budgetAlerts = ((allProjectsRes.data ?? []) as Array<{ id: string; name: string; total_budget: number | null }>)
      .filter((p) => {
        if (!p.total_budget) return false
        const spent = projectSpend.get(p.id) ?? 0
        return (spent / p.total_budget) * 100 > 85
      })
      .map((p) => {
        const spent = projectSpend.get(p.id) ?? 0
        return {
          project_id: p.id,
          project_name: p.name,
          utilization_percent: Math.round((spent / p.total_budget!) * 100),
          remaining_budget: p.total_budget! - spent,
        }
      })

    res.json({
      data: {
        stats: {
          active_projects: activeProjectsRes.count ?? 0,
          new_leads_this_month: newLeadsRes.count ?? 0,
          workers_on_site: workersOnSiteRes.count ?? 0,
          total_spent_this_month: totalSpentThisMonth,
        },
        project_status_breakdown: Object.entries(statusBreakdown).map(([status, count]) => ({ status, count })),
        recent_activity: recentActivity,
        new_leads: newLeadsListRes.data ?? [],
        budget_alerts: budgetAlerts,
      },
    })
  } catch (err) {
    next(err)
  }
}
