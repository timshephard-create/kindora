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

async function findByEmail(email: string): Promise<boolean> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) return false;

  try {
    const filter = encodeURIComponent(`{Email} = '${email}'`);
    const res = await fetch(`${BASE_URL}?filterByFormula=${filter}&maxRecords=1`, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    });
    const data = await res.json();
    return (data.records?.length || 0) > 0;
  } catch {
    return false;
  }
}

export async function createLead(lead: LeadRecord): Promise<boolean> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.warn('[Airtable] Missing API key or base ID — skipping lead save');
    return false;
  }

  try {
    // Deduplicate
    const exists = await findByEmail(lead.email);
    if (exists) return true;

    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
      }),
    });

    return res.ok;
  } catch (err) {
    console.error('[Airtable] Failed to create lead:', err);
    return false;
  }
}
