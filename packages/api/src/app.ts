import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { mountRoutes } from './routes/index.js'
import { errorHandler } from './middleware/errorHandler.js'

export function createApp(): express.Express {
  const app = express()

  // Security headers
  app.use(helmet())

  // CORS
  const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(',')
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true)
        } else {
          callback(new Error(`CORS: Origin ${origin} not allowed`))
        }
      },
      credentials: true,
    })
  )

  // Request logging
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

  // Body parsing
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true }))

  // Health check — no auth, no rate limit
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // Mount all API routes
  mountRoutes(app)

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } })
  })

  // Global error handler must be last
  app.use(errorHandler)

  return app
}
