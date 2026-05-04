import type { Prisma } from '../../generated/prisma/client'
import prisma from './prisma'
import { NotificationType } from '../../generated/prisma/enums'
import { SendMail } from '../utils/SendMail'
import { mentionNotificationTemplate } from '../views'
import config from '../config'

const MENTION_RE = /@([\w.-]+)/g

export function extractMentionHandles(text: string): string[] {
  const set = new Set<string>()
  let m: RegExpExecArray | null
  const re = new RegExp(MENTION_RE.source, 'g')
  while ((m = re.exec(text)) !== null) {
    set.add(m[1].toLowerCase())
  }
  return [...set]
}

/** Resolves @handles to user IDs among workspace members (match name or email local-part / full email). */
export async function resolveMentionUserIds(
  workspaceId: string,
  body: string,
  excludeUserId?: string,
): Promise<string[]> {
  const handles = extractMentionHandles(body)
  if (handles.length === 0) return []

  const members = await prisma.membership.findMany({
    where: { workspaceId },
    include: { user: true },
  })

  const ids: string[] = []
  for (const h of handles) {
    const memberUser = members.find(m => {
      if (m.userId === excludeUserId) return false
      const nameMatch = m.user.name.toLowerCase() === h
      const emailMatch = m.user.email.toLowerCase() === h
      const localMatch = m.user.email.split('@')[0]?.toLowerCase() === h
      return nameMatch || emailMatch || localMatch
    })
    if (memberUser) ids.push(memberUser.userId)
  }

  return [...new Set(ids)]
}

export async function notifyMentions(params: {
  workspaceId: string
  mentionedUserIds: string[]
  title: string
  body?: string
  meta?: Record<string, unknown>
  mentionedByName?: string
  announcementTitle?: string
}) {
  if (params.mentionedUserIds.length === 0) return

  await prisma.notification.createMany({
    data: params.mentionedUserIds.map(uid => ({
      userId: uid,
      workspaceId: params.workspaceId,
      type: NotificationType.MENTION,
      title: params.title,
      body: params.body ?? null,
      meta: (params.meta ?? {}) as Prisma.InputJsonValue,
    })),
  })

  if (!params.mentionedByName || !params.announcementTitle) return

  const mentionedUsers = await prisma.user.findMany({
    where: { id: { in: params.mentionedUserIds } },
    select: { email: true },
  })

  await Promise.allSettled(
    mentionedUsers.map(u =>
      SendMail({
        to: u.email,
        subject: `${params.mentionedByName} mentioned you in a comment`,
        html: mentionNotificationTemplate({
          mentionedBy: params.mentionedByName!,
          announcementTitle: params.announcementTitle!,
          commentBody: params.body ?? '',
          workspaceUrl: config.client_url
            ? `${config.client_url}/dashboard/announcements`
            : undefined,
        }),
      }),
    ),
  )
}
