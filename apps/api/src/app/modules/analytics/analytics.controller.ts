import httpStatus from 'http-status'
import CatchAsync from '../../utils/CatchAsync'
import SuccessResponse from '../../utils/SuccessResponse'
import * as analyticsService from './analytics.service'

const dashboard = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const data = await analyticsService.getDashboard(workspaceId)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Dashboard',
    data,
  })
})

export const analyticsController = {
  dashboard,
}
