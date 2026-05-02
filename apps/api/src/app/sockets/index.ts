import httpStatus from 'http-status'
import jwt from 'jsonwebtoken'
import { Server } from 'socket.io'
import prisma from '../helpers/prisma'
import config from '../config'

export function registerSockets(io: Server) {
  io.use(async (socket, next) => {
    try {
      const token =
        (socket.handshake.auth?.token as string | undefined) ??
        (socket.handshake.headers.authorization?.split(' ')[1] as string | undefined)

      if (!token) {
        next(new Error('Unauthorized'))
        return
      }

      const decoded = jwt.verify(token, config.access_token as string) as {
        id: string
      }

      const user = await prisma.user.findUnique({ where: { id: decoded.id } })
      if (!user || user.status !== 'ACTIVE') {
        next(new Error('Unauthorized'))
        return
      }

      socket.data.userId = user.id
      socket.data.userName = user.name
      next()
    } catch {
      next(new Error('Unauthorized'))
    }
  })

  io.on('connection', socket => {
    socket.on('join-workspace', (workspaceId: string) => {
      if (typeof workspaceId !== 'string') return
      void (async () => {
        const userId = socket.data.userId as string
        const m = await prisma.membership.findUnique({
          where: {
            userId_workspaceId: { userId, workspaceId },
          },
        })
        if (!m) {
          socket.emit('error', { message: 'Forbidden', status: httpStatus.FORBIDDEN })
          return
        }

        await socket.join(`workspace:${workspaceId}`)

        const sockets = await io.in(`workspace:${workspaceId}`).fetchSockets()
        const onlineUserIds = [...new Set(sockets.map(s => s.data.userId).filter(Boolean))]

        io.to(`workspace:${workspaceId}`).emit('online-users', {
          workspaceId,
          userIds: onlineUserIds,
        })
      })()
    })

    socket.on('disconnecting', () => {
      for (const room of socket.rooms) {
        if (room.startsWith('workspace:')) {
          const workspaceId = room.replace('workspace:', '')
          void io.in(room).emit('online-users', {
            workspaceId,
            note: 'member_left',
          })
        }
      }
    })
  })
}
