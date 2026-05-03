import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env') })

const port = Number(process.env.PORT) || 5000

export default {
  node_env: process.env.NODE_ENV ?? 'development',
  port,
  client_url: process.env.CLIENT_URL ?? 'http://localhost:3000',
  salt: process.env.SALT ?? '10',
  access_token: process.env.JWT_ACCESS_SECRET,
  access_expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  refresh_token: process.env.JWT_REFRESH_SECRET,
  refresh_expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  mail_host: process.env.MAIL_HOST ?? 'smtp.gmail.com',
  mail_port: Number(process.env.MAIL_PORT) || 587,
  mail_user: process.env.MAIL_USER,
  mail_pass: process.env.MAIL_PASS,
  mail_from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_secret_key: process.env.CLOUDINARY_API_SECRET,
}
