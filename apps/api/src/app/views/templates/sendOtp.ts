import { baseTemplate } from './baseTemplate'

export const otpTemplate = ({
  name,
  code,
}: {
  name?: string
  code: string
}) => {
  return baseTemplate({
    title: 'Verification Code',
    content: `
      <h2 style="margin-top:0;">Verification Code</h2>

      <p>Hello ${name || 'User'},</p>

      <p>Use the code below to continue:</p>

      <div style="
        font-size:32px;
        font-weight:700;
        letter-spacing:8px;
        text-align:center;
        padding:20px;
        background:#f3f4f6;
        border-radius:10px;
        margin:25px 0;
      ">
        ${code}
      </div>

      <p>This code will expire soon.</p>
    `,
  })
}
