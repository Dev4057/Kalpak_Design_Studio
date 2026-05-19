import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { UpdateSiteUpdateSchema } from '@kalpak/shared'
import * as updatesController from '../controllers/updates.controller.js'

const router = Router()

router.use(authenticate)

router.get('/recent', updatesController.getRecentUpdates)
router.patch('/:id', validate(UpdateSiteUpdateSchema), updatesController.updateSiteUpdate)
router.delete('/:id', updatesController.deleteSiteUpdate)

export default router
