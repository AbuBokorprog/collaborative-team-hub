import { baseTemplate } from './baseTemplate'

export const verifyEmailTemplate = ({
  name,
  verifyLink,
}: {
  name?: string
  verifyLink: string
}) => {
  return baseTemplate({
    title: 'Verify Your Email',
    content: `
      <h2 style="margin-top:0;">Verify Your Email 📩</h2>

      <p>Hello ${name || 'User'},</p>

      <p>
        Thanks for signing up. Please verify your email address
        to activate your account and continue using our platform.
      </p>

      <p style="text-align:center;margin:30px 0;">
        <a href="${verifyLink}"
          style="
            background:#2563eb;
            color:#ffffff;
            text-decoration:none;
            padding:14px 24px;
            border-radius:8px;
            display:inline-block;
            font-weight:600;
          ">
          Verify Email
        </a>
      </p>

      <p>
        If the button doesn't work, copy and paste this link into your browser:
      </p>

      <p style="word-break:break-all;color:#2563eb;">
        ${verifyLink}
      </p>

      <p>
        If you did not create an account, you can safely ignore this email.
      </p>
    `,
  })
}
