import { z } from 'zod'

export const CreateClientSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(200),
  email: z.string().email().nullable().optional(),
  phone: z.string().min(7, 'Phone number is required').max(20),
  city: z.string().max(100).nullable().optional(),
  source: z
    .enum(['website_form', 'referral', 'direct', 'social_media', 'other'])
    .nullable()
    .optional(),
  lead_status: z
    .enum(['new', 'contacted', 'meeting_scheduled', 'proposal_sent', 'won', 'lost'])
    .default('new'),
  notes: z.string().max(2000).nullable().optional(),
  budget_range: z.string().max(100).nullable().optional(),
  project_type: z
    .enum(['residential', 'commercial', 'office', 'hospitality', 'other'])
    .nullable()
    .optional(),
})

export const UpdateClientSchema = CreateClientSchema.partial()

export type CreateClientInput = z.infer<typeof CreateClientSchema>
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>
