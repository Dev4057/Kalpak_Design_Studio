import { z } from 'zod'

export const CreateLeadSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(200),
  email: z.string().email().nullable().optional(),
  phone: z.string().min(7, 'Phone number is required').max(20),
  city: z.string().max(100).nullable().optional(),
  project_type: z.string().max(100).nullable().optional(),
  budget_range: z.string().max(100).nullable().optional(),
  message: z.string().max(2000).nullable().optional(),
  source_page: z.string().max(100).default('contact_form'),
})

export const UpdateLeadStatusSchema = z.object({
  status: z.enum(['new', 'seen', 'converted']),
})

export const ConvertLeadSchema = z.object({
  full_name: z.string().min(1).max(200).optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().min(7).max(20).optional(),
  city: z.string().max(100).nullable().optional(),
})

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>
export type UpdateLeadStatusInput = z.infer<typeof UpdateLeadStatusSchema>
export type ConvertLeadInput = z.infer<typeof ConvertLeadSchema>
