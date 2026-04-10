import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || '';
const TABLE_NAME = 'PremiumWaitlist';
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';

const inputSchema = z.object({
  email: z.string().email(),
  tool: z.string().min(1),
});

async function checkDuplicate(email: string): Promise<boolean> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) return false;
  try {
    const filter = encodeURIComponent(`{Email} = '${email}'`);
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}?filterByFormula=${filter}&maxRecords=1`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    });
    const data = await res.json();
    return (data.records?.length || 0) > 0;
  } catch {
    return false;
  }
}

async function writeToAirtable(email: string, tool: string): Promise<boolean> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) return false;
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{
          fields: {
            Email: email,
            Tool: tool,
            Timestamp: new Date().toISOString().split('T')[0],
            Source: 'premium_lock_card',
          },
        }],
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('[PremiumWaitlist] Airtable write failed:', res.status, JSON.stringify(data));
      return false;
    }
    return true;
  } catch (err) {
    console.error('[PremiumWaitlist] Airtable error:', err);
    return false;
  }
}

async function sendConfirmationEmail(email: string): Promise<boolean> {
  if (!BREVO_API_KEY) {
    console.warn('[PremiumWaitlist] No BREVO_API_KEY — skipping email');
    return false;
  }

  const payload = {
    sender: { name: 'Tim at Kindora World', email: 'tim@kindora.world' },
    to: [{ email }],
    subject: 'You\'re on the Kindora Premium waitlist \uD83C\uDF31',
    htmlContent: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#FAF6F0;font-family:'DM Sans',Arial,sans-serif;color:#2C2C2C;">
  <div style="max-width:600px;margin:0 auto;padding:24px 20px;">
    <div style="text-align:center;padding:16px 0 12px;"><span style="font-size:22px;font-weight:700;color:#2C2C2C;letter-spacing:-0.5px;">Kindora World</span></div>
    <div style="border-top:2px solid #E2DAD0;margin-bottom:24px;"></div>
    <div style="background:#FFFDF9;border-radius:16px;padding:28px 24px;">
      <p style="font-size:16px;line-height:1.7;margin:0 0 16px;">Hey &mdash; you're in.</p>
      <p style="font-size:15px;line-height:1.6;">We're building Kindora Premium to help families save their results, track their progress, and never have to start from scratch when life changes.</p>
      <p style="font-size:15px;line-height:1.6;font-weight:600;margin:16px 0 8px;">As a founding member you'll get:</p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 16px;"><tr><td style="padding:6px 0;font-size:14px;">&#10003; First access before public launch</td></tr><tr><td style="padding:6px 0;font-size:14px;">&#10003; Founding member pricing (locked in for life)</td></tr><tr><td style="padding:6px 0;font-size:14px;">&#10003; Direct line to shape what we build next</td></tr></table>
      <p style="font-size:15px;line-height:1.6;">We'll be in touch soon.</p>
    </div>
    <div style="border-top:1px solid #E2DAD0;margin-top:24px;padding-top:20px;text-align:center;">
      <p style="font-size:14px;color:#2C2C2C;margin:0;">&mdash; Tim</p>
      <p style="font-size:13px;color:#6B6B6B;margin:4px 0;">Kindora World</p>
      <a href="https://kindora.world" style="font-size:13px;color:#5C7A5A;text-decoration:none;">kindora.world</a>
      <p style="font-size:11px;color:#999;margin:16px 0 0;">You received this because you joined the Kindora Premium waitlist. Questions? <a href="mailto:tim@kindora.world" style="color:#999;">tim@kindora.world</a></p>
    </div>
  </div>
</body>
</html>`,
  };

  try {
    console.log('[PremiumWaitlist] Sending Brevo email to:', email);
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const body = await res.text();
    console.log('[PremiumWaitlist] Brevo response:', res.status, body);

    if (!res.ok) {
      console.error('[PremiumWaitlist] Brevo send FAILED:', res.status, body);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[PremiumWaitlist] Brevo fetch error:', err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = inputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { email, tool } = parsed.data;

    // Check for duplicate — still return success if exists
    const exists = await checkDuplicate(email);
    if (!exists) {
      await writeToAirtable(email, tool);
      // Send confirmation email — await so errors are logged
      try {
        await sendConfirmationEmail(email);
      } catch (emailErr) {
        console.error('[PremiumWaitlist] Email send error:', emailErr);
      }
    } else {
      console.log('[PremiumWaitlist] Duplicate email, skipping write + email:', email);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PremiumWaitlist] Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
