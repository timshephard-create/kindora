import { NextRequest, NextResponse } from 'next/server';
import { emailInputSchema } from '@/lib/validations';
import { sendWelcomeEmail } from '@/lib/email';

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

    const { name, email, tool } = parsed.data;

    await sendWelcomeEmail(name, email, tool);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[API /email] Error:', err);
    return NextResponse.json({ success: true });
  }
}
