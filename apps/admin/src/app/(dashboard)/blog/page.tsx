'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useBlogPosts, useDeleteBlogPost } from '@/hooks/useBlog'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function BlogListPage() {
  const { role, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { data, isLoading } = useBlogPosts()
  const deletePost = useDeleteBlogPost()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && role !== 'partner') router.replace('/projects')
  }, [role, authLoading, router])

  if (authLoading || role !== 'partner') return null

  const posts = data?.data ?? []

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <PageHeader title="Blog" description="Manage insights and articles for the public website" />
        <Button asChild>
          <Link href="/blog/new">
            <Plus className="w-4 h-4 mr-2" /> New Post
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-lg">
          <p className="text-sm text-text-secondary mb-3">No blog posts yet</p>
          <Button asChild variant="outline">
            <Link href="/blog/new">Write your first post</Link>
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Reading Time</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <Link href={`/blog/${post.id}`} className="font-medium text-sm hover:text-primary">
                    {post.title}
                  </Link>
                  <p className="text-xs text-text-secondary truncate max-w-xs mt-0.5">{post.excerpt}</p>
                </TableCell>
                <TableCell>
                  {post.is_published ? (
                    <Badge className="bg-success/10 text-success border-0 gap-1">
                      <Eye className="w-3 h-3" /> Published
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-text-secondary gap-1">
                      <EyeOff className="w-3 h-3" /> Draft
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(post.tags ?? []).slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-text-secondary">
                  {post.reading_time_minutes ? `${post.reading_time_minutes} min` : '—'}
                </TableCell>
                <TableCell className="text-sm text-text-secondary">
                  {post.published_at ? format(new Date(post.published_at), 'dd MMM yyyy') : '—'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                      <Link href={`/blog/${post.id}`}><Pencil className="w-4 h-4" /></Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-danger hover:text-danger hover:bg-danger/5"
                      onClick={() => setDeleteTarget(post.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Post"
        description="This will permanently delete the blog post from the public website."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={async () => {
          if (deleteTarget) await deletePost.mutateAsync(deleteTarget)
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}
