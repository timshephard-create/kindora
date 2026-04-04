import { NextRequest, NextResponse } from 'next/server';
import { leadSchema } from '@/lib/validations';
import { createLead } from '@/lib/airtable';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { name, email, tool, profileSummary } = parsed.data;

    // Fire and forget — never block the user on lead save failure
    await createLead({ name, email, tool, profileSummary });

    return NextResponse.json({ success: true });
  } catch (err) {
    // Log but never surface to user
    console.error('[API /leads] Error:', err);
    return NextResponse.json({ success: true });
  }
}
