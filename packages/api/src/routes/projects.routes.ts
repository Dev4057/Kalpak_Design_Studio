import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { validate } from '../middleware/validate.js'
import { CreateProjectSchema, UpdateProjectSchema, AssignUserSchema } from '@kalpak/shared'
import * as projectsController from '../controllers/projects.controller.js'

const router = Router()

router.use(authenticate)

router.get('/', projectsController.listProjects)
router.post('/', requireRole('partner'), validate(CreateProjectSchema), projectsController.createProject)
router.get('/:id', projectsController.getProject)
router.patch('/:id', validate(UpdateProjectSchema), projectsController.updateProject)
router.delete('/:id', requireRole('partner'), projectsController.deleteProject)

router.post('/:id/assign', requireRole('partner'), validate(AssignUserSchema), projectsController.assignUser)
router.delete('/:id/assign/:userId', requireRole('partner'), projectsController.removeAssignment)

export default router
