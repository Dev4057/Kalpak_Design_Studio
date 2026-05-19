'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import { useLeads } from '@/hooks/useLeads'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FolderOpen,
  Users,
  HardHat,
  CreditCard,
  Clock,
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { formatPhone } from '@kalpak/shared'

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

  useEffect(() => {
    if (!authLoading && role === 'employee') {
      router.replace('/projects')
    }
  }, [role, authLoading, router])

  const { data: projectsData, isLoading: projectsLoading } = useProjects()
  const { data: leadsData, isLoading: leadsLoading } = useLeads()

  const projects = projectsData?.data ?? []
  const leads = leadsData?.data ?? []

  const activeProjects = projects.filter((p) =>
    ['confirmed', 'in_progress', 'snagging'].includes(p.status)
  ).length

  const thisMonth = new Date()
  thisMonth.setDate(1)
  const newLeadsThisMonth = leads.filter(
    (l) => new Date(l.created_at) >= thisMonth
  ).length

  const statusCounts: Record<string, number> = {}
  projects.forEach((p) => {
    statusCounts[p.status] = (statusCounts[p.status] ?? 0) + 1
  })

  const recentLeads = leads.slice(0, 5)

  if (authLoading || role === 'employee') return null

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of Kalpak Design Studio" />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {projectsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))
        ) : (
          <>
            <StatsCard
              title="Active Projects"
              value={activeProjects}
              icon={FolderOpen}
              subtitle="Confirmed + In Progress + Snagging"
            />
            <StatsCard
              title="New Leads This Month"
              value={newLeadsThisMonth}
              icon={Users}
            />
            <StatsCard
              title="Workers on Site"
              value="—"
              icon={HardHat}
              subtitle="Across active projects"
            />
            <StatsCard
              title="Pending Payments"
              value="—"
              icon={CreditCard}
              subtitle="Coming in Phase 4"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Status Overview */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Project Status</CardTitle>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(STATUS_LABELS).map(([status, label]) => {
                  const count = statusCounts[status] ?? 0
                  return (
                    <Link
                      key={status}
                      href={`/projects?status=${status}`}
                      className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]}`}
                        />
                        <span className="text-sm text-text-secondary group-hover:text-text-primary">
                          {label}
                        </span>
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
            <RecentActivityFeed />
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
          {leadsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded" />
              ))}
            </div>
          ) : recentLeads.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-4">No leads yet</p>
          ) : (
            <div className="space-y-1">
              {recentLeads.map((lead) => (
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
