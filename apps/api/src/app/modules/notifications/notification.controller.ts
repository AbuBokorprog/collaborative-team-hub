import httpStatus from 'http-status'
import CatchAsync from '../../utils/CatchAsync'
import SuccessResponse from '../../utils/SuccessResponse'
import { paramId } from '../../utils/routeParams'
import * as notificationService from './notification.service'

const list = CatchAsync(async (req, res) => {
  const userId = req.user?.id as string
  const data = await notificationService.listNotifications(userId, req.query as never)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Notifications',
    data,
  })
})

const unreadCount = CatchAsync(async (req, res) => {
  const userId = req.user?.id as string
  const data = await notificationService.getUnreadCount(userId)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Unread notifications',
    data,
  })
})

const getPreferences = CatchAsync(async (_req, res) => {
  const data = notificationService.getPreferences()

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Notification preferences',
    data,
  })
})

const updatePreferences = CatchAsync(async (req, res) => {
  const data = notificationService.updatePreferences(req.body)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Notification preferences updated',
    data,
  })
})

const readAll = CatchAsync(async (req, res) => {
  const userId = req.user?.id as string
  const data = await notificationService.markAllRead(userId)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Notifications marked read',
    data,
  })
})

const deleteRead = CatchAsync(async (req, res) => {
  const userId = req.user?.id as string
  const data = await notificationService.deleteRead(userId)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Read notifications deleted',
    data,
  })
})

const remove = CatchAsync(async (req, res) => {
  const userId = req.user?.id as string
  const data = await notificationService.deleteOne(paramId(req.params.id), userId)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Notification deleted',
    data,
  })
})

const read = CatchAsync(async (req, res) => {
  const userId = req.user?.id as string
  const data = await notificationService.markOneRead(paramId(req.params.id), userId)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Marked read',
    data,
  })
})

export const notificationController = {
  list,
  unreadCount,
  getPreferences,
  updatePreferences,
  readAll,
  deleteRead,
  remove,
  read,
}
