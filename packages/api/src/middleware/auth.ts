import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '@kalpak/db'

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Missing or malformed Authorization header' },
    })
    return
  }

  const token = authHeader.slice(7)

  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user) {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' },
    })
    return
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()

  if (profileError || !profile) {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'User profile not found' },
    })
    return
  }

  if (!profile.is_active) {
    res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Account has been deactivated' },
    })
    return
  }

  req.user = {
    id: data.user.id,
    email: data.user.email ?? profile.email,
    role: profile.role,
    profile,
  }

  next()
}
