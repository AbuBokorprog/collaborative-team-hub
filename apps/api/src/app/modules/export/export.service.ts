import prisma from '../../helpers/prisma'

const escapeCsv = (value: string | number | null | undefined) => {
  const text = String(value ?? '')
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export interface ExportOptions {
  startDate?: string
  endDate?: string
  userId?: string
  role?: string
}

export const buildWorkspaceCsv = async (workspaceId: string, options: ExportOptions = {}) => {
  const { startDate, endDate, userId, role } = options

  const dateFilter: any = {}
  if (startDate) dateFilter.gte = new Date(startDate)
  if (endDate) dateFilter.lte = new Date(endDate)

  const taskFilter: any = { workspaceId }
  const goalFilter: any = { workspaceId }
  
  if (Object.keys(dateFilter).length > 0) {
    taskFilter.createdAt = dateFilter
    goalFilter.createdAt = dateFilter
  }

  if (role === 'MEMBER' && userId) {
    taskFilter.assigneeId = userId
    goalFilter.ownerId = userId
  }

  const [workspace, goals, tasks, members] = await Promise.all([
    prisma.workspace.findUnique({ where: { id: workspaceId } }),
    prisma.goal.findMany({
      where: goalFilter,
      include: { owner: { select: { email: true, name: true } } },
    }),
    prisma.task.findMany({
      where: taskFilter,
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

  const lines: string[] = []
  lines.push('section,key,value')
  lines.push(`workspace,name,${escapeCsv(workspace?.name)}`)
  lines.push(`workspace,description,${escapeCsv(workspace?.description ?? '')}`)

  lines.push('goals,id,title,status,ownerEmail,dueDate')
  for (const goal of goals) {
    lines.push(
      [
        'goal',
        goal.id,
        goal.title,
        goal.status,
        goal.owner.email,
        goal.dueDate?.toISOString() ?? '',
      ]
        .map(escapeCsv)
        .join(','),
    )
  }

  lines.push('tasks,id,title,status,priority,assigneeEmail,goalTitle,dueDate')
  for (const task of tasks) {
    lines.push(
      [
        'task',
        task.id,
        task.title,
        task.status,
        task.priority,
        task.assignee?.email ?? '',
        task.goal?.title ?? '',
        task.dueDate?.toISOString() ?? '',
      ]
        .map(escapeCsv)
        .join(','),
    )
  }

  lines.push('members,email,role')
  for (const member of members) {
    lines.push(['member', member.user.email, member.role].map(escapeCsv).join(','))
  }

  return lines.join('\n')
}
