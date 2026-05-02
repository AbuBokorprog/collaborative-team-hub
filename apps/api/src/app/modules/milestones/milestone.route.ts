import express from 'express'
import Auth from '../../middlewares/Auth'
import ValidationRequest from '../../utils/ValidationRequest'
import { requireWorkspaceMember } from '../../middlewares/workspace'
import CatchAsync from '../../utils/CatchAsync'
import SuccessResponse from '../../utils/SuccessResponse'
import httpStatus from 'http-status'
import * as goalService from '../goals/goal.service'
import { goalValidation } from '../goals/goal.validation'
import { paramId } from '../../utils/routeParams'

const router = express.Router()

router.use(Auth())
router.use(requireWorkspaceMember)

const patch = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const userId = req.user?.id as string
  const data = await goalService.updateMilestone(
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
  await goalService.deleteMilestone(paramId(req.params.id), workspaceId, userId)
  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Milestone deleted',
    data: null,
  })
})

router.patch(
  '/:id',
  ValidationRequest(goalValidation.milestoneUpdate),
  patch,
)
router.delete('/:id', remove)

export const milestoneRouter = router
