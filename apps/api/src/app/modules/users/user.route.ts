import express from 'express'
import Auth from '../../middlewares/Auth'
import ValidationRequest from '../../utils/ValidationRequest'
import { userControllers } from './user.controller'
import { userValidation } from './user.validation'
import { uploadDisk } from '../../utils/ImageUpload'

const router = express.Router()

router.use(Auth())

router.get('/', userControllers.list)
router.get('/me', userControllers.me)

router.patch(
  '/profile',
  ValidationRequest(userValidation.updateProfileSchema),
  userControllers.updateProfile,
)

router.patch(
  '/me',
  ValidationRequest(userValidation.updateProfileSchema),
  userControllers.updateProfile,
)

router.patch(
  '/me/password',
  ValidationRequest(userValidation.updatePasswordSchema),
  userControllers.changePassword,
)

router.patch(
  '/me/preferences',
  ValidationRequest(userValidation.preferencesSchema),
  userControllers.preferences,
)

router.delete('/me', userControllers.deleteMe)

router.post(
  '/avatar',
  uploadDisk.single('avatar'),
  userControllers.uploadAvatar,
)

router.get('/:id/activity', userControllers.activity)
router.get('/:id/contributions', userControllers.contributions)
router.get('/:id', userControllers.getOne)

export const userRouter = router
