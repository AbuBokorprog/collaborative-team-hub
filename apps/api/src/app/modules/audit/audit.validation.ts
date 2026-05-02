import { z } from 'zod'

const listQuery = z.object({
  query: z
    .object({
      page: z.coerce.number().optional(),
      limit: z.coerce.number().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
    })
    .optional(),
})

export const auditValidation = {
  listQuery,
}
