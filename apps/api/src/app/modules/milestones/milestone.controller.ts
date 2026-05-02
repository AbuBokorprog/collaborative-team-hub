import httpStatus from 'http-status'
import CatchAsync from '../../utils/CatchAsync'
import SuccessResponse from '../../utils/SuccessResponse'
import { paramId } from '../../utils/routeParams'
import * as milestoneService from './milestone.service'

const update = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const userId = req.user?.id as string
  const data = await milestoneService.updateMilestone(
    paramId(req.params.id),
    workspaceId,
    userId,
    req.body,
  )

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Milestone updated',
    data,
  })
})

const remove = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const userId = req.user?.id as string
  await milestoneService.deleteMilestone(paramId(req.params.id), workspaceId, userId)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Milestone deleted',
    data: null,
  })
})

export const milestoneController = {
  update,
  remove,
}
