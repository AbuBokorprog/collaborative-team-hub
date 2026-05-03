import { JwtPayload } from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      user?: AuthJwtPayload
      workspaceId?: string
      membership?: {
        id: string
        role: 'ADMIN' | 'MANAGER' | 'MEMBER'
        workspaceId: string
        userId: string
      }
    }
  }
}

export interface AuthJwtPayload extends JwtPayload {
  id: string
  email: string
  name: string
  role?: string
}

export interface DecodedToken extends AuthJwtPayload {
  exp: number
  iat?: number
}
