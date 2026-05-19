'use client'

import { useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { api, ApiError } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { toast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { RoleGuard } from '@/components/shared/RoleGuard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileText, Upload, Download, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import type { ProjectDocument, DocumentFileType } from '@kalpak/shared'

const MAX_DOC_SIZE = 50 * 1024 * 1024

const FILE_TYPE_LABELS: Record<DocumentFileType, string> = {
  drawing: 'Drawing', boq: 'BOQ', contract: 'Contract',
  proposal: 'Proposal', invoice: 'Invoice', photo: 'Photo', other: 'Other',
}

type DocumentWithProfile = ProjectDocument & {
  profiles?: { full_name: string } | null
}

export default function ProjectDocumentsPage() {
  const { id } = useParams<{ id: string }>()
  const { accessToken, isPartner } = useAuth()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [typeFilter, setTypeFilter] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.projects.documents(id),
    queryFn: () => api.get<{ data: DocumentWithProfile[] }>(`/api/projects/${id}/documents`, accessToken),
    enabled: !!accessToken,
  })

  const deleteDoc = useMutation({
    mutationFn: (docId: string) => api.delete<void>(`/api/documents/${docId}`, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.documents(id) })
      toast({ title: 'Document deleted' })
    },
    onError: (error: ApiError) => {
      toast({ title: error.message, variant: 'destructive' })
    },
  })

  const documents = (data?.data ?? []).filter(
    (d) => typeFilter === 'all' || d.file_type === typeFilter
  )

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_DOC_SIZE) {
      toast({ title: 'File exceeds 50MB limit', variant: 'destructive' })
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
      let fileType: DocumentFileType = 'other'
      if (ext === 'pdf') fileType = 'proposal'
      if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) fileType = 'photo'

      const response = await api.post<{
        data: { document: ProjectDocument; upload_url: string; token: string }
      }>(
        `/api/projects/${id}/documents`,
        {
          file_name: file.name,
          file_type: fileType,
          file_size_bytes: file.size,
          content_type: file.type,
        },
        accessToken
      )

      const { upload_url } = response.data

      await fetch(upload_url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })

      queryClient.invalidateQueries({ queryKey: queryKeys.projects.documents(id) })
      toast({ title: 'Document uploaded' })
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : 'Upload failed', variant: 'destructive' })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDownload(doc: DocumentWithProfile) {
    const supabase = createClient()
    const path = doc.file_url.split('/project-documents/')[1]
    if (!path) return
    const { data } = await supabase.storage
      .from('project-documents')
      .createSignedUrl(path, 60)
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
  }

  function formatBytes(bytes: number | null): string {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-medium text-text-primary">Documents</h2>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {Object.entries(FILE_TYPE_LABELS).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading…' : 'Upload File'}
        </Button>
        <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" />
      </div>

      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-border rounded-lg p-6 text-center mb-4 hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <FileText className="w-8 h-8 mx-auto text-text-secondary mb-2" />
        <p className="text-sm text-text-secondary">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-xs text-text-secondary mt-1">Max file size: 50MB</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Upload drawings, proposals, contracts, and more."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium text-sm">{doc.file_name}</TableCell>
                <TableCell>
                  {doc.file_type && (
                    <Badge variant="secondary" className="text-xs">
                      {FILE_TYPE_LABELS[doc.file_type]}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-text-secondary text-sm">
                  {formatBytes(doc.file_size_bytes)}
                </TableCell>
                <TableCell className="text-text-secondary text-sm">
                  {doc.profiles?.full_name ?? '—'}
                </TableCell>
                <TableCell className="text-text-secondary text-sm">
                  {format(new Date(doc.created_at), 'dd MMM yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDownload(doc)}
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <RoleGuard allowedRoles={['partner']}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-danger hover:text-danger hover:bg-danger/5"
                        onClick={() => setDeleteTarget(doc.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </RoleGuard>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Document"
        description="This will permanently delete this document."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={async () => {
          if (deleteTarget) await deleteDoc.mutateAsync(deleteTarget)
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}
