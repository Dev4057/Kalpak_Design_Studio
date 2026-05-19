import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { validate } from '../middleware/validate.js'
import { CreateClientSchema, UpdateClientSchema } from '@kalpak/shared'
import * as clientsController from '../controllers/clients.controller.js'

const router = Router()

router.use(authenticate)

router.get('/', clientsController.listClients)
router.post('/', requireRole('partner'), validate(CreateClientSchema), clientsController.createClient)
router.get('/:id', clientsController.getClient)
router.patch('/:id', requireRole('partner'), validate(UpdateClientSchema), clientsController.updateClient)

export default router
