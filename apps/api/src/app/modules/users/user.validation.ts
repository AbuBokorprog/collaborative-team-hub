import { z } from 'zod'

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
  }),
})

export const userValidation = {
  updateProfileSchema,
}
