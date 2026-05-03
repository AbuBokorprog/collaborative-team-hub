import { baseTemplate } from './baseTemplate'

export const welcomeTemplate = ({ name }: { name?: string }) => {
  return baseTemplate({
    title: 'Welcome',
    content: `
      <h2 style="margin-top:0;">Welcome 🎉</h2>

      <p>Hello ${name || 'User'},</p>

      <p>
        Thanks for joining us. Your account has been created successfully.
      </p>

      <p>
        We’re excited to have you with us.
      </p>
    `,
  })
}
