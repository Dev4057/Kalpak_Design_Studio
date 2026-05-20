'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { api } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'

export type ReportsOverview = {
  this_month: {
    total_worker_payments: number
    total_vendor_payments: number
    total_spent: number
    new_leads: number
    projects_completed: number
  }
  last_month: {
    total_worker_payments: number
    total_vendor_payments: number
    total_spent: number
    new_leads: number
    projects_completed: number
  }
  by_project: Array<{
    project_id: string
    project_name: string
    client_name: string
    total_budget: number | null
    total_spent: number
    budget_utilization_percent: number | null
    status: string
  }>
  top_workers_by_payment: Array<{
    worker_id: string
    worker_name: string
    trade: string
    total_paid: number
  }>
  monthly_spend_trend: Array<{
    month: string
    worker_payments: number
    vendor_payments: number
  }>
}

export function useReportsOverview() {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.reports.overview,
    queryFn: () => api.get<{ data: ReportsOverview }>('/api/reports/overview', accessToken),
    enabled: !!accessToken,
  })
}
