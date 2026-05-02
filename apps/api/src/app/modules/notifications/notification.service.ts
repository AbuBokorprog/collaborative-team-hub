import prisma from '../../helpers/prisma'
import { calculatePagination } from '../../helpers/pagination'

const defaultPreferences = {
  emailMentions: true,
  emailTaskAssignments: true,
  emailGoalUpdates: false,
  emailWeeklyDigest: true,
  pushMentions: true,
  pushDueDateReminders: false,
  pushAnnouncements: true,
  desktopSound: false,
}

export const listNotifications = async (
  userId: string,
  query: { page?: number; limit?: number; sortOrder?: 'asc' | 'desc' },
) => {
  const { skip, limit, page, sortOrder } = calculatePagination({
    page: query.page,
    limit: query.limit,
    sortBy: 'createdAt',
    sortOrder: query.sortOrder === 'asc' ? 'asc' : 'desc',
  })

  const where = { userId }
  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: sortOrder as 'asc' | 'desc' },
    }),
    prisma.notification.count({ where }),
  ])

  return {
    data: items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export const getUnreadCount = async (userId: string) => {
  const unread = await prisma.notification.count({
    where: { userId, read: false },
  })

  return { unread }
}

export const getPreferences = () => defaultPreferences

export const updatePreferences = (payload: Record<string, unknown>) => ({
  ...defaultPreferences,
  ...payload,
})

export const markAllRead = async (userId: string) => {
  const updated = await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  })

  return { updated: updated.count }
}

export const deleteRead = async (userId: string) => {
  const deleted = await prisma.notification.deleteMany({
    where: { userId, read: true },
  })

  return { deleted: deleted.count }
}

export const deleteOne = async (notificationId: string, userId: string) => {
  const deleted = await prisma.notification.deleteMany({
    where: { id: notificationId, userId },
  })

  return { deleted: deleted.count }
}

export const markOneRead = async (notificationId: string, userId: string) => {
  const updated = await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  })

  return { updated: updated.count }
}
