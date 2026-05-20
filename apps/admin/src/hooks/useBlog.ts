'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { api, ApiError } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { toast } from '@/hooks/use-toast'
import type { BlogPost, CreateBlogPostInput, UpdateBlogPostInput } from '@kalpak/shared'

export function useBlogPosts() {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.blog.list(),
    queryFn: () => api.get<{ data: BlogPost[] }>('/api/blog', accessToken),
    enabled: !!accessToken,
  })
}

export function useBlogPost(id: string) {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.blog.detail(id),
    queryFn: () => api.get<{ data: BlogPost }>(`/api/blog/${id}`, accessToken),
    enabled: !!accessToken && !!id,
  })
}

export function useCreateBlogPost() {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBlogPostInput) =>
      api.post<{ data: BlogPost }>('/api/blog', data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.all })
      toast({ title: 'Post created' })
    },
    onError: (error: ApiError) => {
      toast({ title: error.message, variant: 'destructive' })
    },
  })
}

export function useUpdateBlogPost(id: string) {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateBlogPostInput) =>
      api.patch<{ data: BlogPost }>(`/api/blog/${id}`, data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.all })
      toast({ title: 'Post updated' })
    },
    onError: (error: ApiError) => {
      toast({ title: error.message, variant: 'destructive' })
    },
  })
}

export function useDeleteBlogPost() {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/api/blog/${id}`, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.all })
      toast({ title: 'Post deleted' })
    },
    onError: (error: ApiError) => {
      toast({ title: error.message, variant: 'destructive' })
    },
  })
}
