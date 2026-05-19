import { z } from 'zod'

export const CreateSiteUpdateSchema = z.object({
  project_id: z.string().uuid(),
  update_text: z.string().min(1, 'Update text is required').max(5000),
  workers_present: z.array(z.string().uuid()).default([]),
  worker_count: z.number().int().min(0).default(0),
  photos: z.array(z.string().url()).default([]),
  update_date: z.string().date().optional(),
})

export const UpdateSiteUpdateSchema = z.object({
  update_text: z.string().min(1).max(5000).optional(),
  workers_present: z.array(z.string().uuid()).optional(),
  worker_count: z.number().int().min(0).optional(),
  photos: z.array(z.string().url()).optional(),
})

export type CreateSiteUpdateInput = z.infer<typeof CreateSiteUpdateSchema>
export type UpdateSiteUpdateInput = z.infer<typeof UpdateSiteUpdateSchema>
