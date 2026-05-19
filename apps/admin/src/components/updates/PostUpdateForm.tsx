'use client'

import { useState, useRef } from 'react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { useCreateUpdate } from '@/hooks/useUpdates'
import { useProjectWorkers } from '@/hooks/useWorkers'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ImagePlus, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import type { WorkerTrade } from '@kalpak/shared'

const MAX_PHOTO_SIZE = 10 * 1024 * 1024 // 10MB

interface PostUpdateFormProps {
  projectId: string
}

interface PhotoPreview {
  file: File
  preview: string
  error?: string
  uploading?: boolean
}

export function PostUpdateForm({ projectId }: PostUpdateFormProps) {
  const [updateText, setUpdateText] = useState('')
  const [workersPresent, setWorkersPresent] = useState<string[]>([])
  const [workerCount, setWorkerCount] = useState(0)
  const [updateDate, setUpdateDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [photos, setPhotos] = useState<PhotoPreview[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const createUpdate = useCreateUpdate(projectId)
  const { data: workersData } = useProjectWorkers(projectId)
  const projectWorkers = workersData?.data ?? []

  function handleWorkerToggle(workerId: string, checked: boolean) {
    setWorkersPresent((prev) => {
      const next = checked ? [...prev, workerId] : prev.filter((id) => id !== workerId)
      setWorkerCount(next.length)
      return next
    })
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const newPhotos: PhotoPreview[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      error: file.size > MAX_PHOTO_SIZE ? 'File exceeds 10MB limit' : undefined,
    }))
    setPhotos((prev) => [...prev, ...newPhotos])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  async function uploadPhoto(photo: PhotoPreview, projectId: string): Promise<string> {
    const supabase = createClient()
    const ext = photo.file.name.split('.').pop() ?? 'jpg'
    const fileName = `${projectId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { data, error } = await supabase.storage
      .from('site-photos')
      .upload(fileName, photo.file, { cacheControl: '3600', upsert: false })
    if (error) throw new Error(error.message)
    return data.path
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!updateText.trim()) return

    const invalidPhotos = photos.filter((p) => p.error)
    if (invalidPhotos.length > 0) {
      toast({ title: 'Please remove invalid photos before submitting', variant: 'destructive' })
      return
    }

    let uploadedPaths: string[] = []
    if (photos.length > 0) {
      setPhotos((prev) => prev.map((p) => ({ ...p, uploading: true })))
      try {
        uploadedPaths = await Promise.all(photos.map((p) => uploadPhoto(p, projectId)))
      } catch {
        toast({ title: 'Photo upload failed', variant: 'destructive' })
        setPhotos((prev) => prev.map((p) => ({ ...p, uploading: false })))
        return
      }
      setPhotos((prev) => prev.map((p) => ({ ...p, uploading: false })))
    }

    await createUpdate.mutateAsync({
      update_text: updateText,
      workers_present: workersPresent,
      worker_count: workerCount,
      update_date: updateDate,
      photos: uploadedPaths,
    })

    setUpdateText('')
    setWorkersPresent([])
    setWorkerCount(0)
    setUpdateDate(format(new Date(), 'yyyy-MM-dd'))
    photos.forEach((p) => URL.revokeObjectURL(p.preview))
    setPhotos([])
  }

  const isSubmitting = createUpdate.isPending || photos.some((p) => p.uploading)

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-border p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm text-text-primary">Today&apos;s Update</h3>
        <span className="text-xs text-text-secondary">{format(new Date(), 'dd MMM yyyy')}</span>
      </div>

      <div className="space-y-3">
        <Textarea
          value={updateText}
          onChange={(e) => setUpdateText(e.target.value)}
          placeholder="What happened on site today?"
          rows={3}
          required
        />

        {/* Workers present */}
        {projectWorkers.length > 0 && (
          <div>
            <Label className="text-xs mb-2 block">Workers Present</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-32 overflow-y-auto">
              {projectWorkers.map((pw) => {
                const worker = pw.workers
                if (!worker) return null
                return (
                  <label key={pw.worker_id} className="flex items-center gap-2 text-xs cursor-pointer">
                    <Checkbox
                      checked={workersPresent.includes(pw.worker_id)}
                      onCheckedChange={(checked) => handleWorkerToggle(pw.worker_id, !!checked)}
                    />
                    <span className="truncate">{worker.full_name}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <Label htmlFor="worker-count" className="text-xs">Worker Count</Label>
            <Input
              id="worker-count"
              type="number"
              min={0}
              value={workerCount}
              onChange={(e) => setWorkerCount(parseInt(e.target.value, 10) || 0)}
              className="w-20 h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="update-date" className="text-xs">Date</Label>
            <Input
              id="update-date"
              type="date"
              value={updateDate}
              onChange={(e) => setUpdateDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="h-8 text-sm"
            />
          </div>
        </div>

        {/* Photo upload */}
        <div>
          <Label className="text-xs mb-2 block">Photos</Label>
          <div
            className="border-2 border-dashed border-border rounded-md p-3 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="w-5 h-5 mx-auto text-text-secondary mb-1" />
            <p className="text-xs text-text-secondary">Click to add photos (max 10MB each)</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
              {photos.map((photo, i) => (
                <div key={i} className="relative group">
                  <img
                    src={photo.preview}
                    alt=""
                    className={`w-full h-20 object-cover rounded border ${photo.error ? 'border-danger' : 'border-border'}`}
                  />
                  {photo.uploading && (
                    <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                      <LoadingSpinner className="text-white" />
                    </div>
                  )}
                  {photo.error && (
                    <p className="text-[10px] text-danger mt-0.5 text-center">{photo.error}</p>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removePhoto(i) }}
                    className="absolute -top-1.5 -right-1.5 bg-danger text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting || !updateText.trim()} className="mt-4">
        {isSubmitting && <LoadingSpinner className="mr-2 h-4 w-4" />}
        Post Update
      </Button>
    </form>
  )
}
