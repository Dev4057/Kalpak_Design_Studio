'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { api, ApiError } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { toast } from '@/hooks/use-toast'
import type { SiteUpdate, Profile } from '@kalpak/shared'
import type { CreateSiteUpdateInput, UpdateSiteUpdateInput } from '@kalpak/shared'

export type SiteUpdateWithProfile = SiteUpdate & {
  profiles?: Pick<Profile, 'full_name' | 'avatar_url' | 'role'> | null
}

type UpdatesResponse = {
  data: SiteUpdateWithProfile[]
  total: number
  page: number
  limit: number
}

export function useProjectUpdates(projectId: string, page = 1) {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: [...queryKeys.projects.updates(projectId), page],
    queryFn: () =>
      api.get<UpdatesResponse>(
        `/api/projects/${projectId}/updates?page=${page}&limit=20`,
        accessToken
      ),
    enabled: !!accessToken && !!projectId,
  })
}

export function useCreateUpdate(projectId: string) {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<CreateSiteUpdateInput, 'project_id'>) =>
      api.post<{ data: SiteUpdate }>(`/api/projects/${projectId}/updates`, data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.updates(projectId) })
      toast({ title: 'Update posted' })
    },
    onError: (error: ApiError) => {
      toast({ title: error.message, variant: 'destructive' })
    },
  })
}

export function useUpdateSiteUpdate() {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSiteUpdateInput }) =>
      api.patch<{ data: SiteUpdate }>(`/api/updates/${id}`, data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
      toast({ title: 'Update edited' })
    },
    onError: (error: ApiError) => {
      toast({ title: error.message, variant: 'destructive' })
    },
  })
}

export function useDeleteUpdate(projectId: string) {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<void>(`/api/updates/${id}`, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.updates(projectId) })
      toast({ title: 'Update deleted' })
    },
    onError: (error: ApiError) => {
      toast({ title: error.message, variant: 'destructive' })
    },
  })
}
