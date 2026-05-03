import prisma from '../../helpers/prisma'
import { calculatePagination } from '../../helpers/pagination'
import { NotificationType } from '../../../generated/prisma/enums'

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

// Notification creation functions with deep linking
export const createTaskAssignedNotification = async (
  assigneeId: string,
  workspaceId: string,
  taskId: string,
  taskTitle: string,
  actorName: string,
) => {
  const notification = await prisma.notification.create({
    data: {
      userId: assigneeId,
      workspaceId,
      type: 'TASK_ASSIGNED' as any,
      title: 'Task Assigned',
      body: `${actorName} assigned you to task: ${taskTitle}`,
      meta: {
        targetUrl: `/dashboard/tasks?id=${taskId}`,
        taskId,
        taskTitle,
        actorName,
      } as any,
    },
  })

  return notification
}

export const createTaskStatusChangedNotification = async (
  userId: string,
  workspaceId: string,
  taskId: string,
  taskTitle: string,
  oldStatus: string,
  newStatus: string,
  actorName: string,
) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      workspaceId,
      type: 'TASK_STATUS_CHANGED' as any,
      title: 'Task Status Changed',
      body: `${actorName} changed task "${taskTitle}" from ${oldStatus} to ${newStatus}`,
      meta: {
        targetUrl: `/dashboard/tasks?id=${taskId}`,
        taskId,
        taskTitle,
        oldStatus,
        newStatus,
        actorName,
      } as any,
    },
  })

  return notification
}

export const createGoalCompletedNotification = async (
  workspaceId: string,
  goalId: string,
  goalTitle: string,
  actorName: string,
) => {
  // Get all workspace members
  const members = await prisma.membership.findMany({
    where: { workspaceId },
    select: { userId: true },
  })

  const notifications = await Promise.all(
    members.map(member =>
      prisma.notification.create({
        data: {
          userId: member.userId,
          workspaceId,
          type: 'GOAL_COMPLETED' as any,
          title: 'Goal Completed',
          body: `${actorName} completed goal: ${goalTitle}`,
          meta: {
            targetUrl: `/dashboard/goals/${goalId}`,
            goalId,
            goalTitle,
            actorName,
          } as any,
        },
      })
    )
  )

  return notifications
}

export const createAnnouncementNotification = async (
  workspaceId: string,
  announcementId: string,
  announcementTitle: string,
  actorName: string,
) => {
  // Get all workspace members
  const members = await prisma.membership.findMany({
    where: { workspaceId },
    select: { userId: true },
  })

  const notifications = await Promise.all(
    members.map(member =>
      prisma.notification.create({
        data: {
          userId: member.userId,
          workspaceId,
          type: 'ANNOUNCEMENT' as any,
          title: 'New Announcement',
          body: `${actorName} posted: ${announcementTitle}`,
          meta: {
            targetUrl: `/dashboard/announcements?id=${announcementId}`,
            announcementId,
            announcementTitle,
            actorName,
          } as any,
        },
      })
    )
  )

  return notifications
}

export const createWorkspaceInvitedNotification = async (
  userId: string,
  workspaceId: string,
  workspaceName: string,
  inviterName: string,
) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      workspaceId,
      type: 'WORKSPACE_INVITED' as any,
      title: 'Workspace Invitation',
      body: `${inviterName} invited you to join workspace: ${workspaceName}`,
      meta: {
        targetUrl: `/dashboard/workspace/${workspaceId}`,
        workspaceId,
        workspaceName,
        inviterName,
      } as any,
    },
  })

  return notification
}

export const createPromotedToManagerNotification = async (
  userId: string,
  workspaceId: string,
  workspaceName: string,
  promoterName: string,
) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      workspaceId,
      type: 'PROMOTED_TO_MANAGER' as any,
      title: 'Promoted to Manager',
      body: `${promoterName} promoted you to manager in workspace: ${workspaceName}`,
      meta: {
        targetUrl: `/dashboard/workspace/${workspaceId}`,
        workspaceId,
        workspaceName,
        promoterName,
      } as any,
    },
  })

  return notification
}

export const createRemovedFromWorkspaceNotification = async (
  userId: string,
  workspaceId: string,
  workspaceName: string,
  removerName: string,
) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      workspaceId,
      type: 'REMOVED_FROM_WORKSPACE' as any,
      title: 'Removed from Workspace',
      body: `${removerName} removed you from workspace: ${workspaceName}`,
      meta: {
        targetUrl: '/dashboard',
        workspaceId,
        workspaceName,
        removerName,
      } as any,
    },
  })

  return notification
}

export const createDeadlineReminderNotification = async (
  userId: string,
  workspaceId: string,
  taskId: string,
  taskTitle: string,
  dueDate: Date,
) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      workspaceId,
      type: 'DEADLINE_REMINDER' as any,
      title: 'Deadline Reminder',
      body: `Task "${taskTitle}" is due on ${dueDate.toLocaleDateString()}`,
      meta: {
        targetUrl: `/dashboard/tasks?id=${taskId}`,
        taskId,
        taskTitle,
        dueDate: dueDate.toISOString(),
      } as any,
    },
  })

  return notification
}

export const createMentionNotification = async (
  userId: string,
  workspaceId: string,
  announcementId: string,
  announcementTitle: string,
  mentionerName: string,
) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      workspaceId,
      type: 'MENTION' as any,
      title: 'You were mentioned',
      body: `${mentionerName} mentioned you in: ${announcementTitle}`,
      meta: {
        targetUrl: `/dashboard/announcements?id=${announcementId}`,
        announcementId,
        announcementTitle,
        mentionerName,
      } as any,
    },
  })

  return notification
}
