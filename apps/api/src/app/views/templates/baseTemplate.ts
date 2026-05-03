export const baseTemplate = ({
  title,
  content,
}: {
  title: string
  content: string
}) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
    
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 20px;">
          
          <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;">
            
            <tr>
              <td style="background:#111827;padding:20px;text-align:center;color:#fff;font-size:24px;font-weight:bold;">
                Collaborative Team Hub
              </td>
            </tr>

            <tr>
              <td style="padding:40px 30px;color:#333;">
                ${content}
              </td>
            </tr>

            <tr>
              <td style="padding:20px;text-align:center;font-size:12px;color:#999;background:#f9fafb;">
                © ${new Date().getFullYear()} Collaborative Team Hub. All rights reserved.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `
}
