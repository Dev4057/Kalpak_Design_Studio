'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { RoleGuard } from '@/components/shared/RoleGuard'
import { useProjects } from '@/hooks/useProjects'
import { useAuth } from '@/hooks/useAuth'
import { FolderOpen } from 'lucide-react'
import type { ProjectStatus } from '@kalpak/shared'
import { cn } from '@/lib/utils'

const STATUS_TABS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Lead', value: 'lead' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Snagging', value: 'snagging' },
  { label: 'Completed', value: 'completed' },
  { label: 'On Hold', value: 'on_hold' },
]

export default function ProjectsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isPartner } = useAuth()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const status = (searchParams.get('status') ?? '') as ProjectStatus | ''

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading } = useProjects({
    status: status || undefined,
    search: debouncedSearch || undefined,
  })

  const projects = data?.data ?? []

  function setStatus(s: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (s) params.set('status', s)
    else params.delete('status')
    router.push(`/projects?${params.toString()}`)
  }

  return (
    <div>
      <PageHeader
        title="Projects"
        action={
          <RoleGuard allowedRoles={['partner']}>
            <Button onClick={() => router.push('/projects/new')} size="sm">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </RoleGuard>
        }
      />

      {/* Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex gap-1 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-full transition-colors',
                status === tab.value
                  ? 'bg-primary text-white'
                  : 'bg-muted text-text-secondary hover:text-text-primary'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <Input
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No projects found"
          description={
            isPartner
              ? 'Create your first project to get started.'
              : "You haven't been assigned to any projects yet."
          }
          action={
            isPartner
              ? { label: 'Create Project', onClick: () => router.push('/projects/new') }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
