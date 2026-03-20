import { Resend } from "resend";

function getResendClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(key);
}

interface WeeklyEmailData {
  to: string;
  username: string;
  displayName: string | null;
  totalTokens: number;
  totalCost: number;
  daysActive: number;
  topModel: string | null;
  roiMultiplier: number;
  subscriptionPrice: number;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export async function sendWeeklyEmail(data: WeeklyEmailData) {
  const name = data.displayName || data.username;
  const tokenStr = formatTokens(data.totalTokens);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#FAFAFA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <tr>
      <td>
        <!-- Logo -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
          <tr>
            <td>
              <span style="font-size:24px;font-weight:800;color:#111827;">BURN</span><span style="font-size:24px;font-weight:800;color:#2563EB;">LOG</span>
            </td>
          </tr>
        </table>

        <!-- Main Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A1A1A;border-radius:20px;overflow:hidden;">
          <tr>
            <td style="padding:40px;">
              <!-- Greeting -->
              <p style="color:#9CA3AF;font-size:15px;margin:0 0 8px 0;">Your weekly burn report</p>
              <h1 style="color:#F9FAFB;font-size:28px;font-weight:700;margin:0 0 32px 0;">
                Hey ${name} &#128075;
              </h1>

              <!-- Big Number -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center" style="padding:24px 0;">
                    <p style="color:#F9FAFB;font-size:48px;font-weight:700;font-family:'Courier New',monospace;margin:0;letter-spacing:-1px;">
                      ${tokenStr}
                    </p>
                    <p style="color:#9CA3AF;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:2px;margin:8px 0 0 0;">
                      Tokens Burned This Week
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Stats Grid -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td width="33%" style="text-align:center;padding:16px 0;border-top:1px solid rgba(255,255,255,0.1);">
                    <p style="color:#F9FAFB;font-size:24px;font-weight:600;font-family:'Courier New',monospace;margin:0;">
                      $${data.totalCost.toFixed(2)}
                    </p>
                    <p style="color:#9CA3AF;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:4px 0 0 0;">
                      API Value
                    </p>
                  </td>
                  <td width="33%" style="text-align:center;padding:16px 0;border-top:1px solid rgba(255,255,255,0.1);">
                    <p style="color:#F9FAFB;font-size:24px;font-weight:600;font-family:'Courier New',monospace;margin:0;">
                      ${data.roiMultiplier.toFixed(1)}x
                    </p>
                    <p style="color:#9CA3AF;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:4px 0 0 0;">
                      ROI
                    </p>
                  </td>
                  <td width="33%" style="text-align:center;padding:16px 0;border-top:1px solid rgba(255,255,255,0.1);">
                    <p style="color:#F9FAFB;font-size:24px;font-weight:600;font-family:'Courier New',monospace;margin:0;">
                      ${data.daysActive}
                    </p>
                    <p style="color:#9CA3AF;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:4px 0 0 0;">
                      Days Active
                    </p>
                  </td>
                </tr>
              </table>

              ${data.topModel ? `
              <p style="color:#9CA3AF;font-size:13px;margin:0 0 24px 0;">
                Most used model: <span style="color:#3B82F6;font-weight:600;">${data.topModel}</span>
              </p>
              ` : ""}

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://burnlog.dev/dashboard"
                       style="display:inline-block;background:#2563EB;color:#FFFFFF;font-size:15px;font-weight:600;padding:14px 32px;border-radius:50px;text-decoration:none;">
                      View Full Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
          <tr>
            <td align="center">
              <p style="color:#9CA3AF;font-size:12px;margin:0;">
                <a href="https://burnlog.dev/u/${data.username}" style="color:#6B7280;text-decoration:none;">
                  burnlog.dev/u/${data.username}
                </a>
              </p>
              <p style="color:#9CA3AF;font-size:11px;margin:8px 0 0 0;">
                You received this because you have data on Burnlog.
                <a href="https://burnlog.dev/settings" style="color:#6B7280;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const resend = getResendClient();
  const { data: result, error } = await resend.emails.send({
    from: "Burnlog <noreply@burnlog.dev>",
    to: data.to,
    subject: `Your Burnlog: ${tokenStr} tokens this week`,
    html,
  });

  if (error) {
    console.error(`Failed to send email to ${data.to}:`, error);
    throw error;
  }

  return result;
}
