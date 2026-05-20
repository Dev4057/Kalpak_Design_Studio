import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '@kalpak/db'
import { AppError } from '../middleware/errorHandler.js'

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password })
    if (error) {
      throw new AppError(401, 'AUTH_FAILED', error.message)
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profile && !profile.is_active) {
      throw new AppError(403, 'FORBIDDEN', 'Account has been deactivated')
    }

    res.json({
      data: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        user: profile,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      await supabaseAdmin.auth.admin.signOut(token)
    }
    res.json({ data: { message: 'Logged out successfully' } })
  } catch (err) {
    next(err)
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refresh_token } = req.body as { refresh_token: string }
    if (!refresh_token) {
      throw new AppError(400, 'MISSING_FIELD', 'refresh_token is required')
    }

    const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token })
    if (error || !data.session) {
      throw new AppError(401, 'AUTH_FAILED', 'Invalid or expired refresh token')
    }

    res.json({
      data: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json({ data: req.user?.profile })
  } catch (err) {
    next(err)
  }
}

export async function listProfiles(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, role, avatar_url, is_active')
      .eq('is_active', true)
      .order('full_name')

    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.json({ data })
  } catch (err) {
    next(err)
  }
}
