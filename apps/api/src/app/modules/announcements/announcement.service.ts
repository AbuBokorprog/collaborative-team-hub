import httpStatus from 'http-status'
import prisma from '../../helpers/prisma'
import { AppError } from '../../utils/AppError'
import { writeAuditLog } from '../../helpers/auditLog'
import { notifyMentions, resolveMentionUserIds } from '../../helpers/mentions'
import { calculatePagination } from '../../helpers/pagination'

const assertMember = async (workspaceId: string, userId: string) => {
  const m = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  })
  if (!m) throw new AppError(httpStatus.FORBIDDEN, 'Not a workspace member')
  return m
}

const commentInclude = {
  author: { select: { id: true, name: true, avatar: true } },
  replies: {
    include: {
      author: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: 'asc' as const },
  },
}

export const list = async (
  workspaceId: string,
  userId: string,
  query: { page?: number; limit?: number; search?: string },
) => {
  await assertMember(workspaceId, userId)
  const { skip, limit, page, sortOrder } = calculatePagination(query)
  const where = {
    workspaceId,
    ...(query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: 'insensitive' as const } },
            {
              content: {
                contains: query.search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ pinned: 'desc' }, { createdAt: sortOrder as 'asc' | 'desc' }],
      include: {
        reactions: true,
        comments: {
          where: { parentId: null },
          include: commentInclude,
          orderBy: { createdAt: 'asc' },
        },
        author: { select: { id: true, name: true, avatar: true } },
        _count: { select: { comments: true, reactions: true } },
      },
    }),
    prisma.announcement.count({ where }),
  ])

  return {
    data: items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export const create = async (
  workspaceId: string,
  authorId: string,
  payload: { title: string; content: string },
) => {
  await assertMember(workspaceId, authorId)

  return prisma.announcement.create({
    data: {
      title: payload.title,
      content: payload.content,
      workspaceId,
      authorId,
    },
    include: {
      author: { select: { id: true, name: true, avatar: true } },
    },
  })
}

export const update = async (
  announcementId: string,
  workspaceId: string,
  userId: string,
  payload: { title?: string; content?: string; pinned?: boolean },
  isAdmin: boolean,
) => {
  await assertMember(workspaceId, userId)
  const row = await prisma.announcement.findFirst({
    where: { id: announcementId, workspaceId },
  })
  if (!row) throw new AppError(httpStatus.NOT_FOUND, 'Announcement not found')

  if (payload.pinned !== undefined && !isAdmin) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Only admins can pin announcements',
    )
  }

  const updated = await prisma.announcement.update({
    where: { id: announcementId },
    data: {
      ...(payload.title !== undefined ? { title: payload.title } : {}),
      ...(payload.content !== undefined ? { content: payload.content } : {}),
      ...(payload.pinned !== undefined ? { pinned: payload.pinned } : {}),
    },
    include: {
      author: { select: { id: true, name: true, avatar: true } },
    },
  })

  if (payload.pinned === true && !row.pinned) {
    await writeAuditLog({
      workspaceId,
      actorId: userId,
      action: 'ANNOUNCEMENT_PINNED',
      metadata: { announcementId },
    })
  }

  return updated
}

export const remove = async (
  announcementId: string,
  workspaceId: string,
  userId: string,
  isAdmin: boolean,
) => {
  await assertMember(workspaceId, userId)
  const row = await prisma.announcement.findFirst({
    where: { id: announcementId, workspaceId },
  })
  if (!row) throw new AppError(httpStatus.NOT_FOUND, 'Announcement not found')

  if (!isAdmin && row.authorId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'Only author or admin can delete')
  }

  await prisma.announcement.delete({ where: { id: announcementId } })
}

export const react = async (
  announcementId: string,
  workspaceId: string,
  userId: string,
  emoji: string,
) => {
  await assertMember(workspaceId, userId)
  const row = await prisma.announcement.findFirst({
    where: { id: announcementId, workspaceId },
  })
  if (!row) throw new AppError(httpStatus.NOT_FOUND, 'Announcement not found')

  const existing = await prisma.reaction.findFirst({
    where: { announcementId, userId },
    include: { user: { select: { id: true, name: true } } },
  })

  if (existing) {
    const deleted = await prisma.reaction.delete({
      where: { id: existing.id },
    })
    return deleted
  }

  return prisma.reaction.create({
    data: {
      announcementId,
      userId,
      emoji,
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  })
}

export const comment = async (
  announcementId: string,
  workspaceId: string,
  authorId: string,
  body: string,
  announcementTitle?: string,
) => {
  await assertMember(workspaceId, authorId)
  const row = await prisma.announcement.findFirst({
    where: { id: announcementId, workspaceId },
  })
  if (!row) throw new AppError(httpStatus.NOT_FOUND, 'Announcement not found')

  const commentRow = await prisma.comment.create({
    data: { body, announcementId, authorId },
    include: commentInclude,
  })

  const author = await prisma.user.findUnique({
    where: { id: authorId },
    select: { name: true },
  })

  const mentionedIds = await resolveMentionUserIds(workspaceId, body, authorId)
  await notifyMentions({
    workspaceId,
    mentionedUserIds: mentionedIds,
    title: `${author?.name ?? 'Someone'} mentioned you in a comment`,
    body: body.slice(0, 500),
    meta: { announcementId, commentId: commentRow.id, authorId },
    mentionedByName: author?.name,
    announcementTitle: announcementTitle ?? row.title,
  })

  return commentRow
}

export const editComment = async (
  commentId: string,
  workspaceId: string,
  authorId: string,
  body: string,
) => {
  await assertMember(workspaceId, authorId)
  const row = await prisma.comment.findFirst({
    where: {
      id: commentId,
      authorId,
      announcement: { workspaceId },
    },
  })
  if (!row) throw new AppError(httpStatus.NOT_FOUND, 'Comment not found or not yours')

  return prisma.comment.update({
    where: { id: commentId },
    data: { body },
    include: commentInclude,
  })
}

export const deleteComment = async (
  commentId: string,
  workspaceId: string,
  userId: string,
  isAdmin: boolean,
) => {
  await assertMember(workspaceId, userId)
  const row = await prisma.comment.findFirst({
    where: { id: commentId, announcement: { workspaceId } },
  })
  if (!row) throw new AppError(httpStatus.NOT_FOUND, 'Comment not found')

  if (!isAdmin && row.authorId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'Only author or admin can delete this comment')
  }

  await prisma.comment.delete({ where: { id: commentId } })
}

export const replyToComment = async (
  parentCommentId: string,
  workspaceId: string,
  authorId: string,
  body: string,
) => {
  await assertMember(workspaceId, authorId)
  const parent = await prisma.comment.findFirst({
    where: { id: parentCommentId, announcement: { workspaceId } },
    include: { announcement: { select: { id: true, title: true } } },
  })
  if (!parent) throw new AppError(httpStatus.NOT_FOUND, 'Parent comment not found')

  const replyRow = await prisma.comment.create({
    data: {
      body,
      announcementId: parent.announcementId,
      authorId,
      parentId: parentCommentId,
    },
    include: {
      author: { select: { id: true, name: true, avatar: true } },
    },
  })

  const author = await prisma.user.findUnique({
    where: { id: authorId },
    select: { name: true },
  })

  const mentionedIds = await resolveMentionUserIds(workspaceId, body, authorId)
  await notifyMentions({
    workspaceId,
    mentionedUserIds: mentionedIds,
    title: `${author?.name ?? 'Someone'} mentioned you in a reply`,
    body: body.slice(0, 500),
    meta: {
      announcementId: parent.announcementId,
      commentId: replyRow.id,
      parentCommentId,
      authorId,
    },
    mentionedByName: author?.name,
    announcementTitle: parent.announcement?.title,
  })

  return replyRow
}

export const pin = async (
  announcementId: string,
  workspaceId: string,
  userId: string,
) => {
  await assertMember(workspaceId, userId)
  const row = await prisma.announcement.findFirst({
    where: { id: announcementId, workspaceId },
  })
  if (!row) throw new AppError(httpStatus.NOT_FOUND, 'Announcement not found')

  const updated = await prisma.announcement.update({
    where: { id: announcementId },
    data: { pinned: true },
  })

  await writeAuditLog({
    workspaceId,
    actorId: userId,
    action: 'ANNOUNCEMENT_PINNED',
    metadata: { announcementId },
  })

  return updated
}
