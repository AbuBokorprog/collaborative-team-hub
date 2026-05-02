import prisma from '../../helpers/prisma'

const escapeCsv = (value: string | number | null | undefined) => {
  const text = String(value ?? '')
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export const buildWorkspaceCsv = async (workspaceId: string) => {
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
