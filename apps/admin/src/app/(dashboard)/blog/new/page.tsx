'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/PageHeader'
import { BlogPostForm } from '@/components/blog/BlogPostForm'
import { useCreateBlogPost } from '@/hooks/useBlog'
import type { CreateBlogPostInput } from '@kalpak/shared'

export default function NewBlogPostPage() {
  const router = useRouter()
  const createPost = useCreateBlogPost()

  const handleSubmit = async (data: CreateBlogPostInput) => {
    const result = await createPost.mutateAsync(data)
    router.push(`/blog/${result.data.id}`)
  }

  return (
    <div>
      <nav className="text-xs text-text-secondary mb-4">
        <Link href="/blog" className="hover:text-text-primary">Blog</Link>
        <span className="mx-2">›</span>
        <span className="text-text-primary">New Post</span>
      </nav>
      <PageHeader title="New Blog Post" description="Write and publish to the public /insights page" />
      <BlogPostForm
        onSubmit={handleSubmit}
        isSubmitting={createPost.isPending}
        submitLabel="Create Post"
      />
    </div>
  )
}
