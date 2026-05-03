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
