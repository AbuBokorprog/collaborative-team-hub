import '../src/app/config'
import prisma from '../src/app/helpers/prisma'
import { HashPassword } from '../src/app/helpers/HashPassword'
import {
  Role,
  GoalStatus,
  TaskStatus,
  Priority,
  NotificationType,
} from '../src/generated/prisma/enums'

const daysFromNow = (d: number) => new Date(Date.now() + d * 86_400_000)

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Users ─────────────────────────────────────────────────────────────────
  const password = await HashPassword('Password123!')

  const [sarah, james, priya, alex, emma, tom] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'sarah@demo.com' },
      update: {},
      create: {
        name: 'Sarah Chen',
        email: 'sarah@demo.com',
        password,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      },
    }),
    prisma.user.upsert({
      where: { email: 'james@demo.com' },
      update: {},
      create: {
        name: 'James Rodriguez',
        email: 'james@demo.com',
        password,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
      },
    }),
    prisma.user.upsert({
      where: { email: 'priya@demo.com' },
      update: {},
      create: {
        name: 'Priya Patel',
        email: 'priya@demo.com',
        password,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
      },
    }),
    prisma.user.upsert({
      where: { email: 'alex@demo.com' },
      update: {},
      create: {
        name: 'Alex Kim',
        email: 'alex@demo.com',
        password,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      },
    }),
    prisma.user.upsert({
      where: { email: 'emma@demo.com' },
      update: {},
      create: {
        name: 'Emma Wilson',
        email: 'emma@demo.com',
        password,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
      },
    }),
    prisma.user.upsert({
      where: { email: 'tom@demo.com' },
      update: {},
      create: {
        name: 'Tom Baker',
        email: 'tom@demo.com',
        password,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom',
      },
    }),
  ])

  // ─── Workspace ─────────────────────────────────────────────────────────────
  let workspace = await prisma.workspace.findFirst({
    where: { name: 'Acme Corp' },
  })
  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: 'Acme Corp',
        description: 'Building the future, one sprint at a time.',
        accentColor: '#6366f1',
      },
    })
  }
  const wid = workspace.id

  // ─── Memberships ───────────────────────────────────────────────────────────
  for (const { userId, role } of [
    { userId: sarah.id, role: Role.ADMIN },
    { userId: james.id, role: Role.MANAGER },
    { userId: priya.id, role: Role.MANAGER },
    { userId: alex.id, role: Role.MEMBER },
    { userId: emma.id, role: Role.MEMBER },
    { userId: tom.id, role: Role.MEMBER },
  ]) {
    await prisma.membership.upsert({
      where: { userId_workspaceId: { userId, workspaceId: wid } },
      update: { role },
      create: { userId, workspaceId: wid, role },
    })
  }

  // ─── Goals ─────────────────────────────────────────────────────────────────
  type GoalData = Parameters<typeof prisma.goal.create>[0]['data']
  const findOrCreateGoal = async (title: string, data: GoalData) => {
    return (
      (await prisma.goal.findFirst({ where: { title, workspaceId: wid } })) ??
      (await prisma.goal.create({ data }))
    )
  }

  const goalV2 = await findOrCreateGoal('Launch V2 Product', {
    title: 'Launch V2 Product',
    description: 'Ship the redesigned product with new features to production.',
    status: GoalStatus.ACTIVE,
    dueDate: daysFromNow(45),
    progress: 65,
    ownerId: sarah.id,
    workspaceId: wid,
  })

  const goalRetention = await findOrCreateGoal('Improve Customer Retention', {
    title: 'Improve Customer Retention',
    description: 'Reduce churn from 8% to under 4% by end of Q3.',
    status: GoalStatus.ACTIVE,
    dueDate: daysFromNow(90),
    progress: 30,
    ownerId: james.id,
    workspaceId: wid,
  })

  const goalMarketing = await findOrCreateGoal('Q1 Marketing Campaign', {
    title: 'Q1 Marketing Campaign',
    description: 'Execute full-funnel marketing campaign for Q1.',
    status: GoalStatus.COMPLETED,
    dueDate: daysFromNow(-10),
    progress: 100,
    ownerId: priya.id,
    workspaceId: wid,
  })

  const goalInfra = await findOrCreateGoal('Infrastructure Upgrade', {
    title: 'Infrastructure Upgrade',
    description: 'Migrate services to Kubernetes and upgrade DB clusters.',
    status: GoalStatus.PLANNED,
    dueDate: daysFromNow(120),
    progress: 0,
    ownerId: alex.id,
    workspaceId: wid,
  })

  const goalOnboarding = await findOrCreateGoal('Employee Onboarding Revamp', {
    title: 'Employee Onboarding Revamp',
    description: 'Redesign onboarding to cut time-to-productivity by 50%.',
    status: GoalStatus.BLOCKED,
    dueDate: daysFromNow(60),
    progress: 15,
    ownerId: emma.id,
    workspaceId: wid,
  })

  // ─── Milestones ────────────────────────────────────────────────────────────
  const findOrCreateMilestone = async (
    title: string,
    goalId: string,
    progressPercentage: number,
  ) => {
    const exists = await prisma.milestone.findFirst({
      where: { title, goalId },
    })
    if (!exists)
      await prisma.milestone.create({
        data: { title, goalId, progressPercentage },
      })
  }

  await findOrCreateMilestone('Design complete', goalV2.id, 25)
  await findOrCreateMilestone('Backend APIs ready', goalV2.id, 50)
  await findOrCreateMilestone('Beta testing done', goalV2.id, 75)
  await findOrCreateMilestone('Production deployment', goalV2.id, 100)

  await findOrCreateMilestone('Identify churn reasons', goalRetention.id, 33)
  await findOrCreateMilestone(
    'Implement retention features',
    goalRetention.id,
    66,
  )
  await findOrCreateMilestone('Measure & iterate', goalRetention.id, 100)

  await findOrCreateMilestone('Campaign brief approved', goalMarketing.id, 25)
  await findOrCreateMilestone('Assets created', goalMarketing.id, 50)
  await findOrCreateMilestone('Ads launched', goalMarketing.id, 75)
  await findOrCreateMilestone(
    'Campaign report published',
    goalMarketing.id,
    100,
  )

  await findOrCreateMilestone('Architecture design', goalInfra.id, 25)
  await findOrCreateMilestone('Staging migration', goalInfra.id, 60)
  await findOrCreateMilestone('Production cutover', goalInfra.id, 100)

  await findOrCreateMilestone('Current process audit', goalOnboarding.id, 50)
  await findOrCreateMilestone('New process launch', goalOnboarding.id, 100)

  // ─── Goal Updates ──────────────────────────────────────────────────────────
  const maybeCreateGoalUpdate = async (
    goalId: string,
    authorId: string,
    body: string,
  ) => {
    const exists = await prisma.goalUpdate.findFirst({
      where: { goalId, body },
    })
    if (!exists)
      await prisma.goalUpdate.create({ data: { goalId, authorId, body } })
  }

  await maybeCreateGoalUpdate(
    goalV2.id,
    sarah.id,
    'Design phase completed ahead of schedule. Backend team is now integrating the new API contracts.',
  )
  await maybeCreateGoalUpdate(
    goalV2.id,
    james.id,
    'Beta testing kicked off with 20 internal users. Early feedback is very positive.',
  )
  await maybeCreateGoalUpdate(
    goalRetention.id,
    james.id,
    'Completed exit survey analysis. Top churn reasons: pricing and missing features.',
  )
  await maybeCreateGoalUpdate(
    goalRetention.id,
    priya.id,
    'Launched in-app retention nudges. Monitoring engagement metrics this week.',
  )
  await maybeCreateGoalUpdate(
    goalMarketing.id,
    priya.id,
    'Campaign wrapped up. Exceeded lead targets by 22%. Full report attached in Drive.',
  )
  await maybeCreateGoalUpdate(
    goalOnboarding.id,
    emma.id,
    'Blocked waiting on HR sign-off before we can proceed. Escalated to Sarah.',
  )

  // ─── Tasks ─────────────────────────────────────────────────────────────────
  type TaskData = Parameters<typeof prisma.task.create>[0]['data']
  const findOrCreateTask = async (title: string, data: TaskData) => {
    const exists = await prisma.task.findFirst({
      where: { title, workspaceId: wid },
    })
    if (!exists) await prisma.task.create({ data })
  }

  await findOrCreateTask('Finalize UI mockups for V2 dashboard', {
    title: 'Finalize UI mockups for V2 dashboard',
    description:
      'Complete high-fidelity Figma mockups for all dashboard views.',
    priority: Priority.HIGH,
    status: TaskStatus.DONE,
    dueDate: daysFromNow(-5),
    assigneeId: alex.id,
    workspaceId: wid,
    goalId: goalV2.id,
  })

  await findOrCreateTask('Implement REST API for user settings', {
    title: 'Implement REST API for user settings',
    description:
      'Build CRUD endpoints for user preferences and notification settings.',
    priority: Priority.HIGH,
    status: TaskStatus.IN_PROGRESS,
    dueDate: daysFromNow(5),
    assigneeId: james.id,
    workspaceId: wid,
    goalId: goalV2.id,
  })

  await findOrCreateTask('Write integration tests for auth flow', {
    title: 'Write integration tests for auth flow',
    description: 'Cover login, register, token refresh, and logout endpoints.',
    priority: Priority.MEDIUM,
    status: TaskStatus.REVIEW,
    dueDate: daysFromNow(3),
    assigneeId: tom.id,
    workspaceId: wid,
    goalId: goalV2.id,
  })

  await findOrCreateTask('Set up CI/CD pipeline for V2', {
    title: 'Set up CI/CD pipeline for V2',
    description:
      'Configure GitHub Actions for automated testing and deployment.',
    priority: Priority.URGENT,
    status: TaskStatus.IN_PROGRESS,
    dueDate: daysFromNow(7),
    assigneeId: alex.id,
    workspaceId: wid,
    goalId: goalV2.id,
  })

  await findOrCreateTask('Migrate production database to v2 schema', {
    title: 'Migrate production database to v2 schema',
    description:
      'Run and validate migration scripts on production with rollback plan ready.',
    priority: Priority.URGENT,
    status: TaskStatus.TODO,
    dueDate: daysFromNow(14),
    assigneeId: james.id,
    workspaceId: wid,
    goalId: goalV2.id,
  })

  await findOrCreateTask('Analyze churn survey responses', {
    title: 'Analyze churn survey responses',
    description: 'Categorize and quantify top reasons from 200+ exit surveys.',
    priority: Priority.HIGH,
    status: TaskStatus.DONE,
    dueDate: daysFromNow(-15),
    assigneeId: priya.id,
    workspaceId: wid,
    goalId: goalRetention.id,
  })

  await findOrCreateTask('Build re-engagement email sequence', {
    title: 'Build re-engagement email sequence',
    description: '3-email drip campaign targeting users inactive for 14+ days.',
    priority: Priority.MEDIUM,
    status: TaskStatus.IN_PROGRESS,
    dueDate: daysFromNow(10),
    assigneeId: emma.id,
    workspaceId: wid,
    goalId: goalRetention.id,
  })

  await findOrCreateTask('Add in-app upgrade prompt for power users', {
    title: 'Add in-app upgrade prompt for power users',
    description: 'Show contextual upgrade CTA when users hit free-tier limits.',
    priority: Priority.MEDIUM,
    status: TaskStatus.TODO,
    dueDate: daysFromNow(20),
    assigneeId: alex.id,
    workspaceId: wid,
    goalId: goalRetention.id,
  })

  await findOrCreateTask('Provision Kubernetes cluster on AWS EKS', {
    title: 'Provision Kubernetes cluster on AWS EKS',
    description:
      'Set up EKS cluster with autoscaling node groups and monitoring.',
    priority: Priority.HIGH,
    status: TaskStatus.TODO,
    dueDate: daysFromNow(30),
    assigneeId: tom.id,
    workspaceId: wid,
    goalId: goalInfra.id,
  })

  await findOrCreateTask('Document new employee onboarding checklist', {
    title: 'Document new employee onboarding checklist',
    description:
      'Write step-by-step guide covering the first 30 days for new hires.',
    priority: Priority.LOW,
    status: TaskStatus.TODO,
    dueDate: daysFromNow(25),
    assigneeId: emma.id,
    workspaceId: wid,
    goalId: goalOnboarding.id,
  })

  await findOrCreateTask('Update team wiki with Q2 roadmap', {
    title: 'Update team wiki with Q2 roadmap',
    description: 'Publish Q2 priorities, OKRs, and timeline to Notion.',
    priority: Priority.LOW,
    status: TaskStatus.TODO,
    dueDate: daysFromNow(7),
    assigneeId: priya.id,
    workspaceId: wid,
  })

  await findOrCreateTask('Security audit of authentication module', {
    title: 'Security audit of authentication module',
    description: 'Review JWT handling, session management, and rate limiting.',
    priority: Priority.URGENT,
    status: TaskStatus.OVERDUE,
    dueDate: daysFromNow(-3),
    assigneeId: james.id,
    workspaceId: wid,
  })

  // ─── Announcements ─────────────────────────────────────────────────────────
  type AnnData = Parameters<typeof prisma.announcement.create>[0]['data']
  const findOrCreateAnnouncement = async (title: string, data: AnnData) => {
    return (
      (await prisma.announcement.findFirst({
        where: { title, workspaceId: wid },
      })) ?? (await prisma.announcement.create({ data }))
    )
  }

  const annWelcome = await findOrCreateAnnouncement(
    'Welcome to the Acme Corp Workspace!',
    {
      title: 'Welcome to the Acme Corp Workspace!',
      content:
        'Hi team! Welcome to our new collaborative hub. This is your go-to place for goals, tasks, and company updates. Please update your profile and explore the workspace. Feel free to reach out if you have any questions!',
      pinned: true,
      workspaceId: wid,
      authorId: sarah.id,
    },
  )

  const annMeeting = await findOrCreateAnnouncement(
    'Q2 Planning Meeting — This Friday',
    {
      title: 'Q2 Planning Meeting — This Friday',
      content:
        "Reminder: We have our Q2 all-hands planning session this Friday at 2 PM EST. All team leads please come prepared with your team's Q1 retrospective and Q2 goals draft. Meeting link will be shared Thursday.",
      pinned: false,
      workspaceId: wid,
      authorId: james.id,
    },
  )

  const annDesign = await findOrCreateAnnouncement(
    'New Design System v2.0 is Live',
    {
      title: 'New Design System v2.0 is Live',
      content:
        "We've just shipped our updated design system! It includes a refreshed color palette, new component library, and improved accessibility standards. Frontend engineers: please migrate your feature branches. Designers: the Figma library has been updated.",
      pinned: false,
      workspaceId: wid,
      authorId: priya.id,
    },
  )

  // ─── Comments ──────────────────────────────────────────────────────────────
  const findOrCreateComment = async (
    body: string,
    announcementId: string,
    authorId: string,
    parentId?: string,
  ) => {
    return (
      (await prisma.comment.findFirst({
        where: { body, announcementId, authorId },
      })) ??
      (await prisma.comment.create({
        data: { body, announcementId, authorId, parentId },
      }))
    )
  }

  const c1 = await findOrCreateComment(
    'Thanks Sarah! Great to have everything in one place.',
    annWelcome.id,
    james.id,
  )
  const c2 = await findOrCreateComment(
    'Excited to be here! The task board looks fantastic.',
    annWelcome.id,
    emma.id,
  )
  await findOrCreateComment(
    'Already set up my goals for the quarter. Love the UI!',
    annWelcome.id,
    alex.id,
  )
  await findOrCreateComment(
    'Agreed James, the UX is really clean.',
    annWelcome.id,
    priya.id,
    c1.id,
  )
  await findOrCreateComment(
    'Love it Emma! Let me know if you need any help getting started.',
    annWelcome.id,
    sarah.id,
    c2.id,
  )

  await findOrCreateComment(
    'Will there be a recording for those in different time zones?',
    annMeeting.id,
    tom.id,
  )
  await findOrCreateComment(
    "Yes, we'll record and post in the shared drive afterward.",
    annMeeting.id,
    james.id,
  )
  await findOrCreateComment(
    'What format should we use for the Q1 retro? Any template?',
    annMeeting.id,
    alex.id,
  )
  await findOrCreateComment(
    'Use the retro template pinned in our Notion workspace.',
    annMeeting.id,
    priya.id,
  )

  await findOrCreateComment(
    'Great work team! The new design tokens look amazing.',
    annDesign.id,
    emma.id,
  )
  await findOrCreateComment(
    'The accessibility improvements are a huge win. Nice work Priya!',
    annDesign.id,
    james.id,
  )

  // ─── Reactions ─────────────────────────────────────────────────────────────
  for (const r of [
    { announcementId: annWelcome.id, userId: james.id, emoji: '🎉' },
    { announcementId: annWelcome.id, userId: priya.id, emoji: '🎉' },
    { announcementId: annWelcome.id, userId: alex.id, emoji: '🎉' },
    { announcementId: annWelcome.id, userId: emma.id, emoji: '❤️' },
    { announcementId: annWelcome.id, userId: tom.id, emoji: '👍' },
    { announcementId: annMeeting.id, userId: sarah.id, emoji: '👍' },
    { announcementId: annMeeting.id, userId: priya.id, emoji: '👍' },
    { announcementId: annMeeting.id, userId: alex.id, emoji: '✅' },
    { announcementId: annDesign.id, userId: sarah.id, emoji: '🔥' },
    { announcementId: annDesign.id, userId: james.id, emoji: '🔥' },
    { announcementId: annDesign.id, userId: emma.id, emoji: '🎨' },
    { announcementId: annDesign.id, userId: tom.id, emoji: '👍' },
  ]) {
    await prisma.reaction.upsert({
      where: { announcementId_userId_emoji: r },
      update: {},
      create: r,
    })
  }

  // ─── Notifications ─────────────────────────────────────────────────────────
  for (const n of [
    {
      userId: alex.id,
      workspaceId: wid,
      type: NotificationType.TASK_ASSIGNED,
      title: 'New task assigned',
      body: 'You were assigned "Finalize UI mockups for V2 dashboard"',
      read: true,
    },
    {
      userId: james.id,
      workspaceId: wid,
      type: NotificationType.TASK_ASSIGNED,
      title: 'New task assigned',
      body: 'You were assigned "Implement REST API for user settings"',
      read: false,
    },
    {
      userId: tom.id,
      workspaceId: wid,
      type: NotificationType.TASK_STATUS_CHANGED,
      title: 'Task moved to Review',
      body: '"Write integration tests for auth flow" is ready for review',
      read: false,
    },
    {
      userId: emma.id,
      workspaceId: wid,
      type: NotificationType.TASK_ASSIGNED,
      title: 'New task assigned',
      body: 'You were assigned "Build re-engagement email sequence"',
      read: false,
    },
    {
      userId: priya.id,
      workspaceId: wid,
      type: NotificationType.GOAL_COMPLETED,
      title: 'Goal completed!',
      body: 'Q1 Marketing Campaign has been marked as completed. Great work!',
      read: true,
    },
    {
      userId: sarah.id,
      workspaceId: wid,
      type: NotificationType.ANNOUNCEMENT,
      title: 'New announcement',
      body: 'James posted: Q2 Planning Meeting — This Friday',
      read: true,
    },
    {
      userId: alex.id,
      workspaceId: wid,
      type: NotificationType.MENTION,
      title: 'You were mentioned',
      body: 'Priya mentioned you in "New Design System v2.0 is Live"',
      read: false,
    },
    {
      userId: james.id,
      workspaceId: wid,
      type: NotificationType.DEADLINE_REMINDER,
      title: 'Task overdue',
      body: '"Security audit of authentication module" is overdue!',
      read: false,
    },
    {
      userId: emma.id,
      workspaceId: wid,
      type: NotificationType.WORKSPACE_INVITED,
      title: 'Workspace invitation',
      body: 'Sarah invited you to join Acme Corp workspace',
      read: true,
    },
    {
      userId: tom.id,
      workspaceId: wid,
      type: NotificationType.WORKSPACE_INVITED,
      title: 'Workspace invitation',
      body: 'Sarah invited you to join Acme Corp workspace',
      read: true,
    },
  ]) {
    const exists = await prisma.notification.findFirst({
      where: { userId: n.userId, body: n.body },
    })
    if (!exists) await prisma.notification.create({ data: n })
  }

  // ─── Audit Logs ────────────────────────────────────────────────────────────
  for (const log of [
    {
      workspaceId: wid,
      actorId: sarah.id,
      action: 'workspace.created',
      metadata: { name: 'Acme Corp' },
    },
    {
      workspaceId: wid,
      actorId: sarah.id,
      action: 'member.invited',
      metadata: { email: 'james@demo.com', role: 'MANAGER' },
    },
    {
      workspaceId: wid,
      actorId: sarah.id,
      action: 'member.invited',
      metadata: { email: 'priya@demo.com', role: 'MANAGER' },
    },
    {
      workspaceId: wid,
      actorId: sarah.id,
      action: 'member.invited',
      metadata: { email: 'alex@demo.com', role: 'MEMBER' },
    },
    {
      workspaceId: wid,
      actorId: sarah.id,
      action: 'member.invited',
      metadata: { email: 'emma@demo.com', role: 'MEMBER' },
    },
    {
      workspaceId: wid,
      actorId: sarah.id,
      action: 'member.invited',
      metadata: { email: 'tom@demo.com', role: 'MEMBER' },
    },
    {
      workspaceId: wid,
      actorId: sarah.id,
      action: 'goal.created',
      metadata: { title: 'Launch V2 Product' },
    },
    {
      workspaceId: wid,
      actorId: james.id,
      action: 'goal.created',
      metadata: { title: 'Improve Customer Retention' },
    },
    {
      workspaceId: wid,
      actorId: priya.id,
      action: 'goal.status_changed',
      metadata: {
        title: 'Q1 Marketing Campaign',
        from: 'ACTIVE',
        to: 'COMPLETED',
      },
    },
    {
      workspaceId: wid,
      actorId: alex.id,
      action: 'task.status_changed',
      metadata: {
        task: 'Finalize UI mockups for V2 dashboard',
        from: 'IN_PROGRESS',
        to: 'DONE',
      },
    },
    {
      workspaceId: wid,
      actorId: james.id,
      action: 'task.assigned',
      metadata: {
        task: 'Implement REST API for user settings',
        assignee: 'james@demo.com',
      },
    },
    {
      workspaceId: wid,
      actorId: sarah.id,
      action: 'announcement.pinned',
      metadata: { title: 'Welcome to the Acme Corp Workspace!' },
    },
  ]) {
    const exists = await prisma.auditLog.findFirst({
      where: { workspaceId: wid, actorId: log.actorId, action: log.action },
    })
    if (!exists) await prisma.auditLog.create({ data: log })
  }

  console.log('\n✅ Seed complete!')
  console.log('─'.repeat(52))
  console.log('  Workspace : Acme Corp')
  console.log('  Password  : Password123!  (all accounts)')
  console.log('')
  console.log('  sarah@demo.com   — Admin')
  console.log('  james@demo.com   — Manager')
  console.log('  priya@demo.com   — Manager')
  console.log('  alex@demo.com    — Member')
  console.log('  emma@demo.com    — Member')
  console.log('  tom@demo.com     — Member')
  console.log('─'.repeat(52))
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e)
    void prisma.$disconnect()
    process.exit(1)
  })
