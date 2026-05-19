'use client'

import { useState, useEffect } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { useDeleteUpdate } from '@/hooks/useUpdates'
import { useAuth } from '@/hooks/useAuth'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, Users } from 'lucide-react'
import type { SiteUpdateWithProfile } from '@/hooks/useUpdates'
import type { WorkerTrade } from '@kalpak/shared'
import type { ProjectWorkerWithWorker } from '@/hooks/useWorkers'

interface UpdateCardProps {
  update: SiteUpdateWithProfile
  projectId: string
  projectWorkers: ProjectWorkerWithWorker[]
}

export function UpdateCard({ update, projectId, projectWorkers }: UpdateCardProps) {
  const { user, isPartner } = useAuth()
  const deleteUpdate = useDeleteUpdate(projectId)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})

  const canDelete = isPartner || update.posted_by === user?.id
  const poster = update.profiles
  const initials = poster?.full_name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() ?? '?'

  const workerNames = update.workers_present.map((wId) => {
    const pw = projectWorkers.find((pw) => pw.worker_id === wId)
    return pw?.workers?.full_name ?? wId.slice(0, 8)
  })

  async function getSignedUrl(path: string): Promise<string> {
    if (signedUrls[path]) return signedUrls[path]
    const supabase = createClient()
    const { data } = await supabase.storage.from('site-photos').createSignedUrl(path, 3600)
    const url = data?.signedUrl ?? ''
    setSignedUrls((prev) => ({ ...prev, [path]: url }))
    return url
  }

  async function handlePhotoClick(path: string) {
    const url = await getSignedUrl(path)
    setLightboxSrc(url)
  }

  return (
    <>
      <div className="bg-white border border-border rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 shrink-0 mt-0.5">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <span className="text-sm font-medium text-text-primary">
                  {poster?.full_name ?? 'Unknown'}
                </span>
                {poster?.role && (
                  <Badge variant="secondary" className="ml-2 text-[10px]">{poster.role}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <time className="text-xs text-text-secondary">
                  {format(new Date(update.update_date), 'dd MMM yyyy')}
                </time>
                <span className="text-xs text-text-secondary">
                  ({formatDistanceToNow(new Date(update.created_at), { addSuffix: true })})
                </span>
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-text-secondary hover:text-danger"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>

            <p className="text-sm text-text-primary mt-2 whitespace-pre-line">{update.update_text}</p>

            {workerNames.length > 0 && (
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Users className="w-3.5 h-3.5 text-text-secondary" />
                <Badge variant="secondary" className="text-xs">
                  {update.worker_count} workers on site
                </Badge>
                {workerNames.slice(0, 5).map((name, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-muted rounded-full text-text-secondary">
                    {name}
                  </span>
                ))}
                {workerNames.length > 5 && (
                  <span className="text-xs text-text-secondary">+{workerNames.length - 5} more</span>
                )}
              </div>
            )}

            {update.photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                {update.photos.map((path, i) => (
                  <PhotoThumb
                    key={i}
                    path={path}
                    onClick={() => handlePhotoClick(path)}
                    getSignedUrl={getSignedUrl}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <img
            src={lightboxSrc}
            alt="Site photo"
            className="max-w-full max-h-full object-contain rounded"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Update"
        description="This will permanently delete this update and its photos."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={async () => {
          await deleteUpdate.mutateAsync(update.id)
        }}
      />
    </>
  )
}

function PhotoThumb({
  path,
  onClick,
  getSignedUrl,
}: {
  path: string
  onClick: () => void
  getSignedUrl: (path: string) => Promise<string>
}) {
  const [src, setSrc] = useState<string>('')

  useEffect(() => {
    let cancelled = false
    getSignedUrl(path).then((url) => {
      if (!cancelled) setSrc(url)
    })
    return () => { cancelled = true }
  }, [path, getSignedUrl])

  if (!src) {
    return <div className="w-full h-20 bg-muted rounded animate-pulse" />
  }

  return (
    <img
      src={src}
      alt=""
      className="w-full h-20 object-cover rounded border border-border cursor-pointer hover:opacity-90 transition-opacity"
      onClick={onClick}
    />
  )
}
