import { z } from 'zod'
import { Priority, TaskStatus } from '../../../generated/prisma/enums'

const createBody = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    priority: z.nativeEnum(Priority).optional(),
    dueDate: z.coerce.date().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    assigneeId: z.string().optional().nullable(),
    goalId: z.string().optional().nullable(),
    workspaceId: z.string().min(1),
  }),
})

const updateBody = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    priority: z.nativeEnum(Priority).optional(),
    dueDate: z.coerce.date().optional().nullable(),
    status: z.nativeEnum(TaskStatus).optional(),
    assigneeId: z.string().optional().nullable(),
    goalId: z.string().optional().nullable(),
  }),
})

const listQuery = z.object({
  query: z
    .object({
      workspaceId: z.string().optional(),
      page: z.coerce.number().optional(),
      limit: z.coerce.number().optional(),
      status: z.nativeEnum(TaskStatus).optional(),
      goalId: z.string().optional(),
      assigneeId: z.string().optional(),
      search: z.string().optional(),
    })
    .optional(),
})

export const taskValidation = {
  createBody,
  updateBody,
  listQuery,
}
