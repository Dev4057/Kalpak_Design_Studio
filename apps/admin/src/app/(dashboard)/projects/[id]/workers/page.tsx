'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useProjectWorkers, useRemoveWorkerFromProject } from '@/hooks/useWorkers'
import { AddWorkerDialog } from '@/components/workers/AddWorkerDialog'
import { WorkerTradeBadge } from '@/components/workers/WorkerTradeBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { HardHat, Plus, Trash2 } from 'lucide-react'
import { formatPhone } from '@kalpak/shared'
import type { WorkerTrade } from '@kalpak/shared'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function ProjectWorkersPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useProjectWorkers(id)
  const removeWorker = useRemoveWorkerFromProject(id)
  const [addOpen, setAddOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<string | null>(null)

  const projectWorkers = data?.data ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-medium text-text-primary">Site Workers</h2>
          <Badge variant="secondary">{projectWorkers.length}</Badge>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Worker
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded" />
          ))}
        </div>
      ) : projectWorkers.length === 0 ? (
        <EmptyState
          icon={HardHat}
          title="No workers added"
          description="Add your first worker to this project."
          action={{ label: 'Add Worker', onClick: () => setAddOpen(true) }}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Trade</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Workers Needed</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectWorkers.map((pw) => {
              const worker = pw.workers
              if (!worker) return null
              return (
                <TableRow key={pw.id}>
                  <TableCell className="font-medium">{worker.full_name}</TableCell>
                  <TableCell>
                    <WorkerTradeBadge trade={worker.trade as WorkerTrade} />
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {formatPhone(worker.phone)}
                  </TableCell>
                  <TableCell>{pw.workers_needed}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={pw.is_active
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-gray-50 text-gray-500 border-gray-200'}
                    >
                      {pw.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-danger hover:text-danger hover:bg-danger/5"
                      onClick={() => setRemoveTarget(pw.worker_id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

      <AddWorkerDialog
        projectId={id}
        open={addOpen}
        onOpenChange={setAddOpen}
      />

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove Worker"
        description="Remove this worker from the project? Their payment history will be preserved."
        confirmLabel="Remove"
        variant="danger"
        onConfirm={async () => {
          if (removeTarget) {
            await removeWorker.mutateAsync(removeTarget)
          }
          setRemoveTarget(null)
        }}
      />
    </div>
  )
}
