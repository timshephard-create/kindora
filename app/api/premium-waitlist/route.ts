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
    sender: { name: 'Tim at Kindora World', email: 'tim@timshephard.co' },
    to: [{ email }],
    subject: 'You\'re on the Kindora Premium waitlist \uD83C\uDF31',
    htmlContent: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family: 'DM Sans', Arial, sans-serif; color: #2C2C2C; max-width: 560px; margin: 0 auto; padding: 24px; background-color: #FAF6F0;">
  <div style="padding: 32px 24px; background: #FFFDF9; border-radius: 16px;">
    <p style="font-size: 16px; line-height: 1.7;">Hey &mdash; you're in.</p>
    <p style="font-size: 16px; line-height: 1.7;">
      We're building Kindora Premium to help families save their results, track their progress,
      and never have to start from scratch when life changes.
    </p>
    <p style="font-size: 16px; line-height: 1.7;">As a founding member you'll get:</p>
    <ul style="font-size: 15px; line-height: 1.8; padding-left: 20px;">
      <li>First access before public launch</li>
      <li>Founding member pricing (locked in for life)</li>
      <li>Direct line to shape what we build next</li>
    </ul>
    <p style="font-size: 16px; line-height: 1.7;">We'll be in touch soon.</p>
    <p style="font-size: 14px; color: #6B6B6B; margin-top: 32px;">
      &mdash; Tim<br />Kindora World<br />
      <a href="https://kindora.world" style="color: #5C7A5A;">kindora.world</a>
    </p>
  </div>
</body>
</html>`.trim(),
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
