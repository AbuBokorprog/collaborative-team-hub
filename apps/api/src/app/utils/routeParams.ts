import { Request } from 'express'

export function paramId(
  v: string | string[] | undefined,
): string {
  if (Array.isArray(v)) return v[0] ?? ''
  return v ?? ''
}

export function headerWorkspaceId(req: Request): string | undefined {
  const h = req.headers['x-workspace-id']
  const v = Array.isArray(h) ? h[0] : h
  return v
}
