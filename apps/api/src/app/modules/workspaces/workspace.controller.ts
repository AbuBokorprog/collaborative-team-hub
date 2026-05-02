import httpStatus from 'http-status'
import CatchAsync from '../../utils/CatchAsync'
import SuccessResponse from '../../utils/SuccessResponse'
import * as workspaceService from './workspace.service'

const list = CatchAsync(async (req, res) => {
  const userId = req.user?.id as string
  const data = await workspaceService.listForUser(userId)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Workspaces',
    data,
  })
})

const create = CatchAsync(async (req, res) => {
  const userId = req.user?.id as string
  const data = await workspaceService.createWorkspace(userId, req.body)

  SuccessResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: 'Workspace created',
    data,
  })
})

const getOne = CatchAsync(async (req, res) => {
  const userId = req.user?.id as string
  const workspaceId = req.params.id as string
  const data = await workspaceService.getWorkspace(workspaceId, userId)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Workspace',
    data,
  })
})

const update = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const data = await workspaceService.updateWorkspace(workspaceId, req.body)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Workspace updated',
    data,
  })
})

const remove = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  await workspaceService.deleteWorkspace(workspaceId)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Workspace deleted',
    data: null,
  })
})

const invite = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const actorId = req.user?.id as string
  const data = await workspaceService.inviteMember(workspaceId, actorId, req.body)

  SuccessResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: 'Member invited',
    data,
  })
})

const members = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const data = await workspaceService.listMembers(workspaceId)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Members',
    data,
  })
})

const updateMember = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const targetUserId = req.params.userId as string
  const data = await workspaceService.updateMemberRole(
    workspaceId,
    targetUserId,
    req.body.role,
  )

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Member updated',
    data,
  })
})

const removeMember = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const targetUserId = req.params.userId as string
  await workspaceService.removeMember(workspaceId, targetUserId)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Member removed',
    data: null,
  })
})

const stats = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const data = await workspaceService.stats(workspaceId)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Workspace stats',
    data,
  })
})

export const workspaceController = {
  list,
  create,
  getOne,
  update,
  remove,
  invite,
  members,
  updateMember,
  removeMember,
  stats,
}
