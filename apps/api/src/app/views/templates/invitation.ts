import { baseTemplate } from './baseTemplate'

export const invitationTemplate = ({
  invitedBy,
  email,
  password,
  loginLink,
  teamName,
}: {
  invitedBy: string
  email: string
  password: string
  loginLink?: string
  teamName?: string
}) => {
  return baseTemplate({
    title: 'You Are Invited',
    content: `
      <h2 style="margin-top:0;">You're Invited 🎉</h2>

      <p>
        <strong>${invitedBy}</strong> invited you to join
        <strong>${teamName || 'our platform'}</strong>.
      </p>

      <p>
        Your account has been created successfully. Use the credentials below to sign in:
      </p>

      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        style="
          margin:24px 0;
          background:#f9fafb;
          border:1px solid #e5e7eb;
          border-radius:8px;
          padding:18px;
        "
      >
        <tr>
          <td style="padding:8px 0;font-weight:600;">Email:</td>
          <td style="padding:8px 0;">${email}</td>
        </tr>

        <tr>
          <td style="padding:8px 0;font-weight:600;">Password:</td>
          <td style="padding:8px 0;">${password}</td>
        </tr>
      </table>

      ${
        loginLink
          ? `
      <p style="text-align:center;margin:30px 0;">
        <a href="${loginLink}"
          style="
            background:#10b981;
            color:#ffffff;
            text-decoration:none;
            padding:14px 24px;
            border-radius:8px;
            display:inline-block;
            font-weight:600;
          ">
          Login Now
        </a>
      </p>
      `
          : ''
      }

      <p>
        For security reasons, please change your password after your first login.
      </p>
    `,
  })
}
