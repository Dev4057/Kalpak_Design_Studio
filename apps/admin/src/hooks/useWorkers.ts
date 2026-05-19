'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { api, ApiError } from '@/lib/api-client'
import { queryKeys, type WorkerFilters } from '@/lib/query-keys'
import { toast } from '@/hooks/use-toast'
import type { Worker, ProjectWorker } from '@kalpak/shared'
import type { CreateWorkerInput, UpdateWorkerInput, AddWorkerToProjectInput } from '@kalpak/shared'

export type ProjectWorkerWithWorker = ProjectWorker & {
  workers?: Worker | null
}

function buildQuery(filters: WorkerFilters): string {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.trade) params.set('trade', filters.trade)
  if (filters.is_active !== undefined) params.set('is_active', String(filters.is_active))
  return params.toString()
}

export function useWorkers(filters: WorkerFilters = {}) {
  const { accessToken } = useAuth()
  const qs = buildQuery(filters)
  return useQuery({
    queryKey: queryKeys.workers.list(filters),
    queryFn: () => api.get<{ data: Worker[] }>(`/api/workers${qs ? `?${qs}` : ''}`, accessToken),
    enabled: !!accessToken,
  })
}

export function useProjectWorkers(projectId: string) {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.projects.workers(projectId),
    queryFn: () =>
      api.get<{ data: ProjectWorkerWithWorker[] }>(`/api/projects/${projectId}/workers`, accessToken),
    enabled: !!accessToken && !!projectId,
  })
}

export function useCreateWorker() {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateWorkerInput) =>
      api.post<{ data: Worker }>('/api/workers', data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workers.all })
      toast({ title: 'Worker created' })
    },
    onError: (error: ApiError) => {
      toast({ title: error.message, variant: 'destructive' })
    },
  })
}

export function useUpdateWorker(id: string) {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateWorkerInput) =>
      api.patch<{ data: Worker }>(`/api/workers/${id}`, data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workers.all })
      toast({ title: 'Worker updated' })
    },
    onError: (error: ApiError) => {
      toast({ title: error.message, variant: 'destructive' })
    },
  })
}

export function useAddWorkerToProject(projectId: string) {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AddWorkerToProjectInput) =>
      api.post<{ data: ProjectWorkerWithWorker }>(`/api/projects/${projectId}/workers`, data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.workers(projectId) })
      toast({ title: 'Worker added to project' })
    },
    onError: (error: ApiError) => {
      toast({ title: error.message, variant: 'destructive' })
    },
  })
}

export function useRemoveWorkerFromProject(projectId: string) {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (workerId: string) =>
      api.delete<void>(`/api/projects/${projectId}/workers/${workerId}`, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.workers(projectId) })
      toast({ title: 'Worker removed from project' })
    },
    onError: (error: ApiError) => {
      toast({ title: error.message, variant: 'destructive' })
    },
  })
}
