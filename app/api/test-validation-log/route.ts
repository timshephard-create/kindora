import { NextResponse } from 'next/server';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || '';
const VALIDATION_TABLE = 'ValidationLog';

export async function GET() {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return NextResponse.json({
      error: 'Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID',
      hasKey: !!AIRTABLE_API_KEY,
      hasBase: !!AIRTABLE_BASE_ID,
    }, { status: 500 });
  }

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(VALIDATION_TABLE)}`;
  const payload = {
    records: [{
      fields: {
        Tool: 'test',
        Flags: 'Test flag from /api/test-validation-log',
        Confidence: 'high',
        WasOverridden: false,
        InputSummary: 'Test record — safe to delete',
        Timestamp: new Date().toISOString(),
      },
    }],
  };

  try {
    console.log('[TestValidation] POST to:', url);
    console.log('[TestValidation] Payload:', JSON.stringify(payload));

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    console.log('[TestValidation] Status:', res.status);
    console.log('[TestValidation] Response:', JSON.stringify(data));

    return NextResponse.json({
      status: res.status,
      ok: res.ok,
      airtableResponse: data,
      sentPayload: payload,
      tableUrl: url.replace(AIRTABLE_API_KEY, 'REDACTED'),
    });
  } catch (err) {
    console.error('[TestValidation] Fetch error:', err);
    return NextResponse.json({
      error: 'Fetch failed',
      message: String(err),
    }, { status: 500 });
  }
}
