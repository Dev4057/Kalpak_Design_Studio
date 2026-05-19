import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/auth.js'
import { loginRateLimiter } from '../middleware/rateLimiter.js'
import * as authController from '../controllers/auth.controller.js'

const router = Router()

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const RefreshSchema = z.object({
  refresh_token: z.string().min(1),
})

router.post('/login', loginRateLimiter, validate(LoginSchema), authController.login)
router.post('/logout', authController.logout)
router.post('/refresh', validate(RefreshSchema), authController.refresh)
router.get('/me', authenticate, authController.me)
router.get('/profiles', authenticate, authController.listProfiles)

export default router
