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

const uploadsDir = path.join(process.cwd(), 'uploads')
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    cb(null, uploadsDir)
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}-${file.originalname}`)
  },
})

export const uploadDisk = multer({ storage: diskStorage })

const cloudinaryStorage =
  config.cloudinary_cloud_name && config.cloudinary_api_key && config.cloudinary_secret_key
    ? new CloudinaryStorage({
        cloudinary: cloudinary as unknown as typeof import('cloudinary').v2,
      })
    : null

export const upload = multer({
  storage: cloudinaryStorage ?? diskStorage,
})
