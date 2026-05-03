import httpStatus from 'http-status'
import CatchAsync from '../../utils/CatchAsync'
import SuccessResponse from '../../utils/SuccessResponse'
import { emitWorkspace } from '../../helpers/socketEmit'
import { paramId } from '../../utils/routeParams'
import * as goalService from './goal.service'

const list = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const userId = req.user?.id as string
  const data = await goalService.listGoals(
    workspaceId,
    userId,
    req.query as never,
  )

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Goals',
    data,
  })
})

const create = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const userId = req.user?.id as string
  const data = await goalService.createGoal(workspaceId, userId, req.body)

  SuccessResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: 'Goal created',
    data,
  })
})

const getOne = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const userId = req.user?.id as string
  const data = await goalService.getGoal(
    paramId(req.params.id),
    workspaceId,
    userId,
  )

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Goal',
    data,
  })
})

const update = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const userId = req.user?.id as string
  const data = await goalService.updateGoal(
    paramId(req.params.id),
    workspaceId,
    userId,
    req.body,
  )

  emitWorkspace(req, 'goal-updated', {
    workspaceId,
    goal: data,
  })

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Goal updated',
    data,
  })
})

const remove = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const userId = req.user?.id as string
  await goalService.deleteGoal(paramId(req.params.id), workspaceId, userId)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Goal deleted',
    data: null,
  })
})

const createMilestone = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const userId = req.user?.id as string
  const data = await goalService.createMilestone(
    paramId(req.params.id),
    workspaceId,
    userId,
    req.body,
  )

  SuccessResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: 'Milestone created',
    data,
  })
})

const activity = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const userId = req.user?.id as string
  const data = await goalService.listGoalActivity(
    paramId(req.params.id),
    workspaceId,
    userId,
  )

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Activity',
    data,
  })
})

const addUpdate = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const userId = req.user?.id as string
  const data = await goalService.addGoalUpdate(
    paramId(req.params.id),
    workspaceId,
    userId,
    req.body.body,
  )

  SuccessResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: 'Update posted',
    data,
  })
})

const analytics = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const userId = req.user?.id as string
  const data = await goalService.getGoalAnalytics(
    paramId(req.params.id),
    workspaceId,
    userId,
  )

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Goal analytics',
    data,
  })
})

export const goalController = {
  list,
  create,
  getOne,
  update,
  remove,
  createMilestone,
  activity,
  addUpdate,
  analytics,
}
