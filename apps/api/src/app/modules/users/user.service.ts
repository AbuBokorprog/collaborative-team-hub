import httpStatus from 'http-status'
import prisma from '../../helpers/prisma'
import { AppError } from '../../utils/AppError'
import { ImageUpload } from '../../utils/ImageUpload'
import { ComparePassword } from '../../helpers/ComparePassword'
import { HashPassword } from '../../helpers/HashPassword'
import { UserStatus } from '../../../generated/prisma/enums'

const updateProfile = async (
  userId: string,
  payload: { name?: string; email?: string },
) => {
  if (payload.email) {
    const taken = await prisma.user.findFirst({
      where: {
        email: payload.email.toLowerCase(),
        NOT: { id: userId },
      },
    })
    if (taken) {
      throw new AppError(httpStatus.CONFLICT, 'Email already in use')
    }
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.email !== undefined ? { email: payload.email.toLowerCase() } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

const publicSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  status: true,
  createdAt: true,
  updatedAt: true,
}

const listWorkspaceUsers = async (workspaceId: string, userId: string) => {
  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  })
  if (!membership) throw new AppError(httpStatus.FORBIDDEN, 'Not a workspace member')

  const members = await prisma.membership.findMany({
    where: { workspaceId },
    include: { user: { select: publicSelect } },
    orderBy: { user: { name: 'asc' } },
  })

  return members.map(member => ({
    ...member.user,
    role: member.role,
  }))
}

const getUser = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id }, select: publicSelect })
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  return user
}

const changePassword = async (
  userId: string,
  payload: { currentPassword: string; newPassword: string },
) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
  const ok = await ComparePassword(payload.currentPassword, user.password)
  if (!ok) throw new AppError(httpStatus.BAD_REQUEST, 'Current password is incorrect')

  await prisma.user.update({
    where: { id: userId },
    data: { password: await HashPassword(payload.newPassword) },
  })

  return { changed: true }
}

const deleteMe = async (userId: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { status: UserStatus.DELETED },
    select: publicSelect,
  })
}

const activity = async (userId: string) => {
  return prisma.auditLog.findMany({
    where: { actorId: userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}

const contributions = async (userId: string) => {
  const [tasks, goals, announcements, comments] = await Promise.all([
    prisma.task.count({ where: { assigneeId: userId } }),
    prisma.goal.count({ where: { ownerId: userId } }),
    prisma.announcement.count({ where: { authorId: userId } }),
    prisma.comment.count({ where: { authorId: userId } }),
  ])

  return { tasks, goals, announcements, comments }
}

const uploadAvatar = async (userId: string, file: Express.Multer.File) => {
  const uploaded = await ImageUpload(file.filename, file.path)
  const url = uploaded.secure_url ?? uploaded.url

  return prisma.user.update({
    where: { id: userId },
    data: { avatar: url },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
  })
}

export const userServices = {
  listWorkspaceUsers,
  getUser,
  updateProfile,
  uploadAvatar,
  changePassword,
  deleteMe,
  activity,
  contributions,
}
