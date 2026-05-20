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
import * as paymentsController from '../controllers/payments.controller.js'
import * as reportsController from '../controllers/reports.controller.js'
import * as dashboardController from '../controllers/dashboard.controller.js'
import * as blogController from '../controllers/blog.controller.js'
import teamRouter from './team.routes.js'

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

  // Payment delete routes (standalone, no project context)
  app.delete('/api/payments/workers/:paymentId', authenticate, paymentsController.deleteWorkerPayment)
  app.delete('/api/payments/vendors/:paymentId', authenticate, paymentsController.deleteVendorPayment)

  // Document delete (no project context needed, doc ID is enough)
  app.delete('/api/documents/:id', authenticate, documentsController.deleteDocument)

  // Dashboard + Reports (partner only, enforced in controller)
  app.get('/api/dashboard', authenticate, dashboardController.getDashboard)
  app.get('/api/reports/overview', authenticate, reportsController.getReportsOverview)

  // Team management (partner only)
  app.use('/api/team', teamRouter)

  // Blog management
  app.get('/api/blog', authenticate, blogController.listBlogPosts)
  app.post('/api/blog', authenticate, blogController.createBlogPost)
  app.get('/api/blog/:id', authenticate, blogController.getBlogPost)
  app.patch('/api/blog/:id', authenticate, blogController.updateBlogPost)
  app.delete('/api/blog/:id', authenticate, blogController.deleteBlogPost)
}
