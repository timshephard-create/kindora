import { PLATFORM, TOOLS, type ToolId } from '@/config/platform';

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL || PLATFORM.email.fromEmail;
const BREVO_FROM_NAME = process.env.BREVO_FROM_NAME || PLATFORM.email.fromName;

export async function sendWelcomeEmail(
  name: string,
  email: string,
  toolId: string,
): Promise<boolean> {
  if (!BREVO_API_KEY) {
    console.warn('[Brevo] Missing API key — skipping email');
    return false;
  }

  const tool = TOOLS[toolId as ToolId];
  if (!tool) return false;

  const subject = tool.emailSubject;
  const htmlContent = buildEmailHtml(name, tool);

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: BREVO_FROM_NAME, email: BREVO_FROM_EMAIL },
        to: [{ email, name }],
        subject,
        htmlContent,
      }),
    });

    return res.ok;
  } catch (err) {
    console.error('[Brevo] Failed to send email:', err);
    return false;
  }
}

function buildEmailHtml(name: string, tool: typeof TOOLS[ToolId]): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family: 'DM Sans', Arial, sans-serif; color: #2C2C2C; max-width: 560px; margin: 0 auto; padding: 24px; background-color: #FAF6F0;">
  <div style="padding: 32px 24px; background: #FFFDF9; border-radius: 16px;">
    <p style="font-size: 16px; line-height: 1.6;">Hi ${name},</p>
    <p style="font-size: 16px; line-height: 1.6;">
      Thanks for using <strong>${tool.name}</strong> on ${PLATFORM.name}. Your personalized results are ready &mdash;
      you can revisit them anytime by heading back to
      <a href="${PLATFORM.url}${tool.route}" style="color: #5C7A5A;">${PLATFORM.name}</a>.
    </p>
    <p style="font-size: 16px; line-height: 1.6;">
      We built ${PLATFORM.name} because navigating family systems &mdash; childcare, health insurance, screen time &mdash;
      shouldn&rsquo;t require a PhD. If this helped even a little, we&rsquo;re glad.
    </p>
    <p style="font-size: 14px; color: #6B6B6B; margin-top: 32px;">
      Warmly,<br />
      ${PLATFORM.email.fromName}
    </p>
  </div>
  <p style="font-size: 12px; color: #6B6B6B; text-align: center; margin-top: 24px;">
    ${PLATFORM.name} &middot; ${PLATFORM.domain}
  </p>
</body>
</html>`.trim();
}
