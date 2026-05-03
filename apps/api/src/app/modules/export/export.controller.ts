import httpStatus from 'http-status'
import CatchAsync from '../../utils/CatchAsync'
import SuccessResponse from '../../utils/SuccessResponse'
import * as exportService from './export.service'

import { SendMail } from '../../utils/SendMail'

const csv = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const data = await exportService.buildWorkspaceCsv(workspaceId, {
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string,
    userId: req.user?.id as string,
    role: req.membership?.role as string,
  })

  if (req.query.sendEmail === 'true' && req.user?.email) {
    await SendMail({
      to: req.user.email,
      subject: `Export Data for Workspace ${workspaceId}`,
      html: `<p>Please find your requested workspace export attached.</p>`,
      attachments: [
        {
          filename: `workspace-${workspaceId}.csv`,
          content: data,
        },
      ],
    })
    return SuccessResponse(res, {
      status: httpStatus.OK,
      success: true,
      message: 'Export email sent successfully',
      data: null,
    })
  }

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="workspace-${workspaceId}.csv"`,
  )
  res.status(httpStatus.OK).send(data)
})

export const exportController = {
  csv,
}
