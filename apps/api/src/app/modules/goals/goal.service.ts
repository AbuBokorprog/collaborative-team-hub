import httpStatus from 'http-status'
import prisma from '../../helpers/prisma'
import { AppError } from '../../utils/AppError'
import { writeAuditLog } from '../../helpers/auditLog'
import { GoalStatus, TaskStatus } from '../../../generated/prisma/enums'
import { calculatePagination } from '../../helpers/pagination'

const assertMember = async (workspaceId: string, userId: string) => {
  const m = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  })
  if (!m) {
    throw new AppError(httpStatus.FORBIDDEN, 'Not a workspace member')
  }
  return m
}

const getGoalInWorkspace = async (goalId: string, workspaceId: string) => {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, workspaceId },
  })
  if (!goal) {
    throw new AppError(httpStatus.NOT_FOUND, 'Goal not found')
  }
  return goal
}

const calculateGoalProgress = async (goalId: string): Promise<number> => {
  const tasks = await prisma.task.findMany({
    where: { goalId },
    select: { status: true },
  })

  if (tasks.length === 0) return 0

  const completedTasks = tasks.filter(task => task.status === 'DONE').length
  return Math.round((completedTasks / tasks.length) * 100)
}

export const updateGoalProgress = async (goalId: string): Promise<void> => {
  const progress = await calculateGoalProgress(goalId)
  await prisma.goal.update({
    where: { id: goalId },
    data: { progress } as any,
  })
}

const getTaskStatusBreakdown = async (goalId: string) => {
  const tasks = await prisma.task.findMany({
    where: { goalId },
    select: { status: true },
  })

  const breakdown = {
    total: tasks.length,
    todo: 0,
    inProgress: 0,
    review: 0,
    done: 0,
    overdue: 0,
  }

  tasks.forEach(task => {
    switch (task.status) {
      case 'TODO':
        breakdown.todo++
        break
      case 'IN_PROGRESS':
        breakdown.inProgress++
        break
      case 'REVIEW':
        breakdown.review++
        break
      case 'DONE':
        breakdown.done++
        break
      case 'OVERDUE':
        breakdown.overdue++
        break
    }
  })

  return breakdown
}

export const listGoals = async (
  workspaceId: string,
  userId: string,
  query: {
    page?: number
    limit?: number
    status?: GoalStatus
    search?: string
  },
) => {
  await assertMember(workspaceId, userId)
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(query)

  const where = {
    workspaceId,
    ...(query.status ? { status: query.status } : {}),
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

  const sortField =
    sortBy === 'title' || sortBy === 'dueDate' || sortBy === 'status'
      ? sortBy
      : 'createdAt'

  const [items, total] = await Promise.all([
    prisma.goal.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortField]: sortOrder },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        _count: { select: { milestones: true, tasks: true } },
      },
    }),
    prisma.goal.count({ where }),
  ])

  return {
    data: items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export const createGoal = async (
  workspaceId: string,
  actorId: string,
  payload: {
    title: string
    description?: string
    dueDate?: Date
    status?: GoalStatus
    ownerId: string
  },
) => {
  await assertMember(workspaceId, actorId)
  const ownerMembership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: { userId: payload.ownerId, workspaceId },
    },
  })
  if (!ownerMembership) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Owner must be a workspace member',
    )
  }

  return prisma.goal.create({
    data: {
      title: payload.title,
      description: payload.description,
      dueDate: payload.dueDate,
      status: payload.status ?? GoalStatus.PLANNED,
      ownerId: payload.ownerId,
      workspaceId,
    },
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true } },
    },
  })
}

export const getGoal = async (
  goalId: string,
  workspaceId: string,
  userId: string,
) => {
  await assertMember(workspaceId, userId)
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, workspaceId },
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true } },
      milestones: { orderBy: { createdAt: 'asc' } },
      _count: { select: { tasks: true } },
    },
  })
  if (!goal) {
    throw new AppError(httpStatus.NOT_FOUND, 'Goal not found')
  }
  return goal
}

export const updateGoal = async (
  goalId: string,
  workspaceId: string,
  actorId: string,
  payload: {
    title?: string
    description?: string
    dueDate?: Date | null
    status?: GoalStatus
    ownerId?: string
  },
) => {
  await assertMember(workspaceId, actorId)
  const existing = await getGoalInWorkspace(goalId, workspaceId)

  if (payload.ownerId) {
    const om = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: { userId: payload.ownerId, workspaceId },
      },
    })
    if (!om) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Owner must be a workspace member',
      )
    }
  }

  const updated = await prisma.goal.update({
    where: { id: existing.id },
    data: {
      ...(payload.title !== undefined ? { title: payload.title } : {}),
      ...(payload.description !== undefined
        ? { description: payload.description }
        : {}),
      ...(payload.dueDate !== undefined ? { dueDate: payload.dueDate } : {}),
      ...(payload.status !== undefined ? { status: payload.status } : {}),
      ...(payload.ownerId !== undefined ? { ownerId: payload.ownerId } : {}),
    },
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true } },
    },
  })

  if (
    payload.status === GoalStatus.COMPLETED &&
    existing.status !== GoalStatus.COMPLETED
  ) {
    await writeAuditLog({
      workspaceId,
      actorId,
      action: 'GOAL_COMPLETED',
      metadata: { goalId },
    })

    // Send goal completion notification to all workspace members
    const { createGoalCompletedNotification } = await import('../notifications/notification.service')
    const actor = await prisma.user.findUnique({ where: { id: actorId }, select: { name: true } })
    await createGoalCompletedNotification(
      workspaceId,
      goalId,
      existing.title,
      actor?.name || 'Unknown'
    )
  }

  return updated
}

export const deleteGoal = async (
  goalId: string,
  workspaceId: string,
  userId: string,
) => {
  await assertMember(workspaceId, userId)
  await getGoalInWorkspace(goalId, workspaceId)
  await prisma.goal.delete({ where: { id: goalId } })
}

export const createMilestone = async (
  goalId: string,
  workspaceId: string,
  userId: string,
  payload: { title: string; progressPercentage?: number },
) => {
  await assertMember(workspaceId, userId)
  await getGoalInWorkspace(goalId, workspaceId)

  return prisma.milestone.create({
    data: {
      title: payload.title,
      progressPercentage: payload.progressPercentage ?? 0,
      goalId,
    },
  })
}

export const updateMilestone = async (
  milestoneId: string,
  workspaceId: string,
  userId: string,
  payload: { title?: string; progressPercentage?: number },
) => {
  await assertMember(workspaceId, userId)
  const ms = await prisma.milestone.findFirst({
    where: { id: milestoneId, goal: { workspaceId } },
  })
  if (!ms) {
    throw new AppError(httpStatus.NOT_FOUND, 'Milestone not found')
  }

  return prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      ...(payload.title !== undefined ? { title: payload.title } : {}),
      ...(payload.progressPercentage !== undefined
        ? { progressPercentage: payload.progressPercentage }
        : {}),
    },
  })
}

export const deleteMilestone = async (
  milestoneId: string,
  workspaceId: string,
  userId: string,
) => {
  await assertMember(workspaceId, userId)
  const ms = await prisma.milestone.findFirst({
    where: { id: milestoneId, goal: { workspaceId } },
  })
  if (!ms) {
    throw new AppError(httpStatus.NOT_FOUND, 'Milestone not found')
  }

  await prisma.milestone.delete({ where: { id: milestoneId } })
}

export const addGoalUpdate = async (
  goalId: string,
  workspaceId: string,
  authorId: string,
  body: string,
) => {
  await assertMember(workspaceId, authorId)
  await getGoalInWorkspace(goalId, workspaceId)

  return prisma.goalUpdate.create({
    data: {
      body,
      goalId,
      authorId,
    },
    include: {
      author: { select: { id: true, name: true, avatar: true } },
    },
  })
}

export const listGoalActivity = async (
  goalId: string,
  workspaceId: string,
  userId: string,
) => {
  await assertMember(workspaceId, userId)
  await getGoalInWorkspace(goalId, workspaceId)

  const updates = await prisma.goalUpdate.findMany({
    where: { goalId },
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { id: true, name: true, avatar: true } },
    },
  })

  return { updates }
}

export const getGoalAnalytics = async (
  goalId: string,
  workspaceId: string,
  userId: string,
) => {
  await assertMember(workspaceId, userId)
  const goal = await getGoalInWorkspace(goalId, workspaceId)

  const [taskBreakdown, assignedMembers, recentTasks] = await Promise.all([
    getTaskStatusBreakdown(goalId),
    prisma.task.findMany({
      where: { goalId, assigneeId: { not: null } },
      select: { assignee: { select: { id: true, name: true, avatar: true } } },
      distinct: ['assigneeId'],
    }),
    prisma.task.findMany({
      where: { goalId },
      select: {
        id: true,
        title: true,
        status: true,
        assignee: { select: { id: true, name: true, avatar: true } },
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
  ])

  return {
    goal: {
      id: goal.id,
      title: goal.title,
      status: goal.status,
      dueDate: goal.dueDate,
      progress: (goal as any).progress || 0,
    },
    taskBreakdown,
    assignedMembers: assignedMembers.map(t => t.assignee).filter(Boolean),
    recentTasks,
    progress: await calculateGoalProgress(goalId),
  }
}
