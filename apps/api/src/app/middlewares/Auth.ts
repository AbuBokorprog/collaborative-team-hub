import { AppError } from './../utils/AppError'
import httpStatus from 'http-status'
import CatchAsync from '../utils/CatchAsync'
import jwt, { Secret } from 'jsonwebtoken'
import prisma from '../helpers/prisma'
import config from '../config'
import { AuthJwtPayload } from '../interface'

const Auth = () => {
  return CatchAsync(async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You're unauthorized!")
    }

    const decoded = jwt.verify(
      token,
      config.access_token as Secret,
    ) as AuthJwtPayload & { exp?: number; iat?: number }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    })

    if (!user || user.status !== 'ACTIVE') {
      throw new AppError(httpStatus.UNAUTHORIZED, "You're unauthorized!")
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      exp: decoded.exp,
      iat: decoded.iat,
    }

    next()
  })
}

export default Auth
