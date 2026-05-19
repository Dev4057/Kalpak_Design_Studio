import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { CreateWorkerSchema, UpdateWorkerSchema } from '@kalpak/shared'
import * as workersController from '../controllers/workers.controller.js'

const router = Router()

router.use(authenticate)

router.get('/', workersController.listWorkers)
router.post('/', validate(CreateWorkerSchema), workersController.createWorker)
router.patch('/:id', validate(UpdateWorkerSchema), workersController.updateWorker)

export default router
