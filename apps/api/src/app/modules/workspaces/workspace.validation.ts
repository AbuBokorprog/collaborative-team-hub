import { z } from 'zod'
import { Role } from '../../../generated/prisma/enums'

const createSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    accentColor: z.string().optional(),
  }),
})

const updateSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    accentColor: z.string().optional(),
  }),
})

const inviteSchema = z.object({
  body: z.object({
    email: z.string().email(),
    role: z.nativeEnum(Role).optional(),
  }),
})

const updateMemberSchema = z.object({
  body: z.object({
    role: z.nativeEnum(Role),
  }),
})

export const workspaceValidation = {
  createSchema,
  updateSchema,
  inviteSchema,
  updateMemberSchema,
}
