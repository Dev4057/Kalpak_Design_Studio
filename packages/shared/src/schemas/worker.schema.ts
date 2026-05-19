import { z } from 'zod'

const WorkerTradeEnum = z.enum([
  'electrician',
  'carpenter',
  'painter',
  'plumber',
  'mason',
  'tiler',
  'fabricator',
  'false_ceiling',
  'ac_hvac',
  'glass_works',
  'polisher',
  'general_labour',
  'supervisor',
  'other',
])

export const CreateWorkerSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(200),
  phone: z.string().min(7, 'Phone number is required').max(20),
  trade: WorkerTradeEnum,
  is_active: z.boolean().default(true),
  notes: z.string().max(1000).nullable().optional(),
})

export const UpdateWorkerSchema = CreateWorkerSchema.partial()

export const AddWorkerToProjectSchema = z.object({
  worker_id: z.string().uuid('Invalid worker ID'),
  workers_needed: z.number().int().min(1).default(1),
})

export type CreateWorkerInput = z.infer<typeof CreateWorkerSchema>
export type UpdateWorkerInput = z.infer<typeof UpdateWorkerSchema>
export type AddWorkerToProjectInput = z.infer<typeof AddWorkerToProjectSchema>
