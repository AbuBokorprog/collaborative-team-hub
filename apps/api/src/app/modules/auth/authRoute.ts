import express from 'express'
import ValidationRequest from '../../utils/ValidationRequest'
import { authController } from './authController'
import { authValidation } from './authValidation'
import Auth from '../../middlewares/Auth'

const route = express.Router()

route.post(
  '/register',
  ValidationRequest(authValidation.registerSchema),
  authController.register,
)
route.post(
  '/login',
  ValidationRequest(authValidation.loginSchema),
  authController.login,
)
route.post(
  '/refresh',
  ValidationRequest(authValidation.refreshSchema),
  authController.refresh,
)
route.post('/logout', authController.logout)
route.get('/me', Auth(), authController.me)

export const authRouter = route
