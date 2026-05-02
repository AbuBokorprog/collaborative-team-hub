import { z } from 'zod'

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
  }),
})

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
})

const refreshSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({ required_error: 'Refresh token cookie is required' }),
  }),
})

export const authValidation = {
  registerSchema,
  loginSchema,
  refreshSchema,
}
