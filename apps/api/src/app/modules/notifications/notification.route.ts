import express from 'express'
import httpStatus from 'http-status'
import Auth from '../../middlewares/Auth'
import CatchAsync from '../../utils/CatchAsync'
import SuccessResponse from '../../utils/SuccessResponse'
import prisma from '../../helpers/prisma'
import { calculatePagination } from '../../helpers/pagination'

const router = express.Router()

router.use(Auth())

router.get(
  '/',
  CatchAsync(async (req, res) => {
    const userId = req.user?.id as string
    const q = req.query as Record<string, string | undefined>
    const { skip, limit, page, sortOrder } = calculatePagination({
      page: q.page ? Number(q.page) : undefined,
      limit: q.limit ? Number(q.limit) : undefined,
      sortBy: 'createdAt',
      sortOrder: q.sortOrder === 'asc' ? 'asc' : 'desc',
    })

    const where = { userId }
    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder as 'asc' | 'desc' },
      }),
      prisma.notification.count({ where }),
    ])

    SuccessResponse(res, {
      status: httpStatus.OK,
      success: true,
      message: 'Notifications',
      data: {
        data: items,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    })
  }),
)

router.patch(
  '/:id/read',
  CatchAsync(async (req, res) => {
    const userId = req.user?.id as string
    const updated = await prisma.notification.updateMany({
      where: {
        id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
        userId,
      },
      data: { read: true },
    })

    SuccessResponse(res, {
      status: httpStatus.OK,
      success: true,
      message: 'Marked read',
      data: { updated: updated.count },
    })
  }),
)

export const notificationRouter = router
