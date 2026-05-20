'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { api, ApiError } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { toast } from '@/hooks/use-toast'
import type { TeamMember, InviteEmployeeInput } from '@kalpak/shared'

export function useTeamMembers() {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.team.list(),
    queryFn: () => api.get<{ data: TeamMember[] }>('/api/team', accessToken!),
    enabled: !!accessToken,
  })
}

export function useInviteEmployee() {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: InviteEmployeeInput) =>
      api.post<{ message: string }>('/api/team/invite', data, accessToken!),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all })
      toast({ title: `Invite sent to ${vars.email}. They will receive an email to set their password.` })
    },
    onError: (error: ApiError) => {
      if (error.status === 409) {
        toast({ title: 'An account with this email already exists', variant: 'destructive' })
      } else {
        toast({ title: error.message, variant: 'destructive' })
      }
    },
  })
}

export function useUpdateMemberStatus() {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, is_active }: { userId: string; is_active: boolean }) =>
      api.patch<{ data: TeamMember }>(`/api/team/${userId}/status`, { is_active }, accessToken!),
    onMutate: async ({ userId, is_active }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.team.list() })
      const previous = queryClient.getQueryData<{ data: TeamMember[] }>(queryKeys.team.list())
      queryClient.setQueryData<{ data: TeamMember[] }>(queryKeys.team.list(), (old) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.map((m) => m.id === userId ? { ...m, is_active } : m),
        }
      })
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.team.list(), context.previous)
      }
      toast({ title: 'Failed to update status', variant: 'destructive' })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all })
    },
  })
}
