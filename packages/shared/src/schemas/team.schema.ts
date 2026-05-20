import { z } from 'zod'

export const InviteEmployeeSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
})

export const UpdateMemberStatusSchema = z.object({
  is_active: z.boolean(),
})

export type InviteEmployeeInput = z.infer<typeof InviteEmployeeSchema>
export type UpdateMemberStatusInput = z.infer<typeof UpdateMemberStatusSchema>
