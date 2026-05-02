import httpStatus from 'http-status'
import CatchAsync from '../../utils/CatchAsync'
import SuccessResponse from '../../utils/SuccessResponse'
import { AppError } from '../../utils/AppError'
import { userServices } from './user.service'

const updateProfile = CatchAsync(async (req, res) => {
  const userId = req.user?.id as string
  const data = await userServices.updateProfile(userId, req.body)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Profile updated',
    data,
  })
})

const uploadAvatar = CatchAsync(async (req, res) => {
  const userId = req.user?.id as string
  if (!req.file) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Avatar file is required')
  }

  const data = await userServices.uploadAvatar(userId, req.file)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Avatar updated',
    data,
  })
})

export const userControllers = {
  updateProfile,
  uploadAvatar,
}
