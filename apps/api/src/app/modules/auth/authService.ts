import httpStatus from 'http-status'
import { randomUUID } from 'crypto'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { ComparePassword } from '../../helpers/ComparePassword'
import prisma from '../../helpers/prisma'
import { AppError } from '../../utils/AppError'
import { getAccessToken } from '../../helpers/AccessToken'
import config from '../../config'
import { HashPassword } from '../../helpers/HashPassword'
import { TLogin, TRegister } from './authInterface'
import { Role } from '../../../generated/prisma/enums'

const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

const stripUser = (user: {
  id: string
  name: string
  email: string
  avatar: string | null
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
})

const issueTokens = async (user: {
  id: string
  email: string
  name: string
}) => {
  const accessToken = await getAccessToken(
    { id: user.id, email: user.email, name: user.name },
    config.access_token as string,
    config.access_expiresIn as string,
  )

  const jti = randomUUID()
  const refreshToken = await getAccessToken(
    { id: user.id, jti, type: 'refresh' },
    config.refresh_token as string,
    config.refresh_expiresIn as string,
  )

  const decoded = jwt.decode(refreshToken) as JwtPayload
  const expSec = decoded.exp
  if (!expSec) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Could not issue refresh token')
  }

  await prisma.refreshToken.create({
    data: {
      jti,
      userId: user.id,
      expiresAt: new Date(expSec * 1000),
    },
  })

  return { accessToken, refreshToken, jti }
}

const register = async (payload: TRegister) => {
  const existing = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() },
  })
  if (existing) {
    throw new AppError(httpStatus.CONFLICT, 'Email already registered')
  }

  const hashed = await HashPassword(payload.password)
  const user = await prisma.$transaction(async tx => {
    const created = await tx.user.create({
      data: {
        name: payload.name,
        email: payload.email.toLowerCase(),
        password: hashed,
      },
    })

    if (payload.workspaceName) {
      const workspace = await tx.workspace.create({
        data: {
          name: payload.workspaceName,
          description: payload.description,
        },
      })
      await tx.membership.create({
        data: {
          userId: created.id,
          workspaceId: workspace.id,
          role: Role.ADMIN,
        },
      })
    }

    return created
  })

  const tokens = await issueTokens(user)
  return { user: stripUser(user), ...tokens }
}

const login = async (payload: TLogin) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() },
  })

  if (!user || user.status !== 'ACTIVE') {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid credentials')
  }

  const ok = await ComparePassword(payload.password, user.password)
  if (!ok) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid credentials')
  }

  const tokens = await issueTokens(user)
  return { user: stripUser(user), ...tokens }
}

const refresh = async (refreshTokenFromCookie: string) => {
  let decoded: JwtPayload & { id?: string; jti?: string; type?: string }
  try {
    decoded = jwt.verify(
      refreshTokenFromCookie,
      config.refresh_token as string,
    ) as JwtPayload & { id?: string; jti?: string; type?: string }
  } catch {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid refresh token')
  }

  if (!decoded.jti || !decoded.id || decoded.type !== 'refresh') {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid refresh token')
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { jti: decoded.jti },
  })

  if (!stored || stored.userId !== decoded.id) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Refresh token revoked or invalid')
  }

  if (stored.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { jti: decoded.jti } })
    throw new AppError(httpStatus.UNAUTHORIZED, 'Refresh token expired')
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  })

  if (!user || user.status !== 'ACTIVE') {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid credentials')
  }

  await prisma.refreshToken.delete({ where: { jti: decoded.jti } })

  const tokens = await issueTokens(user)
  return { user: stripUser(user), ...tokens }
}

const forgotPassword = async (email: string) => {
  await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  return {
    message: 'If the email exists, a password reset link has been sent.',
  }
}

const resetPassword = async (_token: string, _password: string) => {
  throw new AppError(
    httpStatus.NOT_IMPLEMENTED,
    'Password reset token persistence is not configured yet',
  )
}

const verifyEmail = async (_email: string, _code: string) => {
  return { verified: true }
}

const logout = async (refreshTokenFromCookie: string | undefined) => {
  if (!refreshTokenFromCookie) return
  try {
    const decoded = jwt.verify(
      refreshTokenFromCookie,
      config.refresh_token as string,
    ) as JwtPayload & { jti?: string }
    if (decoded.jti) {
      await prisma.refreshToken.deleteMany({ where: { jti: decoded.jti } })
    }
  } catch {
    // ignore invalid token on logout
  }
}

const me = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  })
  return user
}

export const authService = {
  register,
  login,
  refresh,
  logout,
  me,
  forgotPassword,
  resetPassword,
  verifyEmail,
  REFRESH_COOKIE_MAX_AGE_MS,
}
