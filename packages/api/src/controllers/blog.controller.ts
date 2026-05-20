import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '@kalpak/db'
import { AppError } from '../middleware/errorHandler.js'
import type { CreateBlogPostInput, UpdateBlogPostInput } from '@kalpak/shared'

// blog_posts is a new table added in migration 005 — cast to any to bypass typed client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const blogFrom = () => (supabaseAdmin as any).from('blog_posts')

export async function listBlogPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let query = blogFrom()
      .select('*, profiles!author_id(full_name)')
      .order('created_at', { ascending: false })

    if (req.user?.role !== 'partner') {
      query = query.eq('is_published', true)
    }

    const { data, error } = await query
    if (error) throw new AppError(500, 'DB_ERROR', (error as { message: string }).message)
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function getBlogPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params
    const { data, error } = await blogFrom()
      .select('*, profiles!author_id(full_name)')
      .eq('id', id)
      .single()

    if (error || !data) throw new AppError(404, 'NOT_FOUND', 'Blog post not found')
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function createBlogPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user!.role !== 'partner') throw new AppError(403, 'FORBIDDEN', 'Partners only')
    const input = req.body as CreateBlogPostInput

    if (input.is_published && !input.published_at) {
      input.published_at = new Date().toISOString()
    }

    const { data, error } = await blogFrom()
      .insert({ ...input, author_id: req.user!.id })
      .select()
      .single()

    if (error) throw new AppError(500, 'DB_ERROR', (error as { message: string }).message)
    res.status(201).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function updateBlogPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user!.role !== 'partner') throw new AppError(403, 'FORBIDDEN', 'Partners only')
    const { id } = req.params
    const input = req.body as UpdateBlogPostInput

    if (input.is_published && !input.published_at) {
      input.published_at = new Date().toISOString()
    }

    const { data, error } = await blogFrom()
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error || !data) throw new AppError(404, 'NOT_FOUND', 'Blog post not found')
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function deleteBlogPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user!.role !== 'partner') throw new AppError(403, 'FORBIDDEN', 'Partners only')
    const { id } = req.params
    const { error } = await blogFrom().delete().eq('id', id)
    if (error) throw new AppError(500, 'DB_ERROR', (error as { message: string }).message)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
