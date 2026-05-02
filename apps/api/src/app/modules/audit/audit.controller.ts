import httpStatus from 'http-status'
import CatchAsync from '../../utils/CatchAsync'
import SuccessResponse from '../../utils/SuccessResponse'
import * as auditService from './audit.service'

const list = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const data = await auditService.listAuditLogs(workspaceId, req.query as never)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Audit logs',
    data,
  })
})

export const auditController = {
  list,
}
