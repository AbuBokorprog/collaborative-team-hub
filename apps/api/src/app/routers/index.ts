import express from 'express'
import { userRouter } from '../modules/users/user.route'
import { authRouter } from '../modules/auth/authRoute'
import { workspaceRouter } from '../modules/workspaces/workspace.route'
import { goalRouter } from '../modules/goals/goal.route'
import { milestoneRouter } from '../modules/milestones/milestone.route'
import { announcementRouter } from '../modules/announcements/announcement.route'
import { taskRouter } from '../modules/tasks/task.route'
import { notificationRouter } from '../modules/notifications/notification.route'
import { analyticsRouter } from '../modules/analytics/analytics.route'
import { exportRouter } from '../modules/export/export.route'
import { auditRouter } from '../modules/audit/audit.route'

const router = express.Router()

const moduleRoutes = [
  { path: '/auth', route: authRouter },
  { path: '/users', route: userRouter },
  { path: '/workspaces', route: workspaceRouter },
  { path: '/goals', route: goalRouter },
  { path: '/milestones', route: milestoneRouter },
  { path: '/announcements', route: announcementRouter },
  { path: '/tasks', route: taskRouter },
  { path: '/notifications', route: notificationRouter },
  { path: '/analytics', route: analyticsRouter },
  { path: '/export', route: exportRouter },
  { path: '/audit-logs', route: auditRouter },
]

moduleRoutes.forEach(({ path, route }) => router.use(path, route))

export default router
