import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'
import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import config from '../config'

if (config.cloudinary_cloud_name && config.cloudinary_api_key && config.cloudinary_secret_key) {
  cloudinary.config({
    cloud_name: config.cloudinary_cloud_name,
    api_key: config.cloudinary_api_key,
    api_secret: config.cloudinary_secret_key,
  })
}

export const ImageUpload = (imageName: string, filePath: string) => {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        public_id: imageName.trim().replace(/[^a-zA-Z0-9_-]/g, '_'),
      },
      function (error, result) {
        if (error || !result) {
          reject(error ?? new Error('Upload failed'))
          return
        }
        resolve(result as UploadApiResponse)
        fs.unlink(filePath, err => {
          if (err) console.error(err)
        })
      },
    )
  })
}

export const ImageUploadBuffer = (buffer: Buffer, publicId: string) => {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId.trim().replace(/[^a-zA-Z0-9_-]/g, '_') },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Upload failed'))
          return
        }
        resolve(result)
      },
    )
    stream.end(buffer)
  })
}

const memoryStorage = multer.memoryStorage()
export const uploadDisk = multer({ storage: memoryStorage })

const cloudinaryStorage =
  config.cloudinary_cloud_name && config.cloudinary_api_key && config.cloudinary_secret_key
    ? new CloudinaryStorage({
        cloudinary: cloudinary as unknown as typeof import('cloudinary').v2,
      })
    : null

export const upload = multer({
  storage: cloudinaryStorage ?? memoryStorage,
})
