import { z } from 'zod'

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    workspaceName: z.string().optional(),
    description: z.string().optional(),
  }),
})

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
})

const refreshSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().optional(),
    })
    .optional(),
  cookies: z
    .object({
      refreshToken: z.string().optional(),
    })
    .optional(),
})

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
})

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    newPassword: z.string().min(6),
  }),
})

const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1),
  }),
})

const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(6),
  }),
})

export const authValidation = {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
}
