'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/shared/PageHeader'
import { CreateProjectForm } from '@/components/projects/CreateProjectForm'
import { Card, CardContent } from '@/components/ui/card'

export default function NewProjectPage() {
  const { role, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && role !== 'partner') {
      router.replace('/projects')
    }
  }, [role, isLoading, router])

  if (isLoading || role !== 'partner') return null

  return (
    <div>
      <PageHeader
        title="New Project"
        breadcrumbs={[{ label: 'Projects', href: '/projects' }, { label: 'New' }]}
      />
      <Card className="max-w-3xl">
        <CardContent className="p-6">
          <CreateProjectForm />
        </CardContent>
      </Card>
    </div>
  )
}
