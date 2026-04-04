import { NextRequest, NextResponse } from 'next/server';
import { placesInputSchema } from '@/lib/validations';
import { searchPlaces, FALLBACK_PROVIDERS } from '@/lib/places';

// Simple in-memory rate limit: 30 requests/min per IP
const rateMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= 30) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = placesInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { zip, types, radius } = parsed.data;
    const results = await searchPlaces(zip, types, radius);

    if (results.length === 0) {
      return NextResponse.json({
        data: FALLBACK_PROVIDERS,
        fallback: true,
        message: 'Live results unavailable — showing example options near you.',
      });
    }

    return NextResponse.json({ data: results });
  } catch (err) {
    console.error('[API /places] Error:', err);
    return NextResponse.json({
      data: FALLBACK_PROVIDERS,
      fallback: true,
      message: 'Live results unavailable — showing example options.',
    });
  }
}
