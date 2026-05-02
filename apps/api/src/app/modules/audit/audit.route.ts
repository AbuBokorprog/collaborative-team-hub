import express from 'express'
import httpStatus from 'http-status'
import Auth from '../../middlewares/Auth'
import CatchAsync from '../../utils/CatchAsync'
import SuccessResponse from '../../utils/SuccessResponse'
import prisma from '../../helpers/prisma'
import { requireWorkspaceMember } from '../../middlewares/workspace'
import { calculatePagination } from '../../helpers/pagination'

const router = express.Router()

router.use(Auth())
router.use(requireWorkspaceMember)

router.get(
  '/',
  CatchAsync(async (req, res) => {
    const workspaceId = req.workspaceId as string
    const q = req.query as Record<string, string | undefined>
    const { skip, limit, page, sortOrder } = calculatePagination({
      page: q.page ? Number(q.page) : undefined,
      limit: q.limit ? Number(q.limit) : undefined,
      sortBy: 'createdAt',
      sortOrder: q.sortOrder === 'asc' ? 'asc' : 'desc',
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

    SuccessResponse(res, {
      status: httpStatus.OK,
      success: true,
      message: 'Audit logs',
      data: {
        data: items,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    })
  }),
)

export const auditRouter = router
