'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { api, ApiError } from '@/lib/api-client'
import { queryKeys, type LeadFilters } from '@/lib/query-keys'
import { toast } from '@/hooks/use-toast'
import type { Lead } from '@kalpak/shared'
import type { UpdateLeadStatusInput, ConvertLeadInput } from '@kalpak/shared'

function buildQuery(filters: LeadFilters): string {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.search) params.set('search', filters.search)
  if (filters.page) params.set('page', String(filters.page))
  return params.toString()
}

export function useLeads(filters: LeadFilters = {}) {
  const { accessToken } = useAuth()
  const qs = buildQuery(filters)
  return useQuery({
    queryKey: queryKeys.leads.list(filters),
    queryFn: () => api.get<{ data: Lead[] }>(`/api/leads${qs ? `?${qs}` : ''}`, accessToken),
    enabled: !!accessToken,
  })
}

export function useUpdateLeadStatus() {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadStatusInput }) =>
      api.patch<{ data: Lead }>(`/api/leads/${id}/status`, data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all })
    },
    onError: (error: ApiError) => {
      toast({ title: error.message, variant: 'destructive' })
    },
  })
}

export function useConvertLead() {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConvertLeadInput & { create_project?: boolean; project_name?: string; project_type?: string } }) =>
      api.post<{ data: { lead: Lead; client: unknown } }>(`/api/leads/${id}/convert`, data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
      toast({ title: 'Lead converted to client' })
    },
    onError: (error: ApiError) => {
      toast({ title: error.message, variant: 'destructive' })
    },
  })
}
