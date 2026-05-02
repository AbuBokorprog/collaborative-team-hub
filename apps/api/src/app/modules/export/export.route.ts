import express from 'express'
import httpStatus from 'http-status'
import Auth from '../../middlewares/Auth'
import CatchAsync from '../../utils/CatchAsync'
import prisma from '../../helpers/prisma'
import { requireWorkspaceMember } from '../../middlewares/workspace'

const router = express.Router()

router.use(Auth())
router.use(requireWorkspaceMember)

router.get(
  '/csv',
  CatchAsync(async (req, res) => {
    const workspaceId = req.workspaceId as string

    const [workspace, goals, tasks, members] = await Promise.all([
      prisma.workspace.findUnique({ where: { id: workspaceId } }),
      prisma.goal.findMany({
        where: { workspaceId },
        include: { owner: { select: { email: true, name: true } } },
      }),
      prisma.task.findMany({
        where: { workspaceId },
        include: {
          assignee: { select: { email: true } },
          goal: { select: { title: true } },
        },
      }),
      prisma.membership.findMany({
        where: { workspaceId },
        include: { user: { select: { email: true, name: true } } },
      }),
    ])

    const escape = (v: string | number | null | undefined) => {
      const s = String(v ?? '')
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`
      }
      return s
    }

    const lines: string[] = []
    lines.push('section,key,value')
    lines.push(`workspace,name,${escape(workspace?.name)}`)
    lines.push(`workspace,description,${escape(workspace?.description ?? '')}`)

    lines.push('goals,id,title,status,ownerEmail,dueDate')
    for (const g of goals) {
      lines.push(
        [
          'goal',
          g.id,
          g.title,
          g.status,
          g.owner.email,
          g.dueDate?.toISOString() ?? '',
        ]
          .map(escape)
          .join(','),
      )
    }

    lines.push('tasks,id,title,status,priority,assigneeEmail,goalTitle,dueDate')
    for (const t of tasks) {
      lines.push(
        [
          'task',
          t.id,
          t.title,
          t.status,
          t.priority,
          t.assignee?.email ?? '',
          t.goal?.title ?? '',
          t.dueDate?.toISOString() ?? '',
        ]
          .map(escape)
          .join(','),
      )
    }

    lines.push('members,email,role')
    for (const m of members) {
      lines.push(['member', m.user.email, m.role].map(escape).join(','))
    }

    const csv = lines.join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="workspace-${workspaceId}.csv"`,
    )
    res.status(httpStatus.OK).send(csv)
  }),
)

export const exportRouter = router
