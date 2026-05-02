import prisma from './prisma'

export async function writeAuditLog(params: {
  workspaceId: string
  actorId: string
  action: string
  metadata?: Record<string, unknown>
}) {
  await prisma.auditLog.create({
    data: {
      workspaceId: params.workspaceId,
      actorId: params.actorId,
      action: params.action,
      metadata: (params.metadata ?? {}) as object,
    },
  })
}
