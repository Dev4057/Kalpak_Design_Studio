'use client'

import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@kalpak/shared'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { role, isLoading } = useAuth()
  if (isLoading) return null
  if (!role || !allowedRoles.includes(role)) return <>{fallback}</>
  return <>{children}</>
}
