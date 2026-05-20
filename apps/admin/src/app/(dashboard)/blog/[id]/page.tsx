'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/PageHeader'
import { BlogPostForm } from '@/components/blog/BlogPostForm'
import { Skeleton } from '@/components/ui/skeleton'
import { useBlogPost, useUpdateBlogPost } from '@/hooks/useBlog'
import type { UpdateBlogPostInput } from '@kalpak/shared'

export default function EditBlogPostPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useBlogPost(id)
  const updatePost = useUpdateBlogPost(id)
  const post = data?.data

  const handleSubmit = async (data: UpdateBlogPostInput) => {
    await updatePost.mutateAsync(data)
  }

  return (
    <div>
      <nav className="text-xs text-text-secondary mb-4">
        <Link href="/blog" className="hover:text-text-primary">Blog</Link>
        <span className="mx-2">›</span>
        <span className="text-text-primary">{post?.title ?? '…'}</span>
      </nav>
      <PageHeader title="Edit Post" description={post?.slug ? `/${post.slug}` : ''} />
      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
      ) : post ? (
        <BlogPostForm
          initial={post}
          onSubmit={handleSubmit}
          isSubmitting={updatePost.isPending}
          submitLabel="Save Changes"
        />
      ) : (
        <p className="text-sm text-text-secondary">Post not found.</p>
      )}
    </div>
  )
}
