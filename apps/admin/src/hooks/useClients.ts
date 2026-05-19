'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { api, ApiError } from '@/lib/api-client'
import { queryKeys, type ClientFilters } from '@/lib/query-keys'
import { toast } from '@/hooks/use-toast'
import type { Client } from '@kalpak/shared'
import type { CreateClientInput, UpdateClientInput } from '@kalpak/shared'

function buildQuery(filters: ClientFilters): string {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)
  return params.toString()
}

export function useClients(filters: ClientFilters = {}) {
  const { accessToken } = useAuth()
  const qs = buildQuery(filters)
  return useQuery({
    queryKey: queryKeys.clients.list(filters),
    queryFn: () => api.get<{ data: Client[] }>(`/api/clients${qs ? `?${qs}` : ''}`, accessToken),
    enabled: !!accessToken,
  })
}

export function useClient(id: string) {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.clients.detail(id),
    queryFn: () => api.get<{ data: Client & { projects?: unknown[] } }>(`/api/clients/${id}`, accessToken),
    enabled: !!accessToken && !!id,
  })
}

export function useCreateClient() {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateClientInput) =>
      api.post<{ data: Client }>('/api/clients', data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all })
      toast({ title: 'Client created' })
    },
    onError: (error: ApiError) => {
      toast({ title: error.message, variant: 'destructive' })
    },
  })
}

export function useUpdateClient(id: string) {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateClientInput) =>
      api.patch<{ data: Client }>(`/api/clients/${id}`, data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(id) })
      toast({ title: 'Client updated' })
    },
    onError: (error: ApiError) => {
      toast({ title: error.message, variant: 'destructive' })
    },
  })
}
