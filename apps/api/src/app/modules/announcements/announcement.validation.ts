import { z } from 'zod'

const createSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    content: z.string().min(1),
  }),
})

const updateSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    content: z.string().optional(),
    pinned: z.boolean().optional(),
  }),
})

const reactSchema = z.object({
  body: z.object({
    emoji: z.string().min(1),
  }),
})

const commentSchema = z.object({
  body: z.object({
    body: z.string().min(1),
  }),
})

export const announcementValidation = {
  createSchema,
  updateSchema,
  reactSchema,
  commentSchema,
}
