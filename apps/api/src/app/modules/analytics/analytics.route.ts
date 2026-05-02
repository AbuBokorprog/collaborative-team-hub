import express from 'express'
import httpStatus from 'http-status'
import Auth from '../../middlewares/Auth'
import CatchAsync from '../../utils/CatchAsync'
import SuccessResponse from '../../utils/SuccessResponse'
import prisma from '../../helpers/prisma'
import { requireWorkspaceMember } from '../../middlewares/workspace'
import {
  GoalStatus,
  TaskStatus,
  UserStatus,
} from '../../../generated/prisma/enums'

const router = express.Router()

router.use(Auth())
router.use(requireWorkspaceMember)

router.get(
  '/dashboard',
  CatchAsync(async (req, res) => {
    const workspaceId = req.workspaceId as string

    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const [
      totalGoals,
      completedThisWeek,
      overdueTasks,
      activeMembers,
      goalsCompletedSeries,
    ] = await Promise.all([
      prisma.goal.count({ where: { workspaceId } }),
      prisma.goal.count({
        where: {
          workspaceId,
          status: GoalStatus.COMPLETED,
          updatedAt: { gte: startOfWeek },
        },
      }),
      prisma.task.count({
        where: {
          workspaceId,
          status: { not: TaskStatus.DONE },
          dueDate: { lt: now },
        },
      }),
      prisma.membership.count({
        where: {
          workspaceId,
          user: { status: UserStatus.ACTIVE },
        },
      }),
      Promise.all(
        [...Array(7)].map(async (_, i) => {
          const dayStart = new Date(now)
          dayStart.setDate(now.getDate() - (6 - i))
          dayStart.setHours(0, 0, 0, 0)
          const dayEnd = new Date(dayStart)
          dayEnd.setHours(23, 59, 59, 999)

          const count = await prisma.goal.count({
            where: {
              workspaceId,
              status: GoalStatus.COMPLETED,
              updatedAt: { gte: dayStart, lte: dayEnd },
            },
          })

          return {
            date: dayStart.toISOString().slice(0, 10),
            completedGoals: count,
          }
        }),
      ),
    ])

    SuccessResponse(res, {
      status: httpStatus.OK,
      success: true,
      message: 'Dashboard',
      data: {
        totalGoals,
        completedThisWeek,
        overdueTasks,
        activeMembers,
        completionChart: goalsCompletedSeries,
      },
    })
  }),
)

export const analyticsRouter = router
