import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { CreateWorkerPaymentSchema, CreateVendorPaymentSchema } from '@kalpak/shared'
import * as paymentsController from '../controllers/payments.controller.js'

const router = Router({ mergeParams: true })

router.use(authenticate)

router.get('/workers', paymentsController.listWorkerPayments)
router.post('/workers', validate(CreateWorkerPaymentSchema), paymentsController.createWorkerPayment)
router.get('/vendors', paymentsController.listVendorPayments)
router.post('/vendors', validate(CreateVendorPaymentSchema), paymentsController.createVendorPayment)
router.get('/summary', paymentsController.getFinancialSummary)

export default router
