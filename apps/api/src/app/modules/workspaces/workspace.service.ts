import httpStatus from 'http-status'
import prisma from '../../helpers/prisma'
import { AppError } from '../../utils/AppError'
import { writeAuditLog } from '../../helpers/auditLog'
import { Role } from '../../../generated/prisma/enums'

export const listForUser = async (userId: string) => {
  const rows = await prisma.membership.findMany({
    where: { userId },
    include: {
      workspace: true,
    },
    orderBy: { workspace: { updatedAt: 'desc' } },
  })

  return rows.map(r => ({
    ...r.workspace,
    role: r.role,
    membershipId: r.id,
  }))
}

export const createWorkspace = async (
  userId: string,
  data: { name: string; description?: string; accentColor?: string },
) => {
  return prisma.$transaction(async tx => {
    const ws = await tx.workspace.create({
      data: {
        name: data.name,
        description: data.description,
        accentColor: data.accentColor ?? '#6366f1',
      },
    })

    await tx.membership.create({
      data: {
        userId,
        workspaceId: ws.id,
        role: Role.ADMIN,
      },
    })

    return ws
  })
}

export const getWorkspace = async (workspaceId: string, userId: string) => {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: { userId, workspaceId },
    },
    include: {
      workspace: true,
    },
  })

  if (!membership) {
    throw new AppError(httpStatus.FORBIDDEN, 'Workspace not found or access denied')
  }

  return {
    ...membership.workspace,
    role: membership.role,
    membershipId: membership.id,
  }
}

export const updateWorkspace = async (
  workspaceId: string,
  data: { name?: string; description?: string; accentColor?: string },
) => {
  return prisma.workspace.update({
    where: { id: workspaceId },
    data,
  })
}

export const deleteWorkspace = async (workspaceId: string) => {
  await prisma.workspace.delete({
    where: { id: workspaceId },
  })
}

export const inviteMember = async (
  workspaceId: string,
  actorId: string,
  payload: { email: string; role?: Role },
) => {
  const email = payload.email.toLowerCase()
  const target = await prisma.user.findUnique({ where: { email } })
  if (!target) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'No user with this email. They must register first.',
    )
  }

  const existing = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: { userId: target.id, workspaceId },
    },
  })

  if (existing) {
    throw new AppError(httpStatus.CONFLICT, 'User is already a member')
  }

  const membership = await prisma.membership.create({
    data: {
      userId: target.id,
      workspaceId,
      role: payload.role ?? Role.MEMBER,
    },
    include: { user: true },
  })

  await writeAuditLog({
    workspaceId,
    actorId,
    action: 'USER_INVITED',
    metadata: { invitedUserId: target.id, email },
  })

  return membership
}

export const listMembers = async (workspaceId: string) => {
  return prisma.membership.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          status: true,
        },
      },
    },
    orderBy: { user: { email: 'asc' } },
  })
}

export const updateMemberRole = async (
  workspaceId: string,
  targetUserId: string,
  role: Role,
) => {
  return prisma.membership.update({
    where: {
      userId_workspaceId: { userId: targetUserId, workspaceId },
    },
    data: { role },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
  })
}

export const removeMember = async (workspaceId: string, targetUserId: string) => {
  await prisma.membership.delete({
    where: {
      userId_workspaceId: { userId: targetUserId, workspaceId },
    },
  })
}
