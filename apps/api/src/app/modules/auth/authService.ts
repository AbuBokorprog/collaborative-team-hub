import httpStatus from 'http-status'
import { randomBytes, randomUUID } from 'crypto'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { ComparePassword } from '../../helpers/ComparePassword'
import prisma from '../../helpers/prisma'
import { AppError } from '../../utils/AppError'
import { getAccessToken } from '../../helpers/AccessToken'
import config from '../../config'
import { HashPassword } from '../../helpers/HashPassword'
import { TLogin, TRegister } from './authInterface'
import { Role } from '../../../generated/prisma/enums'
import { SendMail } from '../../utils/SendMail'
import { forgotPasswordTemplate, verifyEmailTemplate } from '../../views'

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

const resolveHighestRole = async (userId: string): Promise<string> => {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    select: { role: true },
  })
  const rank: Record<string, number> = { ADMIN: 3, MANAGER: 2, MEMBER: 1 }
  return memberships.reduce(
    (best, m) => ((rank[m.role] ?? 0) > (rank[best] ?? 0) ? m.role : best),
    'MEMBER',
  )
}

const issueTokens = async (user: {
  id: string
  email: string
  name: string
}) => {
  const role = await resolveHighestRole(user.id)

  const accessToken = await getAccessToken(
    { id: user.id, email: user.email, name: user.name, role },
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
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Could not issue refresh token',
    )
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

  const verifyToken = await getAccessToken(
    { id: user.id, email: user.email, type: 'verify-email' },
    config.access_token as string,
    '24h',
  )
  const verifyLink = `${config.client_url}/verify-email?token=${verifyToken}`
  await SendMail({
    to: user.email,
    subject: 'Verify your Team Hub email',
    html: verifyEmailTemplate({ name: user.name, verifyLink }),
    text: `Verify your email: ${verifyLink}`,
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
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Refresh token revoked or invalid',
    )
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

const changePassword = async (
  user: any,
  payload: { newPassword: string; oldPassword: string },
) => {
  const isExistUser = await prisma.user.findUniqueOrThrow({
    where: { id: user?.id, status: 'ACTIVE' },
  })

  const isMatchedPassword = await ComparePassword(
    payload.oldPassword,
    isExistUser?.password,
  )

  if (!isMatchedPassword) {
    throw new AppError(httpStatus.NOT_FOUND, 'Old password not matched!')
  }

  const newHashedPassword = await HashPassword(payload.newPassword)
  const result = await prisma.user.update({
    where: {
      id: user?.id,
    },
    data: {
      password: newHashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
  })

  await prisma.refreshToken.deleteMany({ where: { userId: user?.id } })

  return stripUser(result)
}

const forgotPassword = async (email: string) => {
  const isExistUser = await prisma.user.findFirst({
    where: {
      email: email.toLocaleLowerCase(),
      status: 'ACTIVE',
    },
  })

  if (!isExistUser) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'User not found please register your account!',
    )
  }

  const resetTokenData = {
    email: isExistUser.email,
    name: isExistUser.name,
    id: isExistUser.id,
  }

  const resetToken = await getAccessToken(
    { ...resetTokenData, type: 'reset-password' },
    config.access_token as string,
    '15m',
  )

  const resetLink = `${config.client_url}/reset-password?token=${resetToken}`

  await SendMail({
    to: isExistUser.email,
    subject: 'Reset your Team Hub password',
    html: forgotPasswordTemplate({
      name: isExistUser.name,
      resetLink,
    }),
    text: `Reset your password: ${resetLink}`,
  })

  return { email: isExistUser.email }
}

const resetPassword = async (payload: {
  newPassword: string
  token: string
}) => {
  let decoded: JwtPayload & { id?: string; email?: string; type?: string }
  try {
    decoded = jwt.verify(
      payload.token,
      config.access_token as string,
    ) as JwtPayload & {
      id?: string
      email?: string
      type?: string
    }
  } catch {
    throw new AppError(httpStatus.BAD_REQUEST, 'Token expired!')
  }

  if (!decoded.id || !decoded.email || decoded.type !== 'reset-password') {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User unauthorized!')
  }

  const newHashedPassword = await HashPassword(payload.newPassword)

  const result = await prisma.user.update({
    where: {
      id: decoded.id,
      email: decoded.email,
    },
    data: {
      password: newHashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
  })

  await prisma.refreshToken.deleteMany({ where: { userId: decoded.id } })

  return stripUser(result)
}

const verifyEmail = async (token: string) => {
  let decoded: JwtPayload & { id?: string; email?: string; type?: string }
  try {
    decoded = jwt.verify(token, config.access_token as string) as JwtPayload & {
      id?: string
      email?: string
      type?: string
    }
  } catch {
    throw new AppError(httpStatus.BAD_REQUEST, 'Verification link expired!')
  }

  if (!decoded.id || !decoded.email || decoded.type !== 'verify-email') {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid verification link')
  }

  const user = await prisma.user.update({
    where: { id: decoded.id, email: decoded.email },
    data: { status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      status: true,
    },
  })

  return { verified: true, user }
}

export const createTemporaryPassword = () =>
  randomBytes(9).toString('base64url')

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
      memberships: { select: { role: true, workspaceId: true } },
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
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  REFRESH_COOKIE_MAX_AGE_MS,
}
