import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { insightInputSchema } from '@/lib/validations';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const FALLBACK_INSIGHTS: Record<string, string> = {
  childcare:
    'Based on your family profile, there are likely several savings programs available to help reduce your childcare costs. Many families in similar situations leave thousands of dollars on the table simply because they don\'t know what they qualify for.',
  health:
    'Your health coverage options depend on several factors, including your household income and employer situation. The good news is that there are more paths to affordable coverage than most people realize.',
  media:
    'Finding age-appropriate content for your child doesn\'t have to be overwhelming. A few simple guidelines about pacing, interactivity, and co-viewing can help you feel confident about screen time decisions.',
};

function buildPrompt(tool: string, profile: Record<string, unknown>): string {
  const profileStr = Object.entries(profile)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
    .join('\n');

  const context: Record<string, string> = {
    childcare: `You are a caring childcare advisor for families. Based on this family's profile, give a warm, personalized 2-3 sentence insight about their childcare situation. Be specific to their details. No bullet points. No jargon.\n\nProfile:\n${profileStr}`,
    health: `You are a family health insurance advisor. Based on this family's profile, give a warm, personalized 2-3 sentence insight about their health coverage situation. Be encouraging and specific. No bullet points. No jargon.\n\nProfile:\n${profileStr}`,
    media: `You are a child development media specialist. Based on this child's profile, give a warm, personalized 2-3 sentence insight about finding appropriate content. Be specific to their age and context. No bullet points.\n\nProfile:\n${profileStr}`,
  };

  return context[tool] || context.childcare;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = insightInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { tool, profile } = parsed.data;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        data: { insight: FALLBACK_INSIGHTS[tool] || FALLBACK_INSIGHTS.childcare },
      });
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: buildPrompt(tool, profile as Record<string, unknown>),
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    const insight = textBlock ? textBlock.text : FALLBACK_INSIGHTS[tool] || '';

    return NextResponse.json({ data: { insight } });
  } catch (err) {
    console.error('[API /insight] Error:', err);
    const tool = 'childcare';
    return NextResponse.json({
      data: { insight: FALLBACK_INSIGHTS[tool] },
    });
  }
}
