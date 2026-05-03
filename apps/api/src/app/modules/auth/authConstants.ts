const shell = (title: string, body: string) => `
  <div style="margin:0;padding:32px;background:#f6f7fb;font-family:Arial,sans-serif;color:#111827;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
      <div style="padding:24px 28px;background:#111827;color:#ffffff;">
        <p style="margin:0;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#a5b4fc;">Collaborative Team Hub</p>
        <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;">${title}</h1>
      </div>
      <div style="padding:28px;">${body}</div>
    </div>
  </div>
`

const button = (href: string, label: string) => `
  <a href="${href}" style="display:inline-block;margin:18px 0 8px;padding:12px 18px;border-radius:10px;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:700;">${label}</a>
`

export const authEmailTemplates = {
  verifyEmail: (name: string, verifyLink: string) =>
    shell(
      'Verify your email',
      `
        <p style="margin:0 0 12px;font-size:16px;">Hi ${name},</p>
        <p style="margin:0 0 16px;line-height:1.6;color:#4b5563;">Confirm your email address so your Team Hub account is ready to use.</p>
        ${button(verifyLink, 'Verify email')}
        <p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:#6b7280;">This link expires in 24 hours.</p>
      `,
    ),
  resetPassword: (name: string, resetLink: string) =>
    shell(
      'Reset your password',
      `
        <p style="margin:0 0 12px;font-size:16px;">Hi ${name},</p>
        <p style="margin:0 0 16px;line-height:1.6;color:#4b5563;">We received a request to reset your password. Use the secure link below to set a new one.</p>
        ${button(resetLink, 'Reset password')}
        <p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:#6b7280;">This link expires in 15 minutes. If you did not request this, you can ignore this email.</p>
      `,
    ),
  invitation: (
    workspaceName: string,
    email: string,
    temporaryPassword: string,
    loginLink: string,
  ) =>
    shell(
      `You're invited to ${workspaceName}`,
      `
        <p style="margin:0 0 12px;font-size:16px;">Welcome to Team Hub,</p>
        <p style="margin:0 0 16px;line-height:1.6;color:#4b5563;">You were invited to join <strong>${workspaceName}</strong>. Use the credentials below to sign in.</p>
        <div style="margin:18px 0;padding:16px;border-radius:10px;background:#f3f4f6;color:#111827;">
          <p style="margin:0 0 8px;"><strong>Email:</strong> ${email}</p>
          <p style="margin:0;"><strong>Temporary password:</strong> ${temporaryPassword}</p>
        </div>
        ${button(loginLink, 'Open Team Hub')}
        <p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:#6b7280;">For security, change this password after signing in.</p>
      `,
    ),
}
