import { z } from 'zod'
import { GoalStatus } from '../../../generated/prisma/enums'

const listQuery = z.object({
  query: z
    .object({
      page: z.coerce.number().optional(),
      limit: z.coerce.number().optional(),
      status: z.nativeEnum(GoalStatus).optional(),
      search: z.string().optional(),
    })
    .optional(),
})

const createBody = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    dueDate: z.coerce.date().optional(),
    status: z.nativeEnum(GoalStatus).optional(),
    ownerId: z.string().min(1),
  }),
})

const updateBody = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    dueDate: z.coerce.date().optional().nullable(),
    status: z.nativeEnum(GoalStatus).optional(),
    ownerId: z.string().optional(),
  }),
})

const milestoneCreate = z.object({
  body: z.object({
    title: z.string().min(1),
    progressPercentage: z.coerce.number().min(0).max(100).optional(),
  }),
})

const milestoneUpdate = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    progressPercentage: z.coerce.number().min(0).max(100).optional(),
  }),
})

const updateCreate = z.object({
  body: z.object({
    body: z.string().min(1),
  }),
})

export const goalValidation = {
  listQuery,
  createBody,
  updateBody,
  milestoneCreate,
  milestoneUpdate,
  updateCreate,
}
