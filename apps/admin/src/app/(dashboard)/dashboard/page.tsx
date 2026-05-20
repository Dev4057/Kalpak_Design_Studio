'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useDashboard } from '@/hooks/useDashboard'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  FolderOpen,
  Users,
  HardHat,
  CreditCard,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { formatPhone, formatCurrency } from '@kalpak/shared'

const STATUS_COLORS: Record<string, string> = {
  lead: 'bg-gray-400',
  confirmed: 'bg-blue-500',
  in_progress: 'bg-primary',
  snagging: 'bg-orange-500',
  completed: 'bg-success',
  on_hold: 'bg-red-500',
}

const STATUS_LABELS: Record<string, string> = {
  lead: 'Lead',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  snagging: 'Snagging',
  completed: 'Completed',
  on_hold: 'On Hold',
}

export default function DashboardPage() {
  const { role, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { data, isLoading } = useDashboard()

  useEffect(() => {
    if (!authLoading && role === 'employee') {
      router.replace('/projects')
    }
  }, [role, authLoading, router])

  if (authLoading || role === 'employee') return null

  const dashboard = data?.data

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of Kalpak Design Studio" />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))
        ) : (
          <>
            <StatsCard
              title="Active Projects"
              value={dashboard?.stats.active_projects ?? 0}
              icon={FolderOpen}
              subtitle="Confirmed + In Progress + Snagging"
            />
            <StatsCard
              title="New Leads This Month"
              value={dashboard?.stats.new_leads_this_month ?? 0}
              icon={Users}
            />
            <StatsCard
              title="Workers on Site"
              value={dashboard?.stats.workers_on_site ?? 0}
              icon={HardHat}
              subtitle="Across active projects"
            />
            <StatsCard
              title="Spent This Month"
              value={dashboard ? formatCurrency(dashboard.stats.total_spent_this_month) : '—'}
              icon={CreditCard}
            />
          </>
        )}
      </div>

      {/* Budget Alerts */}
      {!isLoading && dashboard && dashboard.budget_alerts.length > 0 && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <p className="text-sm font-medium text-amber-800">
              Budget Alert: {dashboard.budget_alerts.length} project{dashboard.budget_alerts.length > 1 ? 's are' : ' is'} above 85% budget utilisation
            </p>
          </div>
          <div className="space-y-1.5">
            {dashboard.budget_alerts.map((alert) => (
              <Link
                key={alert.project_id}
                href={`/projects/${alert.project_id}/financials`}
                className="flex items-center justify-between p-2 rounded bg-white hover:bg-amber-50 border border-amber-100 transition-colors"
              >
                <span className="text-sm font-medium text-text-primary">{alert.project_name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-secondary">Remaining: {formatCurrency(alert.remaining_budget)}</span>
                  <Badge className={`text-xs ${alert.utilization_percent >= 90 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {alert.utilization_percent}% used
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Status Overview */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Project Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(STATUS_LABELS).map(([status, label]) => {
                  const count = dashboard?.project_status_breakdown.find((s) => s.status === status)?.count ?? 0
                  return (
                    <Link
                      key={status}
                      href={`/projects?status=${status}`}
                      className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]}`} />
                        <span className="text-sm text-text-secondary group-hover:text-text-primary">{label}</span>
                      </div>
                      <span className="text-sm font-medium text-text-primary">{count}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recent Site Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded" />)}
              </div>
            ) : !dashboard || dashboard.recent_activity.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-6">No site updates yet</p>
            ) : (
              <div className="space-y-3">
                {dashboard.recent_activity.map((update) => (
                  <div key={update.id} className="flex gap-3">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <Link href={`/projects/${update.project_id}/updates`} className="text-xs font-medium text-primary hover:underline">
                          {update.project_name}
                        </Link>
                        <span className="text-xs text-text-secondary">by {update.posted_by_name}</span>
                      </div>
                      <p className="text-sm text-text-secondary truncate mt-0.5">{update.update_text}</p>
                    </div>
                    <span className="text-xs text-text-secondary shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Leads Strip */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Recent Leads</CardTitle>
            <Link href="/leads" className="text-xs text-primary hover:text-primary-hover">
              View all →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded" />
              ))}
            </div>
          ) : !dashboard || dashboard.new_leads.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-4">No leads yet</p>
          ) : (
            <div className="space-y-1">
              {dashboard.new_leads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">{lead.full_name}</p>
                    <p className="text-xs text-text-secondary">
                      {lead.phone ? formatPhone(lead.phone) : '—'} · {lead.city ?? 'Unknown city'} · {lead.project_type ?? 'Unknown type'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${lead.status === 'new' ? 'bg-primary/10 text-primary' : 'bg-muted text-text-secondary'}`}>
                      {lead.status}
                    </span>
                    <span className="text-xs text-text-secondary flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
