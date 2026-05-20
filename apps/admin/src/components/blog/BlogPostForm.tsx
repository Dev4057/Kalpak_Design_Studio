'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateBlogPostSchema } from '@kalpak/shared'
import type { CreateBlogPostInput, BlogPost } from '@kalpak/shared'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, Eye, Edit } from 'lucide-react'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 200)
}

function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

interface Props {
  initial?: BlogPost | null
  onSubmit: (data: CreateBlogPostInput) => Promise<void>
  isSubmitting: boolean
  submitLabel: string
}

export function BlogPostForm({ initial, onSubmit, isSubmitting, submitLabel }: Props) {
  const [preview, setPreview] = useState(false)
  const [tagsInput, setTagsInput] = useState((initial?.tags ?? []).join(', '))

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateBlogPostInput>({
    resolver: zodResolver(CreateBlogPostSchema),
    defaultValues: {
      title: initial?.title ?? '',
      slug: initial?.slug ?? '',
      excerpt: initial?.excerpt ?? '',
      content: initial?.content ?? '',
      cover_image_url: initial?.cover_image_url ?? undefined,
      tags: initial?.tags ?? [],
      is_published: initial?.is_published ?? false,
      reading_time_minutes: initial?.reading_time_minutes ?? undefined,
    },
  })

  const titleValue = watch('title')
  const contentValue = watch('content') ?? ''
  const isPublished = watch('is_published')

  // Auto-slug from title on new posts
  useEffect(() => {
    if (!initial && titleValue) {
      setValue('slug', slugify(titleValue))
    }
  }, [titleValue, initial, setValue])

  // Auto-reading-time from content
  useEffect(() => {
    if (contentValue) {
      setValue('reading_time_minutes', estimateReadingTime(contentValue))
    }
  }, [contentValue, setValue])

  const handleFormSubmit = (data: CreateBlogPostInput) => {
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    onSubmit({ ...data, tags })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input id="title" className="mt-1" placeholder="Post title" {...register('title')} />
          {errors.title && <p className="text-xs text-danger mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" className="mt-1" placeholder="post-slug" {...register('slug')} />
          {errors.slug && <p className="text-xs text-danger mt-1">{errors.slug.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="excerpt">Excerpt * <span className="text-text-secondary font-normal">(max 200 chars)</span></Label>
        <Textarea id="excerpt" className="mt-1 resize-none" rows={2} placeholder="Short description shown in listing..." maxLength={200} {...register('excerpt')} />
        {errors.excerpt && <p className="text-xs text-danger mt-1">{errors.excerpt.message}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <Label>Content * <span className="text-text-secondary font-normal">(Markdown)</span></Label>
          <Button type="button" variant="ghost" size="sm" onClick={() => setPreview(!preview)} className="h-7 text-xs gap-1">
            {preview ? <><Edit className="w-3 h-3" /> Edit</> : <><Eye className="w-3 h-3" /> Preview</>}
          </Button>
        </div>
        {preview ? (
          <div className="border border-border rounded-md p-4 min-h-[240px] text-sm text-text-secondary whitespace-pre-wrap font-mono">
            {contentValue || <span className="text-text-secondary/50">Nothing to preview yet</span>}
          </div>
        ) : (
          <Textarea
            className="mt-0 font-mono text-sm resize-y min-h-[240px]"
            placeholder="Write your post in Markdown..."
            {...register('content')}
          />
        )}
        {errors.content && <p className="text-xs text-danger mt-1">{errors.content.message}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div>
          <Label htmlFor="cover">Cover Image URL</Label>
          <Input id="cover" className="mt-1" placeholder="https://..." {...register('cover_image_url')} />
        </div>
        <div>
          <Label htmlFor="tags">Tags <span className="text-text-secondary font-normal">(comma-separated)</span></Label>
          <Input
            id="tags"
            className="mt-1"
            placeholder="design, residential, tips"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="reading_time">Reading Time (minutes)</Label>
          <Input
            id="reading_time"
            type="number"
            min={1}
            className="mt-1"
            {...register('reading_time_minutes', { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30">
        <input
          type="checkbox"
          id="is_published"
          className="w-4 h-4 accent-primary"
          {...register('is_published')}
        />
        <div>
          <Label htmlFor="is_published" className="cursor-pointer">Publish to website</Label>
          <p className="text-xs text-text-secondary">
            {isPublished ? 'This post will be visible on /insights' : 'Draft — not visible to public'}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
