// lib/email.ts
import { Resend } from "resend"

export async function sendInviteEmail({
  to,
  inviterName,
  workspaceName,
  inviteUrl,
}: {
  to: string
  inviterName: string
  workspaceName: string
  inviteUrl: string
}) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: "TaskFlow <onboarding@resend.dev>",
    to,
    subject: `${inviterName} invited you to join ${workspaceName} on TaskFlow`,
    html: buildInviteEmail({ inviterName, workspaceName, inviteUrl }),
  })

  if (error) throw new Error(error.message)
}

function buildInviteEmail({
  inviterName,
  workspaceName,
  inviteUrl,
}: {
  inviterName: string
  workspaceName: string
  inviteUrl: string
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're invited to ${workspaceName}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:520px;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0d0d0d 0%,#1a1a2e 100%);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <div style="width:32px;height:32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:8px;display:inline-block;"></div>
                <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.03em;">TaskFlow</span>
              </div>
              <p style="margin:16px 0 0;font-size:13px;color:#555;letter-spacing:0.05em;text-transform:uppercase;font-weight:600;">Workspace Invitation</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px;border-left:1px solid #e4e4e7;border-right:1px solid #e4e4e7;">

              <!-- Avatar placeholder + inviter -->
              <div style="text-align:center;margin-bottom:28px;">
                <div style="width:56px;height:56px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                  <span style="font-size:22px;font-weight:700;color:#fff;">${inviterName.charAt(0).toUpperCase()}</span>
                </div>
                <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;letter-spacing:-0.02em;line-height:1.3;">
                  You're invited!
                </h1>
                <p style="margin:0;font-size:15px;color:#71717a;line-height:1.6;">
                  <strong style="color:#3f3f46;">${inviterName}</strong> has invited you to join
                </p>
              </div>

              <!-- Workspace pill -->
              <div style="background:#f4f4f5;border:1px solid #e4e4e7;border-radius:12px;padding:16px 24px;text-align:center;margin-bottom:32px;">
                <div style="display:inline-block;width:10px;height:10px;background:#6366f1;border-radius:50%;margin-right:8px;vertical-align:middle;"></div>
                <span style="font-size:17px;font-weight:700;color:#09090b;letter-spacing:-0.01em;">${workspaceName}</span>
              </div>

              <!-- What is TaskFlow -->
              <p style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.7;text-align:center;">
                TaskFlow is an all-in-one workspace for managing projects, tracking tasks, and shipping faster — together.
              </p>

              <!-- CTA button -->
              <div style="text-align:center;margin-bottom:32px;">
                <a href="${inviteUrl}"
                  style="display:inline-block;background:#6366f1;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:-0.01em;box-shadow:0 4px 0 0 #4338ca;">
                  Accept invitation →
                </a>
              </div>

              <!-- Or copy link -->
              <div style="background:#fafafa;border:1px solid #e4e4e7;border-radius:8px;padding:12px 16px;margin-bottom:24px;">
                <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.08em;">Or copy this link</p>
                <p style="margin:0;font-size:12px;color:#6366f1;word-break:break-all;font-family:monospace;">${inviteUrl}</p>
              </div>

              <!-- Expiry notice -->
              <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center;line-height:1.6;">
                This invitation expires in <strong>7 days</strong>. If you didn't expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fafafa;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">
                Sent by <strong style="color:#6366f1;">TaskFlow</strong> · The workspace where great teams ship.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
