import httpStatus from 'http-status'
import CatchAsync from '../../utils/CatchAsync'
import SuccessResponse from '../../utils/SuccessResponse'
import config from '../../config'
import { authService } from './authService'

const cookieOptions = {
  httpOnly: true,
  secure: config.node_env === 'production',
  sameSite: 'lax' as const,
  maxAge: authService.REFRESH_COOKIE_MAX_AGE_MS,
  path: '/',
}

const register = CatchAsync(async (req, res) => {
  const data = await authService.register(req.body)

  res.cookie('refreshToken', data.refreshToken, cookieOptions)

  SuccessResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: 'Registered successfully',
    data: {
      user: data.user,
      accessToken: data.accessToken,
    },
  })
})

const login = CatchAsync(async (req, res) => {
  const data = await authService.login(req.body)

  res.cookie('refreshToken', data.refreshToken, cookieOptions)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Login successful',
    data: {
      user: data.user,
      accessToken: data.accessToken,
    },
  })
})

const refresh = CatchAsync(async (req, res) => {
  const refreshToken =
    (req.cookies?.refreshToken as string | undefined) ??
    (req.body?.refreshToken as string | undefined)
  const data = await authService.refresh(refreshToken ?? '')

  res.cookie('refreshToken', data.refreshToken, cookieOptions)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Token refreshed',
    data: {
      user: data.user,
      accessToken: data.accessToken,
    },
  })
})

const logout = CatchAsync(async (req, res) => {
  await authService.logout(req.cookies?.refreshToken as string | undefined)

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: config.node_env === 'production',
    sameSite: 'lax',
    path: '/',
  })

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Logged out',
    data: null,
  })
})

const me = CatchAsync(async (req, res) => {
  const userId = req.user?.id as string
  const data = await authService.me(userId)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Current user',
    data,
  })
})

const forgotPassword = CatchAsync(async (req, res) => {
  const data = await authService.forgotPassword(req.body.email)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Password reset email queued',
    data,
  })
})

const resetPassword = CatchAsync(async (req, res) => {
  const data = await authService.resetPassword(req.body.token, req.body.password)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Password reset',
    data,
  })
})

const verifyEmail = CatchAsync(async (req, res) => {
  const data = await authService.verifyEmail(req.body.email, req.body.code)

  SuccessResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Email verified',
    data,
  })
})

export const authController = {
  register,
  login,
  refresh,
  logout,
  me,
  forgotPassword,
  resetPassword,
  verifyEmail,
}
