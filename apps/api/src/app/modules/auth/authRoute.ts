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
route.post(
  '/forgot-password',
  ValidationRequest(authValidation.forgotPasswordSchema),
  authController.forgotPassword,
)
route.post(
  '/reset-password',
  ValidationRequest(authValidation.resetPasswordSchema),
  authController.resetPassword,
)
route.post(
  '/verify-email',
  ValidationRequest(authValidation.verifyEmailSchema),
  authController.verifyEmail,
)
route.post(
  '/change-password',
  Auth(),
  ValidationRequest(authValidation.changePasswordSchema),
  authController.changePassword,
)
route.post('/logout', authController.logout)
route.get('/me', Auth(), authController.me)

export const authRouter = route
