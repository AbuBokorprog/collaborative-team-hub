import { Request } from 'express'
import { Server } from 'socket.io'

export function getIo(req: Request): Server | undefined {
  return req.app.get('io') as Server | undefined
}

export function emitWorkspace(req: Request, event: string, payload: unknown) {
  const io = getIo(req)
  const workspaceId = req.workspaceId
  if (!io || !workspaceId) return
  io.to(`workspace:${workspaceId}`).emit(event, payload)
}
