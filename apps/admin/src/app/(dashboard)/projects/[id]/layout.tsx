'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useProject } from '@/hooks/useProjects'
import { ProjectHeader } from '@/components/projects/ProjectHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const TABS = [
  { label: 'Overview', href: '' },
  { label: 'Workers', href: '/workers' },
  { label: 'Updates', href: '/updates' },
  { label: 'Documents', href: '/documents' },
]

export default function ProjectDetailLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>()
  const pathname = usePathname()
  const { data, isLoading } = useProject(id)
  const project = data?.data

  function tabHref(suffix: string) {
    return `/projects/${id}${suffix}`
  }

  function isActiveTab(suffix: string) {
    const full = tabHref(suffix)
    if (suffix === '') return pathname === full
    return pathname.startsWith(full)
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="text-xs text-text-secondary mb-4">
        <Link href="/projects" className="hover:text-text-primary">Projects</Link>
        <span className="mx-2">›</span>
        <span className="text-text-primary">{project?.name ?? '…'}</span>
      </nav>

      {isLoading || !project ? (
        <div className="space-y-3 mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      ) : (
        <ProjectHeader project={project} />
      )}

      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <nav className="flex gap-0 -mb-px">
          {TABS.map((tab) => {
            const active = isActiveTab(tab.href)
            return (
              <Link
                key={tab.href}
                href={tabHref(tab.href)}
                className={cn(
                  'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                  active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {children}
    </div>
  )
}
