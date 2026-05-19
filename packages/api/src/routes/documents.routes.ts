import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import * as documentsController from '../controllers/documents.controller.js'

const router = Router()

router.use(authenticate)

router.get('/', documentsController.listDocuments)
router.post('/', documentsController.createDocumentUploadUrl)

export default router
