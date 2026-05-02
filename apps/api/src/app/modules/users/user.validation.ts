import { z } from 'zod'

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    role: z.string().optional(),
    bio: z.string().optional(),
    location: z.string().optional(),
    website: z.string().url().optional(),
    github: z.string().optional(),
    twitter: z.string().optional(),
  }),
})

const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
  }),
})

const preferencesSchema = z.object({
  body: z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    language: z.string().optional(),
    timezone: z.string().optional(),
  }),
})

export const userValidation = {
  updateProfileSchema,
  updatePasswordSchema,
  preferencesSchema,
}
