'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function RootDashboardPage() {
  const { role, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (role === 'partner') {
      router.replace('/dashboard')
    } else {
      router.replace('/projects')
    }
  }, [role, isLoading, router])

  return null
}
