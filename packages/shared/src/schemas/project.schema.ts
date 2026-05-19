import { z } from 'zod'

export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200),
  client_id: z.string().uuid().nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  project_type: z
    .enum(['residential', 'commercial', 'office', 'hospitality', 'other'])
    .nullable()
    .optional(),
  status: z
    .enum(['lead', 'confirmed', 'in_progress', 'snagging', 'completed', 'on_hold'])
    .default('lead'),
  city: z.string().max(100).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  total_budget: z.number().positive().nullable().optional(),
  start_date: z.string().date().nullable().optional(),
  expected_end_date: z.string().date().nullable().optional(),
  actual_end_date: z.string().date().nullable().optional(),
  is_published: z.boolean().default(false),
})

export const UpdateProjectSchema = CreateProjectSchema.partial()

export const AssignUserSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  role_in_project: z
    .enum(['lead_partner', 'supporting_partner', 'lead_employee', 'supporting_employee'])
    .optional(),
})

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>
export type AssignUserInput = z.infer<typeof AssignUserSchema>
