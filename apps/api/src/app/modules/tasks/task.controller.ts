import httpStatus from 'http-status'
import { Request } from 'express'
import CatchAsync from '../../utils/CatchAsync'
import SuccessResponse from '../../utils/SuccessResponse'
import { AppError } from '../../utils/AppError'
import { emitWorkspace } from '../../helpers/socketEmit'
import { headerWorkspaceId, paramId } from '../../utils/routeParams'
import * as taskService from './task.service'

const resolveWorkspaceId = (req: Request) =>
  (req as Request & { workspaceId?: string }).workspaceId ??
  (req.query.workspaceId as string | undefined) ??
  headerWorkspaceId(req)

const list = CatchAsync(async (req, res) => {
  const workspaceId = resolveWorkspaceId(req)
  if (!workspaceId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Provide x-workspace-id header or workspaceId query',
    )
  }
  const userId = req.user?.id as string
  const data = await taskService.listTasks(workspaceId, userId, req.query as never)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Tasks',
    data,
  })
})

const create = CatchAsync(async (req, res) => {
  const userId = req.user?.id as string
  const data = await taskService.createTask(userId, req.body)

  req.workspaceId = req.body.workspaceId
  emitWorkspace(req, 'task-updated', {
    workspaceId: req.body.workspaceId,
    task: data,
    action: 'created',
  })

  SuccessResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: 'Task created',
    data,
  })
})

const getOne = CatchAsync(async (req, res) => {
  const workspaceId = resolveWorkspaceId(req)
  if (!workspaceId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Provide x-workspace-id header or workspaceId query',
    )
  }
  const userId = req.user?.id as string
  const data = await taskService.getTask(paramId(req.params.id), workspaceId, userId)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Task',
    data,
  })
})

const update = CatchAsync(async (req, res) => {
  const workspaceId = resolveWorkspaceId(req)
  if (!workspaceId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Provide x-workspace-id header or workspaceId query',
    )
  }
  const userId = req.user?.id as string
  const data = await taskService.updateTask(
    paramId(req.params.id),
    workspaceId,
    userId,
    req.body,
  )

  req.workspaceId = workspaceId
  emitWorkspace(req, 'task-updated', {
    workspaceId,
    task: data,
    action: 'updated',
  })

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Task updated',
    data,
  })
})

const remove = CatchAsync(async (req, res) => {
  const workspaceId = resolveWorkspaceId(req)
  if (!workspaceId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Provide x-workspace-id header or workspaceId query',
    )
  }
  const userId = req.user?.id as string
  await taskService.deleteTask(paramId(req.params.id), workspaceId, userId)

  req.workspaceId = workspaceId
  emitWorkspace(req, 'task-updated', {
    workspaceId,
    taskId: paramId(req.params.id),
    action: 'deleted',
  })

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Task deleted',
    data: null,
  })
})

export const taskController = {
  list,
  create,
  getOne,
  update,
  remove,
}
