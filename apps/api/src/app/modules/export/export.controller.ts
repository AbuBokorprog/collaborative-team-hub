import httpStatus from 'http-status'
import CatchAsync from '../../utils/CatchAsync'
import * as exportService from './export.service'

const csv = CatchAsync(async (req, res) => {
  const workspaceId = req.workspaceId as string
  const data = await exportService.buildWorkspaceCsv(workspaceId)

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
