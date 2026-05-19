'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useProjectUpdates } from '@/hooks/useUpdates'
import { useProjectWorkers } from '@/hooks/useWorkers'
import { PostUpdateForm } from '@/components/updates/PostUpdateForm'
import { UpdateCard } from '@/components/updates/UpdateCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'

export default function ProjectUpdatesPage() {
  const { id } = useParams<{ id: string }>()
  const [page, setPage] = useState(1)
  const { data, isLoading } = useProjectUpdates(id, page)
  const { data: workersData } = useProjectWorkers(id)

  const updates = data?.data ?? []
  const total = data?.total ?? 0
  const hasMore = updates.length < total
  const projectWorkers = workersData?.data ?? []

  return (
    <div>
      <PostUpdateForm projectId={id} />

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))
        ) : updates.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No updates yet"
            description="Post the first site update above."
          />
        ) : (
          <>
            {updates.map((update) => (
              <UpdateCard
                key={update.id}
                update={update}
                projectId={id}
                projectWorkers={projectWorkers}
              />
            ))}
            {hasMore && (
              <div className="text-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={isLoading}
                >
                  Load more updates
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
