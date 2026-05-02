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
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
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

export const getTask = async (taskId: string, workspaceId: string, userId: string) => {
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

  if (payload.assigneeId) {
    const m = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: { userId: payload.assigneeId, workspaceId: payload.workspaceId },
      },
    })
    if (!m) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Assignee must be a workspace member')
    }
  }

  if (payload.goalId) {
    const g = await prisma.goal.findFirst({
      where: { id: payload.goalId, workspaceId: payload.workspaceId },
    })
    if (!g) throw new AppError(httpStatus.BAD_REQUEST, 'Goal not found in workspace')
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

  if (payload.assigneeId) {
    const m = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: { userId: payload.assigneeId, workspaceId },
      },
    })
    if (!m) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Assignee must be a workspace member')
    }
  }

  if (payload.goalId) {
    const g = await prisma.goal.findFirst({
      where: { id: payload.goalId, workspaceId },
    })
    if (!g) throw new AppError(httpStatus.BAD_REQUEST, 'Goal not found in workspace')
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(payload.title !== undefined ? { title: payload.title } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
      ...(payload.priority !== undefined ? { priority: payload.priority } : {}),
      ...(payload.dueDate !== undefined ? { dueDate: payload.dueDate } : {}),
      ...(payload.status !== undefined ? { status: payload.status } : {}),
      ...(payload.assigneeId !== undefined ? { assigneeId: payload.assigneeId } : {}),
      ...(payload.goalId !== undefined ? { goalId: payload.goalId } : {}),
    },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
      goal: { select: { id: true, title: true } },
    },
  })

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

  await prisma.task.delete({ where: { id: taskId } })
}
