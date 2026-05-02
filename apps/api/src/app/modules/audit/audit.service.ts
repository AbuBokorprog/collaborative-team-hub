import prisma from '../../helpers/prisma'
import { calculatePagination } from '../../helpers/pagination'

export const listAuditLogs = async (
  workspaceId: string,
  query: { page?: number; limit?: number; sortOrder?: 'asc' | 'desc' },
) => {
  const { skip, limit, page, sortOrder } = calculatePagination({
    page: query.page,
    limit: query.limit,
    sortBy: 'createdAt',
    sortOrder: query.sortOrder === 'asc' ? 'asc' : 'desc',
  })

  const where = { workspaceId }
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: sortOrder as 'asc' | 'desc' },
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ])

  return {
    data: items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}
