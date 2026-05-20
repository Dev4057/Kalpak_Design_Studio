import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { validate } from '../middleware/validate.js'
import { InviteEmployeeSchema, UpdateMemberStatusSchema } from '@kalpak/shared'
import * as teamController from '../controllers/team.controller.js'

const router = Router()

router.use(authenticate, requireRole('partner'))

router.get('/', teamController.getTeam)
router.post('/invite', validate(InviteEmployeeSchema), teamController.inviteEmployee)
router.patch('/:userId/status', validate(UpdateMemberStatusSchema), teamController.updateMemberStatus)

export default router
