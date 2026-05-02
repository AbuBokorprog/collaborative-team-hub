import httpStatus from 'http-status'
import prisma from '../../helpers/prisma'
import { AppError } from '../../utils/AppError'
import { ImageUpload } from '../../utils/ImageUpload'

const updateProfile = async (
  userId: string,
  payload: { name?: string; email?: string },
) => {
  if (payload.email) {
    const taken = await prisma.user.findFirst({
      where: {
        email: payload.email.toLowerCase(),
        NOT: { id: userId },
      },
    })
    if (taken) {
      throw new AppError(httpStatus.CONFLICT, 'Email already in use')
    }
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.email !== undefined ? { email: payload.email.toLowerCase() } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

const uploadAvatar = async (userId: string, file: Express.Multer.File) => {
  const uploaded = await ImageUpload(file.filename, file.path)
  const url = uploaded.secure_url ?? uploaded.url

  return prisma.user.update({
    where: { id: userId },
    data: { avatar: url },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
  })
}

export const userServices = {
  updateProfile,
  uploadAvatar,
}
