const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || '';
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'leads';

const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

interface LeadRecord {
  name: string;
  email: string;
  tool: string;
  profileSummary?: string;
}

interface ExistingRecord {
  id: string;
  tool: string;
}

async function findByEmail(email: string): Promise<ExistingRecord | null> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) return null;

  try {
    const filter = encodeURIComponent(`{Email} = '${email}'`);
    const url = `${BASE_URL}?filterByFormula=${filter}&maxRecords=1`;
    console.log('[Airtable] Dedup check for email:', email);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    });
    const data = await res.json();

    console.log('[Airtable] Dedup response status:', res.status);
    console.log('[Airtable] Dedup response body:', JSON.stringify(data));

    if (!res.ok) {
      console.error('[Airtable] Dedup check failed:', res.status, JSON.stringify(data));
      return null;
    }

    const record = data.records?.[0];
    if (!record) return null;

    return { id: record.id, tool: record.fields?.Tool || '' };
  } catch (err) {
    console.error('[Airtable] Dedup fetch error:', err);
    return null;
  }
}

export async function createLead(lead: LeadRecord): Promise<boolean> {
  console.log('[Airtable] createLead called:', JSON.stringify({ ...lead, email: lead.email.replace(/(.{2}).*(@.*)/, '$1***$2') }));
  console.log('[Airtable] Config — API key present:', !!AIRTABLE_API_KEY, '| key length:', AIRTABLE_API_KEY.length);
  console.log('[Airtable] Config — Base ID:', AIRTABLE_BASE_ID || '(empty)');
  console.log('[Airtable] Config — Table:', AIRTABLE_TABLE_NAME);
  console.log('[Airtable] Config — URL:', BASE_URL);

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.warn('[Airtable] Missing API key or base ID — skipping lead save');
    return false;
  }

  try {
    // Check for existing record
    const existing = await findByEmail(lead.email);
    if (existing) {
      // Append new tool if not already tracked
      const existingTools = existing.tool.split(',').map((t) => t.trim()).filter(Boolean);
      if (!existingTools.includes(lead.tool)) {
        const updatedTool = [...existingTools, lead.tool].join(', ');
        console.log('[Airtable] Updating existing record', existing.id, '— Tool:', existingTools.join(', '), '->', updatedTool);

        const updateRes = await fetch(`${BASE_URL}/${existing.id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              Tool: updatedTool,
              CreatedAt: new Date().toISOString(),
            },
          }),
        });
        const updateData = await updateRes.json();
        console.log('[Airtable] Update response status:', updateRes.status);
        console.log('[Airtable] Update response body:', JSON.stringify(updateData));

        if (!updateRes.ok) {
          console.error('[Airtable] Update failed:', updateRes.status, JSON.stringify(updateData));
          return false;
        }

        console.log('[Airtable] Existing lead updated with new tool');
      } else {
        console.log('[Airtable] Lead already has tool', lead.tool, '— updating timestamp only');
        await fetch(`${BASE_URL}/${existing.id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fields: { CreatedAt: new Date().toISOString() } }),
        });
      }
      return true;
    }

    const payload = {
      records: [
        {
          fields: {
            Name: lead.name,
            Email: lead.email,
            Tool: lead.tool,
            ProfileSummary: lead.profileSummary || '',
            Source: 'web',
            CreatedAt: new Date().toISOString(),
          },
        },
      ],
    };

    console.log('[Airtable] POST', BASE_URL);
    console.log('[Airtable] Payload:', JSON.stringify(payload));

    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    console.log('[Airtable] Create response status:', res.status);
    console.log('[Airtable] Create response headers:', JSON.stringify(Object.fromEntries(res.headers.entries())));
    console.log('[Airtable] Create response body:', JSON.stringify(data));

    if (!res.ok) {
      console.error('[Airtable] Create failed:', res.status, JSON.stringify(data));
      return false;
    }

    console.log('[Airtable] Lead created successfully');
    return true;
  } catch (err) {
    console.error('[Airtable] Failed to create lead:', err);
    return false;
  }
}
