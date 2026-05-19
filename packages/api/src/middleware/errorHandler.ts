import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const isDev = process.env.NODE_ENV === 'development'

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    })
    return
  }

  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }))
    res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details,
      },
    })
    return
  }

  // Supabase error shape
  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    'message' in err
  ) {
    const supaErr = err as { code: string; message: string }
    const status =
      supaErr.code === 'PGRST116' ? 404
      : supaErr.code?.startsWith('23') ? 409  // constraint violations
      : 500
    res.status(status).json({
      error: {
        code: supaErr.code,
        message: supaErr.message,
      },
    })
    return
  }

  // Unknown error
  const message = err instanceof Error ? err.message : 'Internal server error'
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: isDev ? message : 'Internal server error',
      ...(isDev && err instanceof Error ? { stack: err.stack } : {}),
    },
  })
}
