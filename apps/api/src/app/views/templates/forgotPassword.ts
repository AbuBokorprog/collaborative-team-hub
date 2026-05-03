import { baseTemplate } from './baseTemplate'

export const forgotPasswordTemplate = ({
  name,
  resetLink,
}: {
  name?: string
  resetLink: string
}) => {
  return baseTemplate({
    title: 'Reset Your Password',
    content: `
      <h2 style="margin-top:0;">Reset Password</h2>

      <p>Hello ${name || 'User'},</p>

      <p>
        We received a request to reset your password.
        Click the button below to create a new password.
      </p>

      <p style="text-align:center;margin:30px 0;">
        <a href="${resetLink}"
          style="background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:8px;display:inline-block;font-weight:600;">
          Reset Password
        </a>
      </p>

      <p>
        If the button doesn't work, copy and paste this link:
      </p>

      <p style="word-break:break-all;color:#2563eb;">
        ${resetLink}
      </p>

      <p>
        If you did not request this, please ignore this email.
      </p>
    `,
  })
}
