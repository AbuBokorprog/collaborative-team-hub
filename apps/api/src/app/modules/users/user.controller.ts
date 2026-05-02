import httpStatus from 'http-status'
import CatchAsync from '../../utils/CatchAsync'
import SuccessResponse from '../../utils/SuccessResponse'
import { AppError } from '../../utils/AppError'
import { userServices } from './user.service'

const list = CatchAsync(async (req, res) => {
  const workspaceId = req.headers['x-workspace-id'] as string | undefined
  if (!workspaceId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'x-workspace-id header is required')
  }
  const userId = req.user?.id as string
  const data = await userServices.listWorkspaceUsers(workspaceId, userId)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Users',
    data,
  })
})

const getOne = CatchAsync(async (req, res) => {
  const data = await userServices.getUser(req.params.id as string)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'User',
    data,
  })
})

const me = CatchAsync(async (req, res) => {
  const userId = req.user?.id as string
  const data = await userServices.getUser(userId)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Profile',
    data,
  })
})

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

const changePassword = CatchAsync(async (req, res) => {
  const userId = req.user?.id as string
  const data = await userServices.changePassword(userId, req.body)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Password changed',
    data,
  })
})

const preferences = CatchAsync(async (req, res) => {
  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Preferences',
    data: {
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      ...req.body,
    },
  })
})

const deleteMe = CatchAsync(async (req, res) => {
  const userId = req.user?.id as string
  const data = await userServices.deleteMe(userId)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Account deleted',
    data,
  })
})

const activity = CatchAsync(async (req, res) => {
  const data = await userServices.activity(req.params.id as string)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'User activity',
    data,
  })
})

const contributions = CatchAsync(async (req, res) => {
  const data = await userServices.contributions(req.params.id as string)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'User contributions',
    data,
  })
})

export const userControllers = {
  list,
  getOne,
  me,
  updateProfile,
  uploadAvatar,
  changePassword,
  preferences,
  deleteMe,
  activity,
  contributions,
}
