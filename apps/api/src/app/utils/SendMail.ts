import config from '../config'
import nodemailer from 'nodemailer'

type MailPayload = {
  to: string
  subject: string
  html: string
  text?: string
  attachments?: any[]
}

export const SendMail = async ({
  to,
  subject,
  html,
  text,
  attachments,
}: MailPayload) => {
  if (!config.mail_user || !config.mail_pass || !config.mail_from) {
    if (config.node_env !== 'production') {
      console.warn(
        `Email skipped for ${to}: mail credentials are not configured`,
      )
      return
    }
    throw new Error('Mail credentials are not configured')
  }

  const transporter = nodemailer.createTransport({
    host: config.mail_host,
    port: config.mail_port,
    secure: config.mail_port === 465,
    auth: {
      user: config.mail_user,
      pass: config.mail_pass,
    },
    tls: {
      rejectUnauthorized: false, // ⚠️ dev only
    },
  })

  await transporter.verify()

  await transporter.sendMail({
    from: config.mail_from,
    to,
    subject,
    text,
    html,
    attachments,
  })
}
