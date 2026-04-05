import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendWelcomeEmail, type EmailResultsData } from '@/lib/email';

const emailInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  tool: z.string().min(1),
  results: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = emailInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { name, email, tool, results } = parsed.data;

    await sendWelcomeEmail(name, email, tool, results as EmailResultsData | undefined);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[API /email] Error:', err);
    return NextResponse.json({ success: true });
  }
}
