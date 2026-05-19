import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '@kalpak/db'
import { AppError } from '../middleware/errorHandler.js'
import type { CreateClientInput, UpdateClientInput } from '@kalpak/shared'

export async function listClients(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function createClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as CreateClientInput
    const { data, error } = await supabaseAdmin
      .from('clients')
      .insert(input)
      .select()
      .single()

    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.status(201).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function getClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*, projects(id, name, status)')
      .eq('id', id)
      .single()

    if (error || !data) throw new AppError(404, 'NOT_FOUND', 'Client not found')
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function updateClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params
    const input = req.body as UpdateClientInput
    const { data, error } = await supabaseAdmin
      .from('clients')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) throw new AppError(404, 'NOT_FOUND', 'Client not found')
    res.json({ data })
  } catch (err) {
    next(err)
  }
}
