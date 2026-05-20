import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '@kalpak/db'
import { AppError } from '../middleware/errorHandler.js'
import type { CreateProjectInput, UpdateProjectInput, AssignUserInput } from '@kalpak/shared'

export async function listProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id
    const role = req.user!.role

    let query = supabaseAdmin.from('projects').select('*, clients(full_name, phone)')

    if (role === 'employee') {
      const { data: assignments } = await supabaseAdmin
        .from('project_assignments')
        .select('project_id')
        .eq('user_id', userId)
      const projectIds = (assignments ?? []).map((a: { project_id: string }) => a.project_id)
      if (projectIds.length === 0) {
        res.json({ data: [], total: 0 })
        return
      }
      query = query.in('id', projectIds)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })

    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.json({ data, total: count ?? data?.length ?? 0 })
  } catch (err) {
    next(err)
  }
}

export async function createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as CreateProjectInput
    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert(input)
      .select()
      .single()

    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.status(201).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function getProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*, clients(*), project_assignments(*, profiles(full_name, email, role))')
      .eq('id', id)
      .single()

    if (error || !data) throw new AppError(404, 'NOT_FOUND', 'Project not found')
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params
    const input = req.body as UpdateProjectInput
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) throw new AppError(404, 'NOT_FOUND', 'Project not found')

    // Trigger portfolio revalidation when publish state changes
    if (typeof input.is_published === 'boolean' && process.env.WEB_URL && process.env.REVALIDATE_SECRET) {
      fetch(`${process.env.WEB_URL}/api/revalidate`, {
        method: 'POST',
        headers: { 'x-revalidate-secret': process.env.REVALIDATE_SECRET },
      }).catch(() => null)
    }

    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params
    const { error } = await supabaseAdmin.from('projects').delete().eq('id', id)
    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

export async function assignUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: project_id } = req.params
    const input = req.body as AssignUserInput
    const { data, error } = await supabaseAdmin
      .from('project_assignments')
      .insert({
        project_id,
        user_id: input.user_id,
        role_in_project: input.role_in_project,
        assigned_by: req.user!.id,
      })
      .select()
      .single()

    if (error) throw new AppError(409, 'CONFLICT', error.message)
    res.status(201).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function removeAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: project_id, userId } = req.params
    const { error } = await supabaseAdmin
      .from('project_assignments')
      .delete()
      .eq('project_id', project_id)
      .eq('user_id', userId)

    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
