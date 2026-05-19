'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api-client'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import type { SiteUpdate } from '@kalpak/shared'

type RecentUpdate = SiteUpdate & {
  profiles?: { full_name: string } | null
  projects?: { id: string; name: string } | null
}

export function RecentActivityFeed() {
  const { accessToken } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'recent-activity'],
    queryFn: () =>
      api.get<{ data: RecentUpdate[] }>('/api/updates/recent?limit=10', accessToken),
    enabled: !!accessToken,
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-md" />
        ))}
      </div>
    )
  }

  const updates = data?.data ?? []

  if (updates.length === 0) {
    return (
      <p className="text-sm text-text-secondary py-4 text-center">No recent activity</p>
    )
  }

  return (
    <div className="space-y-2">
      {updates.map((update) => (
        <Link
          key={update.id}
          href={`/projects/${update.project_id}/updates`}
          className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors group"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-text-primary">
                {update.projects?.name ?? 'Unknown project'}
              </span>
              <span className="text-xs text-text-secondary">
                by {update.profiles?.full_name ?? 'Unknown'}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
              {update.update_text.slice(0, 100)}
            </p>
          </div>
          <span className="text-[10px] text-text-secondary shrink-0 whitespace-nowrap">
            {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
          </span>
        </Link>
      ))}
      <Link
        href="/projects"
        className="block text-xs text-primary hover:text-primary-hover text-center pt-2"
      >
        View all activity →
      </Link>
    </div>
  )
}
