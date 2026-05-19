import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '@kalpak/db'
import { AppError } from '../middleware/errorHandler.js'
import type { CreateSiteUpdateInput, UpdateSiteUpdateInput } from '@kalpak/shared'

export async function listUpdates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: project_id } = req.params
    const page = Math.max(1, parseInt(String(req.query['page'] ?? '1'), 10))
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query['limit'] ?? '20'), 10)))
    const offset = (page - 1) * limit

    const { data, error, count } = await supabaseAdmin
      .from('site_updates')
      .select('*, profiles(full_name, avatar_url)', { count: 'exact' })
      .eq('project_id', project_id)
      .order('update_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.json({ data, total: count ?? 0, page, limit })
  } catch (err) {
    next(err)
  }
}

export async function createUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: project_id } = req.params
    const input = req.body as CreateSiteUpdateInput
    const { data, error } = await supabaseAdmin
      .from('site_updates')
      .insert({
        ...input,
        project_id,
        posted_by: req.user!.id,
      })
      .select()
      .single()

    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.status(201).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function updateSiteUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params
    const input = req.body as UpdateSiteUpdateInput

    // Only allow the poster or a partner to update
    const { data: existing } = await supabaseAdmin
      .from('site_updates')
      .select('posted_by')
      .eq('id', id)
      .single()

    if (!existing) throw new AppError(404, 'NOT_FOUND', 'Site update not found')
    if (existing.posted_by !== req.user!.id && req.user!.role !== 'partner') {
      throw new AppError(403, 'FORBIDDEN', 'You can only edit your own updates')
    }

    const { data, error } = await supabaseAdmin
      .from('site_updates')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function getRecentUpdates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query['limit'] ?? '10'), 10)))
    const { data, error } = await supabaseAdmin
      .from('site_updates')
      .select('*, profiles(full_name, avatar_url), projects(id, name)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function deleteSiteUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params

    const { data: existing } = await supabaseAdmin
      .from('site_updates')
      .select('posted_by')
      .eq('id', id)
      .single()

    if (!existing) throw new AppError(404, 'NOT_FOUND', 'Site update not found')
    if (existing.posted_by !== req.user!.id && req.user!.role !== 'partner') {
      throw new AppError(403, 'FORBIDDEN', 'You can only delete your own updates')
    }

    const { error } = await supabaseAdmin.from('site_updates').delete().eq('id', id)
    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
