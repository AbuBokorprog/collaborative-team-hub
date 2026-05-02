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

const preferenceBody = z.object({
  body: z.object({
    emailMentions: z.boolean().optional(),
    emailTaskAssignments: z.boolean().optional(),
    emailGoalUpdates: z.boolean().optional(),
    emailWeeklyDigest: z.boolean().optional(),
    pushMentions: z.boolean().optional(),
    pushDueDateReminders: z.boolean().optional(),
    pushAnnouncements: z.boolean().optional(),
    desktopSound: z.boolean().optional(),
  }),
})

export const notificationValidation = {
  listQuery,
  preferenceBody,
}
