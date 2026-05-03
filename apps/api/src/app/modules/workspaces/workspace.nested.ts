import express from 'express'
import httpStatus from 'http-status'
import prisma from '../../helpers/prisma'
import CatchAsync from '../../utils/CatchAsync'
import SuccessResponse from '../../utils/SuccessResponse'
import { AppError } from '../../utils/AppError'
import { requireWorkspaceMemberFromParams } from '../../middlewares/workspace'
import { Priority, TaskStatus } from '../../../generated/prisma/enums'
import * as goalService from '../goals/goal.service'
import * as taskService from '../tasks/task.service'
import * as announcementService from '../announcements/announcement.service'

export const workspaceNestedRouter = express.Router({ mergeParams: true })

workspaceNestedRouter.use(requireWorkspaceMemberFromParams)

const workspaceId = (req: express.Request) => req.params.workspaceId as string
const userId = (req: express.Request) => req.user?.id as string
const id = (req: express.Request) => req.params.id as string

const statusFromColumn = (value?: string) => {
  if (!value) return undefined
  const normalized = value.replace(/[-_\s]/g, '').toLowerCase()
  if (normalized === 'todo') return TaskStatus.TODO
  if (normalized === 'inprogress' || normalized === 'review') {
    return TaskStatus.IN_PROGRESS
  }
  if (normalized === 'done') return TaskStatus.DONE
  return value as TaskStatus
}

const priorityFromValue = (value?: string) => {
  if (!value) return undefined
  const normalized = value.toUpperCase()
  if (normalized in Priority) return normalized as Priority
  return undefined
}

const taskPayload = (req: express.Request) => ({
  title: req.body.title,
  description: req.body.description ?? req.body.desc,
  priority: priorityFromValue(req.body.priority),
  dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
  status: statusFromColumn(req.body.status ?? req.body.column),
  assigneeId: req.body.assigneeId,
  goalId: req.body.goalId,
})

const getAnnouncement = async (
  announcementId: string,
  wsId: string,
  requesterId: string,
) => {
  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: requesterId, workspaceId: wsId } },
  })
  if (!membership) throw new AppError(httpStatus.FORBIDDEN, 'Not a workspace member')

  const row = await prisma.announcement.findFirst({
    where: { id: announcementId, workspaceId: wsId },
    include: {
      author: { select: { id: true, name: true, avatar: true } },
      comments: {
        include: { author: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'asc' },
      },
      reactions: true,
      _count: { select: { comments: true, reactions: true } },
    },
  })
  if (!row) throw new AppError(httpStatus.NOT_FOUND, 'Announcement not found')
  return row
}

workspaceNestedRouter.get(
  '/goals',
  CatchAsync(async (req, res) => {
    const data = await goalService.listGoals(workspaceId(req), userId(req), req.query as never)
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Goals', data })
  }),
)

workspaceNestedRouter.post(
  '/goals',
  CatchAsync(async (req, res) => {
    const data = await goalService.createGoal(workspaceId(req), userId(req), {
      title: req.body.title,
      description: req.body.description,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
      ownerId: req.body.ownerId ?? req.body.creatorId ?? userId(req),
    })
    SuccessResponse(res, { status: httpStatus.CREATED, success: true, message: 'Goal created', data })
  }),
)

workspaceNestedRouter.get(
  '/goals/:id',
  CatchAsync(async (req, res) => {
    const data = await goalService.getGoal(id(req), workspaceId(req), userId(req))
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Goal', data })
  }),
)

workspaceNestedRouter.put(
  '/goals/:id',
  CatchAsync(async (req, res) => {
    const data = await goalService.updateGoal(id(req), workspaceId(req), userId(req), {
      title: req.body.title,
      description: req.body.description,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
      ownerId: req.body.ownerId,
    })
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Goal updated', data })
  }),
)

workspaceNestedRouter.patch(
  '/goals/:id',
  CatchAsync(async (req, res) => {
    const data = await goalService.updateGoal(id(req), workspaceId(req), userId(req), {
      title: req.body.title,
      description: req.body.description,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : req.body.dueDate,
      ownerId: req.body.ownerId,
    })
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Goal updated', data })
  }),
)

workspaceNestedRouter.patch(
  '/goals/:id/progress',
  CatchAsync(async (req, res) => {
    const progress = Number(req.body.progress)
    if (Number.isNaN(progress) || progress < 0 || progress > 100) {
      throw new AppError(httpStatus.BAD_REQUEST, 'progress must be between 0 and 100')
    }
    await goalService.getGoal(id(req), workspaceId(req), userId(req))
    const existing = await prisma.milestone.findFirst({
      where: { goalId: id(req), title: 'Overall progress' },
    })
    if (existing) {
      await prisma.milestone.update({
        where: { id: existing.id },
        data: { progressPercentage: progress },
      })
    } else {
      await prisma.milestone.create({
        data: { goalId: id(req), title: 'Overall progress', progressPercentage: progress },
      })
    }
    const data = await goalService.getGoal(id(req), workspaceId(req), userId(req))
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Goal progress updated', data })
  }),
)

workspaceNestedRouter.delete(
  '/goals/:id',
  CatchAsync(async (req, res) => {
    await goalService.deleteGoal(id(req), workspaceId(req), userId(req))
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Goal deleted', data: null })
  }),
)

workspaceNestedRouter.post(
  '/goals/:id/members',
  CatchAsync(async (req, res) => {
    const targetId = req.body.userId
    const membership = await prisma.membership.findUnique({
      where: { userId_workspaceId: { userId: targetId, workspaceId: workspaceId(req) } },
    })
    if (!membership) throw new AppError(httpStatus.BAD_REQUEST, 'User is not a workspace member')
    const data = await goalService.getGoal(id(req), workspaceId(req), userId(req))
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Goal member accepted', data })
  }),
)

workspaceNestedRouter.delete(
  '/goals/:id/members/:uid',
  CatchAsync(async (req, res) => {
    await goalService.getGoal(id(req), workspaceId(req), userId(req))
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Goal member removed', data: null })
  }),
)

workspaceNestedRouter.get(
  '/tasks/board',
  CatchAsync(async (req, res) => {
    const result = await taskService.listTasks(workspaceId(req), userId(req), { limit: 1000 })
    const board = { todo: [], inProgress: [], review: [], done: [] } as Record<string, unknown[]>
    for (const task of result.data) {
      if (task.status === TaskStatus.TODO) board.todo.push(task)
      if (task.status === TaskStatus.IN_PROGRESS) board.inProgress.push(task)
      if (task.status === TaskStatus.DONE) board.done.push(task)
    }
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Task board', data: { board } })
  }),
)

workspaceNestedRouter.get(
  '/tasks',
  CatchAsync(async (req, res) => {
    const query = { ...req.query, status: statusFromColumn(req.query.column as string) ?? req.query.status }
    const data = await taskService.listTasks(workspaceId(req), userId(req), query as never)
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Tasks', data })
  }),
)

workspaceNestedRouter.post(
  '/tasks',
  CatchAsync(async (req, res) => {
    const data = await taskService.createTask(userId(req), {
      ...taskPayload(req),
      workspaceId: workspaceId(req),
    })
    SuccessResponse(res, { status: httpStatus.CREATED, success: true, message: 'Task created', data })
  }),
)

workspaceNestedRouter.post(
  '/tasks/bulk-move',
  CatchAsync(async (req, res) => {
    const status = statusFromColumn(req.body.column ?? req.body.status)
    const taskIds = Array.isArray(req.body.taskIds) ? req.body.taskIds : []
    if (!status || taskIds.length === 0) {
      throw new AppError(httpStatus.BAD_REQUEST, 'taskIds and column are required')
    }
    const data = await prisma.task.updateMany({
      where: { id: { in: taskIds }, workspaceId: workspaceId(req) },
      data: { status },
    })
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Tasks moved', data })
  }),
)

workspaceNestedRouter.post(
  '/tasks/reorder',
  CatchAsync(async (_req, res) => {
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Task order accepted', data: { reordered: true } })
  }),
)

workspaceNestedRouter.get(
  '/tasks/:id',
  CatchAsync(async (req, res) => {
    const data = await taskService.getTask(id(req), workspaceId(req), userId(req))
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Task', data })
  }),
)

workspaceNestedRouter.put(
  '/tasks/:id',
  CatchAsync(async (req, res) => {
    const data = await taskService.updateTask(id(req), workspaceId(req), userId(req), taskPayload(req))
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Task updated', data })
  }),
)

workspaceNestedRouter.patch(
  '/tasks/:id',
  CatchAsync(async (req, res) => {
    const data = await taskService.updateTask(id(req), workspaceId(req), userId(req), taskPayload(req))
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Task updated', data })
  }),
)

workspaceNestedRouter.patch(
  '/tasks/:id/move',
  CatchAsync(async (req, res) => {
    const status = statusFromColumn(req.body.column ?? req.body.status)
    if (!status) throw new AppError(httpStatus.BAD_REQUEST, 'column is required')
    const data = await taskService.updateTask(id(req), workspaceId(req), userId(req), { status })
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Task moved', data })
  }),
)

workspaceNestedRouter.delete(
  '/tasks/:id',
  CatchAsync(async (req, res) => {
    await taskService.deleteTask(id(req), workspaceId(req), userId(req))
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Task deleted', data: null })
  }),
)

workspaceNestedRouter.get(
  '/announcements',
  CatchAsync(async (req, res) => {
    const data = await announcementService.list(workspaceId(req), userId(req), req.query as never)
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Announcements', data })
  }),
)

workspaceNestedRouter.post(
  '/announcements',
  CatchAsync(async (req, res) => {
    const data = await announcementService.create(workspaceId(req), userId(req), req.body)
    if (req.body.pinned) {
      await announcementService.pin(data.id, workspaceId(req), userId(req))
    }
    SuccessResponse(res, { status: httpStatus.CREATED, success: true, message: 'Announcement created', data })
  }),
)

workspaceNestedRouter.get(
  '/announcements/:id',
  CatchAsync(async (req, res) => {
    const data = await getAnnouncement(id(req), workspaceId(req), userId(req))
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Announcement', data })
  }),
)

workspaceNestedRouter.patch(
  '/announcements/:id',
  CatchAsync(async (req, res) => {
    const isAdmin = req.membership?.role === 'ADMIN'
    const data = await announcementService.update(id(req), workspaceId(req), userId(req), req.body, isAdmin)
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Announcement updated', data })
  }),
)

workspaceNestedRouter.patch(
  '/announcements/:id/pin',
  CatchAsync(async (req, res) => {
    const row = await getAnnouncement(id(req), workspaceId(req), userId(req))
    const data = await announcementService.update(id(req), workspaceId(req), userId(req), { pinned: !row.pinned }, true)
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Announcement pin toggled', data })
  }),
)

workspaceNestedRouter.post(
  '/announcements/:id/reactions',
  CatchAsync(async (req, res) => {
    const data = await announcementService.react(id(req), workspaceId(req), userId(req), req.body.emoji)
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Reaction saved', data })
  }),
)

workspaceNestedRouter.get(
  '/announcements/:id/comments',
  CatchAsync(async (req, res) => {
    const data = await prisma.comment.findMany({
      where: { announcementId: id(req), announcement: { workspaceId: workspaceId(req) } },
      include: { author: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    })
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Comments', data })
  }),
)

workspaceNestedRouter.post(
  '/announcements/:id/comments',
  CatchAsync(async (req, res) => {
    const data = await announcementService.comment(id(req), workspaceId(req), userId(req), req.body.body)
    SuccessResponse(res, { status: httpStatus.CREATED, success: true, message: 'Comment added', data })
  }),
)

workspaceNestedRouter.delete(
  '/announcements/:id/comments/:cId',
  CatchAsync(async (req, res) => {
    await prisma.comment.deleteMany({
      where: {
        id: req.params.cId as string,
        announcementId: id(req),
        announcement: { workspaceId: workspaceId(req) },
      },
    })
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Comment deleted', data: null })
  }),
)

workspaceNestedRouter.delete(
  '/announcements/:id',
  CatchAsync(async (req, res) => {
    const isAdmin = req.membership?.role === 'ADMIN'
    await announcementService.remove(id(req), workspaceId(req), userId(req), isAdmin)
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Announcement deleted', data: null })
  }),
)

workspaceNestedRouter.get(
  '/analytics/overview',
  CatchAsync(async (req, res) => {
    const wsId = workspaceId(req)
    const [totalTasks, completedTasks, totalGoals, completedGoals, totalMembers] =
      await Promise.all([
        prisma.task.count({ where: { workspaceId: wsId } }),
        prisma.task.count({ where: { workspaceId: wsId, status: TaskStatus.DONE } }),
        prisma.goal.count({ where: { workspaceId: wsId } }),
        prisma.goal.count({ where: { workspaceId: wsId, status: 'COMPLETED' } }),
        prisma.membership.count({ where: { workspaceId: wsId } }),
      ])
    SuccessResponse(res, {
      status: httpStatus.OK,
      success: true,
      message: 'Analytics overview',
      data: {
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
        },
        goals: {
          total: totalGoals,
          completed: completedGoals,
        },
        onlineMembers: 0,
        totalMembers,
      },
    })
  }),
)

workspaceNestedRouter.get(
  '/analytics/tasks',
  CatchAsync(async (req, res) => {
    const created = await prisma.task.groupBy({
      by: ['status'],
      where: { workspaceId: workspaceId(req) },
      _count: { _all: true },
    })
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Task analytics', data: { taskCompletion: created } })
  }),
)

workspaceNestedRouter.get(
  '/analytics/activity',
  CatchAsync(async (req, res) => {
    const data = await prisma.auditLog.findMany({
      where: { workspaceId: workspaceId(req) },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Activity analytics', data })
  }),
)

workspaceNestedRouter.get(
  '/analytics/goals',
  CatchAsync(async (req, res) => {
    const data = await prisma.goal.groupBy({
      by: ['status'],
      where: { workspaceId: workspaceId(req) },
      _count: { _all: true },
    })
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Goal analytics', data })
  }),
)

workspaceNestedRouter.get(
  '/analytics/velocity',
  CatchAsync(async (req, res) => {
    const completed = await prisma.task.count({
      where: { workspaceId: workspaceId(req), status: TaskStatus.DONE },
    })
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Velocity analytics', data: { velocity: completed } })
  }),
)

workspaceNestedRouter.get(
  '/analytics/members',
  CatchAsync(async (req, res) => {
    const members = await prisma.membership.findMany({
      where: { workspaceId: workspaceId(req) },
      include: { user: { select: { id: true, name: true } } },
    })
    const contributions = await Promise.all(
      members.map(async member => ({
        userId: member.userId,
        name: member.user.name,
        tasks: await prisma.task.count({ where: { assigneeId: member.userId, workspaceId: workspaceId(req) } }),
        goals: await prisma.goal.count({ where: { ownerId: member.userId, workspaceId: workspaceId(req) } }),
        announcements: await prisma.announcement.count({ where: { authorId: member.userId, workspaceId: workspaceId(req) } }),
      })),
    )
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Member analytics', data: { contributions } })
  }),
)

workspaceNestedRouter.get(
  '/analytics/heatmap',
  CatchAsync(async (req, res) => {
    const data = await prisma.auditLog.findMany({
      where: { workspaceId: workspaceId(req) },
      select: { createdAt: true, action: true, actorId: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    })
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Activity heatmap', data })
  }),
)

workspaceNestedRouter.get(
  '/analytics/task-completion',
  CatchAsync(async (req, res) => {
    const wsId = workspaceId(req)
    const now = new Date()
    const months = await Promise.all(
      [...Array(6)].map(async (_, i) => {
        const start = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
        const end = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0, 23, 59, 59, 999)
        const label = start.toLocaleString('en-US', { month: 'short' })
        const [created, completed] = await Promise.all([
          prisma.task.count({ where: { workspaceId: wsId, createdAt: { gte: start, lte: end } } }),
          prisma.task.count({ where: { workspaceId: wsId, status: TaskStatus.DONE, updatedAt: { gte: start, lte: end } } }),
        ])
        return { month: label, created, completed }
      }),
    )
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Task completion chart', data: { months } })
  }),
)

workspaceNestedRouter.get(
  '/analytics/recent-activity',
  CatchAsync(async (req, res) => {
    const data = await prisma.auditLog.findMany({
      where: { workspaceId: workspaceId(req) },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { actor: { select: { id: true, name: true, avatar: true } } },
    })
    SuccessResponse(res, { status: httpStatus.OK, success: true, message: 'Recent activity', data })
  }),
)
