import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '@kalpak/db'
import { AppError } from '../middleware/errorHandler.js'
import type { CreateWorkerInput, UpdateWorkerInput, AddWorkerToProjectInput } from '@kalpak/shared'

export async function listWorkers(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { data, error } = await supabaseAdmin
      .from('workers')
      .select('*')
      .order('full_name')

    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function createWorker(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as CreateWorkerInput
    const { data, error } = await supabaseAdmin
      .from('workers')
      .insert(input)
      .select()
      .single()

    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.status(201).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function updateWorker(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params
    const input = req.body as UpdateWorkerInput
    const { data, error } = await supabaseAdmin
      .from('workers')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) throw new AppError(404, 'NOT_FOUND', 'Worker not found')
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function listProjectWorkers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: project_id } = req.params
    const { data, error } = await supabaseAdmin
      .from('project_workers')
      .select('*, workers(*)')
      .eq('project_id', project_id)

    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function addWorkerToProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: project_id } = req.params
    const input = req.body as AddWorkerToProjectInput
    const { data, error } = await supabaseAdmin
      .from('project_workers')
      .insert({
        project_id,
        worker_id: input.worker_id,
        workers_needed: input.workers_needed,
        added_by: req.user!.id,
      })
      .select('*, workers(*)')
      .single()

    if (error) throw new AppError(409, 'CONFLICT', error.message)
    res.status(201).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function removeWorkerFromProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: project_id, workerId } = req.params
    const { error } = await supabaseAdmin
      .from('project_workers')
      .delete()
      .eq('project_id', project_id)
      .eq('worker_id', workerId)

    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
