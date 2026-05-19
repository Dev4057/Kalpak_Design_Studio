'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { api, ApiError } from '@/lib/api-client'
import { queryKeys, type ProjectFilters } from '@/lib/query-keys'
import { toast } from '@/hooks/use-toast'
import type { Project, Profile, Client } from '@kalpak/shared'
import type { CreateProjectInput, UpdateProjectInput, AssignUserInput } from '@kalpak/shared'

export type ProjectWithRelations = Project & {
  clients?: Pick<Client, 'full_name' | 'phone'> | null
  project_assignments?: Array<{
    id: string
    user_id: string
    role_in_project: string | null
    profiles?: Pick<Profile, 'full_name' | 'email' | 'role' | 'avatar_url'> | null
  }>
}

type ProjectsResponse = {
  data: ProjectWithRelations[]
  total: number
  page?: number
}

function buildQuery(filters: ProjectFilters): string {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.search) params.set('search', filters.search)
  if (filters.page) params.set('page', String(filters.page))
  return params.toString()
}

export function useProjects(filters: ProjectFilters = {}) {
  const { accessToken } = useAuth()
  const qs = buildQuery(filters)
  return useQuery({
    queryKey: queryKeys.projects.list(filters),
    queryFn: () => api.get<ProjectsResponse>(`/api/projects${qs ? `?${qs}` : ''}`, accessToken),
    enabled: !!accessToken,
  })
}

export function useProject(id: string) {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => api.get<{ data: ProjectWithRelations }>(`/api/projects/${id}`, accessToken),
    enabled: !!accessToken && !!id,
  })
}

export function useCreateProject() {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProjectInput) =>
      api.post<{ data: Project }>('/api/projects', data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
      toast({ title: 'Project created successfully' })
    },
    onError: (error: ApiError) => {
      toast({ title: error.message, variant: 'destructive' })
    },
  })
}

export function useUpdateProject(id: string) {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateProjectInput) =>
      api.patch<{ data: Project }>(`/api/projects/${id}`, data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
      toast({ title: 'Project updated' })
    },
    onError: (error: ApiError) => {
      toast({ title: error.message, variant: 'destructive' })
    },
  })
}

export function useAssignUser(projectId: string) {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AssignUserInput) =>
      api.post<{ data: unknown }>(`/api/projects/${projectId}/assign`, data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) })
      toast({ title: 'Team member assigned' })
    },
    onError: (error: ApiError) => {
      toast({ title: error.message, variant: 'destructive' })
    },
  })
}

export function useRemoveAssignment(projectId: string) {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) =>
      api.delete<void>(`/api/projects/${projectId}/assign/${userId}`, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) })
      toast({ title: 'Team member removed' })
    },
    onError: (error: ApiError) => {
      toast({ title: error.message, variant: 'destructive' })
    },
  })
}
