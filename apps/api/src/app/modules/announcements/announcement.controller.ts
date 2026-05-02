import httpStatus from 'http-status'
import CatchAsync from '../../utils/CatchAsync'
import SuccessResponse from '../../utils/SuccessResponse'
import { emitWorkspace } from '../../helpers/socketEmit'
import { paramId } from '../../utils/routeParams'
import * as announcementService from './announcement.service'

const list = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const userId = req.user?.id as string
  const data = await announcementService.list(workspaceId, userId, req.query as never)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Announcements',
    data,
  })
})

const create = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const userId = req.user?.id as string
  const data = await announcementService.create(workspaceId, userId, req.body)

  emitWorkspace(req, 'new-announcement', {
    workspaceId,
    announcement: data,
  })

  SuccessResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: 'Announcement created',
    data,
  })
})

const update = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const userId = req.user?.id as string
  const isAdmin = req.membership?.role === 'ADMIN'
  const data = await announcementService.update(
    paramId(req.params.id),
    workspaceId,
    userId,
    req.body,
    isAdmin,
  )

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Announcement updated',
    data,
  })
})

const remove = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const userId = req.user?.id as string
  const isAdmin = req.membership?.role === 'ADMIN'
  await announcementService.remove(paramId(req.params.id), workspaceId, userId, isAdmin)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Announcement deleted',
    data: null,
  })
})

const react = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const userId = req.user?.id as string
  const data = await announcementService.react(
    paramId(req.params.id),
    workspaceId,
    userId,
    req.body.emoji,
  )

  emitWorkspace(req, 'reaction-added', {
    workspaceId,
    announcementId: paramId(req.params.id),
    reaction: data,
  })

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Reaction saved',
    data,
  })
})

const comment = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const userId = req.user?.id as string
  const data = await announcementService.comment(
    paramId(req.params.id),
    workspaceId,
    userId,
    req.body.body,
    'You were mentioned in a comment',
  )

  emitWorkspace(req, 'comment-added', {
    workspaceId,
    announcementId: paramId(req.params.id),
    comment: data,
  })

  SuccessResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: 'Comment added',
    data,
  })
})

const pin = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const userId = req.user?.id as string
  const data = await announcementService.pin(paramId(req.params.id), workspaceId, userId)

  emitWorkspace(req, 'announcement-pinned', {
    workspaceId,
    announcementId: paramId(req.params.id),
    announcement: data,
  })

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Announcement pinned',
    data,
  })
})

export const announcementController = {
  list,
  create,
  update,
  remove,
  react,
  comment,
  pin,
}
