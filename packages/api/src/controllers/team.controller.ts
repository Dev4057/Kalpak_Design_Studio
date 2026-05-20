import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '@kalpak/db'
import { AppError } from '../middleware/errorHandler.js'
import type { InviteEmployeeInput, UpdateMemberStatusInput } from '@kalpak/shared'

export async function getTeam(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user!.role !== 'partner') throw new AppError(403, 'FORBIDDEN', 'Partners only')

    const [employeesRes, activeProjectsRes] = await Promise.all([
      supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, phone, is_active, created_at')
        .eq('role', 'employee')
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('projects')
        .select('id')
        .not('status', 'in', '("completed","on_hold")'),
    ])

    if (employeesRes.error) throw new AppError(500, 'DB_ERROR', employeesRes.error.message)

    const activeProjectIds = (activeProjectsRes.data ?? []).map((p: { id: string }) => p.id)

    let assignmentCounts = new Map<string, number>()
    if (activeProjectIds.length > 0) {
      const { data: assignments } = await supabaseAdmin
        .from('project_assignments')
        .select('user_id')
        .in('project_id', activeProjectIds)

      for (const a of (assignments ?? []) as Array<{ user_id: string }>) {
        assignmentCounts.set(a.user_id, (assignmentCounts.get(a.user_id) ?? 0) + 1)
      }
    }

    const data = (employeesRes.data ?? []).map((emp: Record<string, unknown>) => ({
      ...emp,
      active_project_count: assignmentCounts.get(emp.id as string) ?? 0,
    }))

    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function inviteEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user!.role !== 'partner') throw new AppError(403, 'FORBIDDEN', 'Partners only')

    const { full_name, email } = req.body as InviteEmployeeInput

    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { full_name, role: 'employee' },
    })

    if (error) {
      // Supabase returns a 422 with "User already registered" when email exists
      if (error.message?.toLowerCase().includes('already registered') ||
          error.message?.toLowerCase().includes('already been registered')) {
        throw new AppError(409, 'CONFLICT', 'An account with this email already exists')
      }
      throw new AppError(500, 'INVITE_FAILED', error.message)
    }

    res.json({ message: 'Invite sent successfully' })
  } catch (err) {
    next(err)
  }
}

export async function updateMemberStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user!.role !== 'partner') throw new AppError(403, 'FORBIDDEN', 'Partners only')

    const { userId } = req.params
    const { is_active } = req.body as UpdateMemberStatusInput

    // Prevent partners from deactivating themselves
    if (userId === req.user!.id) {
      throw new AppError(400, 'BAD_REQUEST', 'You cannot change your own account status')
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ is_active })
      .eq('id', userId)
      .eq('role', 'employee')
      .select('id, full_name, email, phone, is_active, created_at')
      .single()

    if (error || !data) throw new AppError(404, 'NOT_FOUND', 'Employee not found')
    res.json({ data })
  } catch (err) {
    next(err)
  }
}
