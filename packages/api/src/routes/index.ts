import type { Express } from 'express'
import { authenticate } from '../middleware/auth.js'
import authRouter from './auth.routes.js'
import projectsRouter from './projects.routes.js'
import workersRouter from './workers.routes.js'
import updatesRouter from './updates.routes.js'
import paymentsRouter from './payments.routes.js'
import clientsRouter from './clients.routes.js'
import leadsRouter from './leads.routes.js'
import * as workersController from '../controllers/workers.controller.js'
import * as updatesController from '../controllers/updates.controller.js'
import * as documentsController from '../controllers/documents.controller.js'

export function mountRoutes(app: Express): void {
  app.use('/api/auth', authRouter)
  app.use('/api/projects', projectsRouter)

  // Project-scoped resources (nested under /api/projects/:id/*)
  app.get('/api/projects/:id/workers', authenticate, workersController.listProjectWorkers)
  app.post('/api/projects/:id/workers', authenticate, workersController.addWorkerToProject)
  app.delete('/api/projects/:id/workers/:workerId', authenticate, workersController.removeWorkerFromProject)

  app.get('/api/projects/:id/updates', authenticate, updatesController.listUpdates)
  app.post('/api/projects/:id/updates', authenticate, updatesController.createUpdate)

  // paymentsRouter uses mergeParams:true so it inherits :id from the parent
  app.use('/api/projects/:id/payments', paymentsRouter)

  app.get('/api/projects/:id/documents', authenticate, documentsController.listDocuments)
  app.post('/api/projects/:id/documents', authenticate, documentsController.createDocumentUploadUrl)

  // Standalone resource routes
  app.use('/api/workers', workersRouter)
  app.use('/api/updates', updatesRouter)
  app.use('/api/clients', clientsRouter)
  app.use('/api/leads', leadsRouter)

  // Document delete (no project context needed, doc ID is enough)
  app.delete('/api/documents/:id', authenticate, documentsController.deleteDocument)
}
