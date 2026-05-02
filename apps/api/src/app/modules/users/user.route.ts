import express from 'express'
import Auth from '../../middlewares/Auth'
import ValidationRequest from '../../utils/ValidationRequest'
import { userControllers } from './user.controller'
import { userValidation } from './user.validation'
import { uploadDisk } from '../../utils/ImageUpload'

const router = express.Router()

router.patch(
  '/profile',
  Auth(),
  ValidationRequest(userValidation.updateProfileSchema),
  userControllers.updateProfile,
)

router.post(
  '/avatar',
  Auth(),
  uploadDisk.single('avatar'),
  userControllers.uploadAvatar,
)

export const userRouter = router
