import httpStatus from 'http-status'
import prisma from '../../helpers/prisma'
import { AppError } from '../../utils/AppError'
import { writeAuditLog } from '../../helpers/auditLog'
import { calculatePagination } from '../../helpers/pagination'
import { Priority, TaskStatus } from '../../../generated/prisma/enums'

const assertMember = async (workspaceId: string, userId: string) => {
  const m = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  })
  if (!m) throw new AppError(httpStatus.FORBIDDEN, 'Not a workspace member')
  return m
}

const canAssignTask = async (
  workspaceId: string,
  actorId: string,
): Promise<boolean> => {
  const membership = await assertMember(workspaceId, actorId)
  return membership.role === 'ADMIN' || membership.role === 'MANAGER'
}

const canUpdateTask = async (
  taskId: string,
  workspaceId: string,
  actorId: string,
): Promise<boolean> => {
  const membership = await assertMember(workspaceId, actorId)

  // Admin and Manager can update any task
  if (membership.role === 'ADMIN' || membership.role === 'MANAGER') {
    return true
  }

  // Members can only update their own assigned tasks
  const task = await prisma.task.findFirst({
    where: { id: taskId, workspaceId },
    select: { assigneeId: true },
  })

  return task?.assigneeId === actorId
}

export const listTasks = async (
  workspaceId: string,
  requesterId: string,
  query: {
    page?: number
    limit?: number
    status?: TaskStatus
    goalId?: string
    assigneeId?: string
    search?: string
  },
) => {
  await assertMember(workspaceId, requesterId)
  const { skip, limit, page, sortOrder } = calculatePagination(query)

  const where = {
    workspaceId,
    ...(query.status ? { status: query.status } : {}),
    ...(query.goalId ? { goalId: query.goalId } : {}),
    ...(query.assigneeId ? { assigneeId: query.assigneeId } : {}),
    ...(query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: 'insensitive' as const } },
            {
              description: {
                contains: query.search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: sortOrder as 'asc' | 'desc' },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        goal: { select: { id: true, title: true } },
      },
    }),
    prisma.task.count({ where }),
  ])

  return {
    data: items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export const getTask = async (
  taskId: string,
  workspaceId: string,
  userId: string,
) => {
  await assertMember(workspaceId, userId)
  const task = await prisma.task.findFirst({
    where: { id: taskId, workspaceId },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
      goal: { select: { id: true, title: true } },
    },
  })
  if (!task) throw new AppError(httpStatus.NOT_FOUND, 'Task not found')
  return task
}

export const createTask = async (
  actorId: string,
  payload: {
    title: string
    description?: string
    priority?: Priority
    dueDate?: Date
    status?: TaskStatus
    assigneeId?: string | null
    goalId?: string | null
    workspaceId: string
  },
) => {
  await assertMember(payload.workspaceId, actorId)

  // Check assignment permissions
  if (payload.assigneeId && payload.assigneeId !== actorId) {
    const hasPermission = await canAssignTask(payload.workspaceId, actorId)
    if (!hasPermission) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Only Admin or Manager can assign tasks to others',
      )
    }
  }

  if (payload.assigneeId) {
    const m = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: payload.assigneeId,
          workspaceId: payload.workspaceId,
        },
      },
    })
    if (!m) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Assignee must be a workspace member',
      )
    }
  }

  if (payload.goalId) {
    const g = await prisma.goal.findFirst({
      where: { id: payload.goalId, workspaceId: payload.workspaceId },
    })
    if (!g)
      throw new AppError(httpStatus.BAD_REQUEST, 'Goal not found in workspace')
  }

  const task = await prisma.task.create({
    data: {
      title: payload.title,
      description: payload.description,
      priority: payload.priority ?? Priority.MEDIUM,
      dueDate: payload.dueDate,
      status: payload.status ?? TaskStatus.TODO,
      assigneeId: payload.assigneeId ?? undefined,
      goalId: payload.goalId ?? undefined,
      workspaceId: payload.workspaceId,
    },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
      goal: { select: { id: true, title: true } },
    },
  })

  // Update goal progress if task is linked to a goal
  if (payload.goalId) {
    const { updateGoalProgress } = await import('../goals/goal.service')
    await updateGoalProgress(payload.goalId)
  }

  // Send notification if task is assigned to someone else
  if (payload.assigneeId && payload.assigneeId !== actorId) {
    const { createTaskAssignedNotification } =
      await import('../notifications/notification.service')
    const actor = await prisma.user.findUnique({
      where: { id: actorId },
      select: { name: true },
    })
    await createTaskAssignedNotification(
      payload.assigneeId,
      payload.workspaceId,
      task.id,
      task.title,
      actor?.name || 'Unknown',
    )
  }

  await writeAuditLog({
    workspaceId: payload.workspaceId,
    actorId,
    action: 'TASK_CREATED',
    metadata: { taskId: task.id },
  })

  return task
}

export const updateTask = async (
  taskId: string,
  workspaceId: string,
  actorId: string,
  payload: {
    title?: string
    description?: string
    priority?: Priority
    dueDate?: Date | null
    status?: TaskStatus
    assigneeId?: string | null
    goalId?: string | null
  },
) => {
  await assertMember(workspaceId, actorId)
  const existing = await prisma.task.findFirst({
    where: { id: taskId, workspaceId },
  })
  if (!existing) throw new AppError(httpStatus.NOT_FOUND, 'Task not found')

  // Check update permissions
  const hasPermission = await canUpdateTask(taskId, workspaceId, actorId)
  if (!hasPermission) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can only update your own assigned tasks',
    )
  }

  // Check assignment permissions if changing assignee
  if (
    payload.assigneeId !== undefined &&
    payload.assigneeId !== existing.assigneeId
  ) {
    const hasAssignPermission = await canAssignTask(workspaceId, actorId)
    if (!hasAssignPermission) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Only Admin or Manager can change task assignment',
      )
    }
  }

  if (payload.assigneeId) {
    const m = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: { userId: payload.assigneeId, workspaceId },
      },
    })
    if (!m) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Assignee must be a workspace member',
      )
    }
  }

  if (payload.goalId) {
    const g = await prisma.goal.findFirst({
      where: { id: payload.goalId, workspaceId },
    })
    if (!g)
      throw new AppError(httpStatus.BAD_REQUEST, 'Goal not found in workspace')
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(payload.title !== undefined ? { title: payload.title } : {}),
      ...(payload.description !== undefined
        ? { description: payload.description }
        : {}),
      ...(payload.priority !== undefined ? { priority: payload.priority } : {}),
      ...(payload.dueDate !== undefined ? { dueDate: payload.dueDate } : {}),
      ...(payload.status !== undefined ? { status: payload.status } : {}),
      ...(payload.assigneeId !== undefined
        ? { assigneeId: payload.assigneeId }
        : {}),
      ...(payload.goalId !== undefined ? { goalId: payload.goalId } : {}),
    },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
      goal: { select: { id: true, title: true } },
    },
  })

  // Update goal progress for old and new goals if goal assignment changed
  const goalsToUpdate = new Set<string>()
  if (existing.goalId) goalsToUpdate.add(existing.goalId)
  if (payload.goalId) goalsToUpdate.add(payload.goalId)

  for (const goalId of goalsToUpdate) {
    const { updateGoalProgress } = await import('../goals/goal.service')
    await updateGoalProgress(goalId)
  }

  // Send notification if task status changed
  if (payload.status && payload.status !== existing.status) {
    const { createTaskStatusChangedNotification } =
      await import('../notifications/notification.service')
    const actor = await prisma.user.findUnique({
      where: { id: actorId },
      select: { name: true },
    })

    // Notify the assignee if they're not the one making the change
    if (existing.assigneeId && existing.assigneeId !== actorId) {
      await createTaskStatusChangedNotification(
        existing.assigneeId,
        workspaceId,
        task.id,
        task.title,
        existing.status,
        payload.status,
        actor?.name || 'Unknown',
      )
    }
  }

  await writeAuditLog({
    workspaceId,
    actorId,
    action: 'TASK_UPDATED',
    metadata: { taskId: task.id, changes: payload },
  })

  return task
}

export const deleteTask = async (
  taskId: string,
  workspaceId: string,
  userId: string,
) => {
  await assertMember(workspaceId, userId)
  const existing = await prisma.task.findFirst({
    where: { id: taskId, workspaceId },
  })
  if (!existing) throw new AppError(httpStatus.NOT_FOUND, 'Task not found')

  // Check delete permissions (Admin/Manager can delete any task, Members only their own)
  const hasPermission = await canUpdateTask(taskId, workspaceId, userId)
  if (!hasPermission) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can only delete your own assigned tasks',
    )
  }

  const goalId = existing.goalId

  await prisma.task.delete({ where: { id: taskId } })

  // Update goal progress if task was linked to a goal
  if (goalId) {
    const { updateGoalProgress } = await import('../goals/goal.service')
    await updateGoalProgress(goalId)
  }
}
