import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { validate } from '../middleware/validate.js'
import { leadsRateLimiter } from '../middleware/rateLimiter.js'
import { CreateLeadSchema, UpdateLeadStatusSchema, ConvertLeadSchema } from '@kalpak/shared'
import * as leadsController from '../controllers/leads.controller.js'

const router = Router()

// Public endpoint — no auth required
router.post('/', leadsRateLimiter, validate(CreateLeadSchema), leadsController.createLead)

// Protected endpoints
router.get('/', authenticate, requireRole('partner'), leadsController.listLeads)
router.patch('/:id/status', authenticate, requireRole('partner'), validate(UpdateLeadStatusSchema), leadsController.updateLeadStatus)
router.post('/:id/convert', authenticate, requireRole('partner'), validate(ConvertLeadSchema), leadsController.convertLead)

export default router
