import { z } from 'zod'

export const CreateBlogPostSchema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  excerpt: z.string().min(1).max(200),
  content: z.string().min(1),
  cover_image_url: z.string().url().optional().nullable(),
  tags: z.array(z.string()).default([]),
  is_published: z.boolean().default(false),
  published_at: z.string().datetime().optional().nullable(),
  reading_time_minutes: z.number().int().positive().optional().nullable(),
})

export const UpdateBlogPostSchema = CreateBlogPostSchema.partial()

export type CreateBlogPostInput = z.infer<typeof CreateBlogPostSchema>
export type UpdateBlogPostInput = z.infer<typeof UpdateBlogPostSchema>
