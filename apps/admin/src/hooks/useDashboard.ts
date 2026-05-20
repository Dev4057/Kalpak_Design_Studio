'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { api } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import type { Lead } from '@kalpak/shared'

export type DashboardData = {
  stats: {
    active_projects: number
    new_leads_this_month: number
    workers_on_site: number
    total_spent_this_month: number
  }
  project_status_breakdown: Array<{ status: string; count: number }>
  recent_activity: Array<{
    id: string
    project_id: string
    project_name: string
    posted_by_name: string
    update_text: string
    update_date: string
    created_at: string
  }>
  new_leads: Lead[]
  budget_alerts: Array<{
    project_id: string
    project_name: string
    utilization_percent: number
    remaining_budget: number
  }>
}

export function useDashboard() {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => api.get<{ data: DashboardData }>('/api/dashboard', accessToken),
    enabled: !!accessToken,
  })
}
