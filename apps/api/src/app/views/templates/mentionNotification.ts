import { baseTemplate } from './baseTemplate'

export const mentionNotificationTemplate = ({
  mentionedBy,
  announcementTitle,
  commentBody,
  workspaceUrl,
}: {
  mentionedBy: string
  announcementTitle: string
  commentBody: string
  workspaceUrl?: string
}) => {
  return baseTemplate({
    title: `${mentionedBy} mentioned you`,
    content: `
      <h2 style="margin-top:0;">You were mentioned 💬</h2>

      <p>
        <strong>${mentionedBy}</strong> mentioned you in a comment on
        <strong>${announcementTitle}</strong>.
      </p>

      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        style="
          margin:24px 0;
          background:#f9fafb;
          border-left:4px solid #6366f1;
          border-radius:4px;
          padding:16px 20px;
        "
      >
        <tr>
          <td style="font-size:14px;color:#374151;line-height:1.6;">
            ${commentBody}
          </td>
        </tr>
      </table>

      ${
        workspaceUrl
          ? `
      <p style="text-align:center;margin:30px 0;">
        <a href="${workspaceUrl}"
          style="
            background:#6366f1;
            color:#ffffff;
            text-decoration:none;
            padding:14px 28px;
            border-radius:8px;
            display:inline-block;
            font-weight:600;
          ">
          View Announcement
        </a>
      </p>
      `
          : ''
      }

      <p style="font-size:13px;color:#6b7280;">
        You received this email because you were mentioned in a team comment.
      </p>
    `,
  })
}
