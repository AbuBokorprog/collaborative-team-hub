import httpStatus from 'http-status'
import CatchAsync from '../utils/CatchAsync'
import { AppError } from '../utils/AppError'
import prisma from '../helpers/prisma'
import { Role } from '../../generated/prisma/enums'

/** Requires `x-workspace-id` header and loads membership for the authenticated user. */
export const requireWorkspaceMember = CatchAsync(async (req, _res, next) => {
  const workspaceId = req.headers['x-workspace-id'] as string | undefined
  if (!workspaceId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'x-workspace-id header is required')
  }

  const userId = req.user?.id
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You're unauthorized!")
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: { userId, workspaceId },
    },
  })

  if (!membership) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not a member of this workspace')
  }

  req.workspaceId = workspaceId
  req.membership = {
    id: membership.id,
    role: membership.role as 'ADMIN' | 'MANAGER' | 'MEMBER',
    workspaceId: membership.workspaceId,
    userId: membership.userId,
  }

  next()
})

export const requireWorkspaceAdmin = CatchAsync(async (req, _res, next) => {
  if (req.membership?.role !== Role.ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, 'Admin access required')
  }
  next()
})

export const requireWorkspaceManagerOrAdmin = CatchAsync(async (req, _res, next) => {
  if (req.membership?.role !== Role.ADMIN && req.membership?.role !== Role.MANAGER) {
    throw new AppError(httpStatus.FORBIDDEN, 'Admin or Manager access required')
  }
  next()
})

/** Uses `:workspaceId` or `:id` from route params (for `/workspaces/:id/...` routes). */
export const requireWorkspaceMemberFromParams = CatchAsync(
  async (req, _res, next) => {
    const workspaceId =
      (req.params.workspaceId as string | undefined) ??
      (req.params.id as string | undefined)
    if (!workspaceId) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Workspace id is required')
    }

    const userId = req.user?.id
    if (!userId) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You're unauthorized!")
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
    })

    if (!membership) {
      throw new AppError(httpStatus.FORBIDDEN, 'You are not a member of this workspace')
    }

    req.workspaceId = workspaceId
    req.membership = {
      id: membership.id,
      role: membership.role as 'ADMIN' | 'MANAGER' | 'MEMBER',
      workspaceId: membership.workspaceId,
      userId: membership.userId,
    }

    next()
  },
)
