'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { api, ApiError } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { toast } from '@/hooks/use-toast'
import type {
  WorkerPayment, VendorPayment, ProjectFinancialSummary, WorkerPaymentSummary,
  CreateWorkerPaymentInput, CreateVendorPaymentInput,
} from '@kalpak/shared'

export type WorkerPaymentsResponse = {
  data: WorkerPayment[]
  worker_summaries: WorkerPaymentSummary[]
}

export type VendorPaymentsResponse = {
  data: VendorPayment[]
}

export type FinancialSummaryResponse = {
  data: ProjectFinancialSummary
}

export function useProjectFinancialSummary(projectId: string) {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.financials.summary(projectId),
    queryFn: () => api.get<FinancialSummaryResponse>(`/api/projects/${projectId}/payments/summary`, accessToken),
    enabled: !!accessToken && !!projectId,
  })
}

export function useWorkerPayments(projectId: string) {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.financials.workerPayments(projectId),
    queryFn: () => api.get<WorkerPaymentsResponse>(`/api/projects/${projectId}/payments/workers`, accessToken),
    enabled: !!accessToken && !!projectId,
  })
}

export function useVendorPayments(projectId: string) {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.financials.vendorPayments(projectId),
    queryFn: () => api.get<VendorPaymentsResponse>(`/api/projects/${projectId}/payments/vendors`, accessToken),
    enabled: !!accessToken && !!projectId,
  })
}

export function useAddWorkerPayment(projectId: string) {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateWorkerPaymentInput) =>
      api.post<{ data: WorkerPayment }>(`/api/projects/${projectId}/payments/workers`, data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.financials.workerPayments(projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.financials.summary(projectId) })
      toast({ title: 'Payment recorded' })
    },
    onError: (error: ApiError) => {
      toast({ title: error.message, variant: 'destructive' })
    },
  })
}

export function useAddVendorPayment(projectId: string) {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateVendorPaymentInput) =>
      api.post<{ data: VendorPayment }>(`/api/projects/${projectId}/payments/vendors`, data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.financials.vendorPayments(projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.financials.summary(projectId) })
      toast({ title: 'Vendor payment recorded' })
    },
    onError: (error: ApiError) => {
      toast({ title: error.message, variant: 'destructive' })
    },
  })
}

export function useDeleteWorkerPayment(projectId: string) {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (paymentId: string) =>
      api.delete<void>(`/api/payments/workers/${paymentId}`, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.financials.workerPayments(projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.financials.summary(projectId) })
      toast({ title: 'Payment deleted' })
    },
    onError: (error: ApiError) => {
      toast({ title: error.message, variant: 'destructive' })
    },
  })
}

export function useDeleteVendorPayment(projectId: string) {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (paymentId: string) =>
      api.delete<void>(`/api/payments/vendors/${paymentId}`, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.financials.vendorPayments(projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.financials.summary(projectId) })
      toast({ title: 'Vendor payment deleted' })
    },
    onError: (error: ApiError) => {
      toast({ title: error.message, variant: 'destructive' })
    },
  })
}
