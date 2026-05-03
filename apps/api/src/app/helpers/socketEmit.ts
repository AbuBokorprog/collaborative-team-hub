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

export function emitNotification(req: Request, userId: string, notification: any) {
  const io = getIo(req)
  if (!io) return
  
  // Emit to specific user
  io.to(`user:${userId}`).emit('notifications:new', notification)
  
  // Also emit to workspace if workspaceId is available
  if (notification.workspaceId) {
    io.to(`workspace:${notification.workspaceId}`).emit('notification:created', {
      userId,
      notification,
    })
  }
}

export function emitToUser(req: Request, userId: string, event: string, payload: unknown) {
  const io = getIo(req)
  if (!io) return
  io.to(`user:${userId}`).emit(event, payload)
}
