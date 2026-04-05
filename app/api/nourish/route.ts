import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { nourishInputSchema } from '@/lib/validations';
import type { NourishResponse } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

function buildFallback(): NourishResponse {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const meals = [
    { breakfast: { name: 'Oatmeal with banana', prepTime: '10 min', cost: '$1.20/serving' }, lunch: { name: 'Turkey & cheese wraps', prepTime: '10 min', cost: '$2.50/serving' }, dinner: { name: 'One-pot chicken & rice', prepTime: '35 min', cost: '$3.00/serving' } },
    { breakfast: { name: 'Scrambled eggs & toast', prepTime: '10 min', cost: '$1.50/serving' }, lunch: { name: 'PB&J with carrots', prepTime: '5 min', cost: '$1.80/serving' }, dinner: { name: 'Beef tacos with beans', prepTime: '25 min', cost: '$3.25/serving' } },
    { breakfast: { name: 'Yogurt parfait', prepTime: '5 min', cost: '$1.60/serving' }, lunch: { name: 'Chicken quesadillas', prepTime: '15 min', cost: '$2.20/serving' }, dinner: { name: 'Pasta with meat sauce', prepTime: '30 min', cost: '$2.75/serving' } },
    { breakfast: { name: 'Banana pancakes', prepTime: '15 min', cost: '$1.30/serving' }, lunch: { name: 'Veggie soup & bread', prepTime: '15 min', cost: '$2.00/serving' }, dinner: { name: 'Baked chicken thighs & roasted veggies', prepTime: '40 min', cost: '$3.50/serving' } },
    { breakfast: { name: 'Cereal with milk & fruit', prepTime: '5 min', cost: '$1.40/serving' }, lunch: { name: 'Ham & cheese sandwich', prepTime: '10 min', cost: '$2.30/serving' }, dinner: { name: 'Stir-fry with rice', prepTime: '25 min', cost: '$3.00/serving' } },
    { breakfast: { name: 'French toast', prepTime: '15 min', cost: '$1.25/serving' }, lunch: { name: 'Leftover stir-fry bowls', prepTime: '5 min', cost: '$1.50/serving' }, dinner: { name: 'Homemade pizza', prepTime: '45 min', cost: '$2.80/serving' } },
    { breakfast: { name: 'Breakfast burritos', prepTime: '15 min', cost: '$1.75/serving' }, lunch: { name: 'Grilled cheese & tomato soup', prepTime: '15 min', cost: '$2.10/serving' }, dinner: { name: 'Slow cooker chili', prepTime: '20 min', cost: '$2.50/serving' } },
  ];

  return {
    weeklyPlan: days.map((day, i) => ({ day, ...meals[i] })),
    shoppingList: [
      { item: 'Chicken thighs (3 lbs)', quantity: '1 pack', estimatedCost: '$7.50', category: 'Protein' },
      { item: 'Ground beef (2 lbs)', quantity: '1 pack', estimatedCost: '$9.00', category: 'Protein' },
      { item: 'Eggs (dozen)', quantity: '1', estimatedCost: '$3.50', category: 'Protein' },
      { item: 'Bananas', quantity: '1 bunch', estimatedCost: '$1.50', category: 'Produce' },
      { item: 'Carrots (2 lbs)', quantity: '1 bag', estimatedCost: '$2.00', category: 'Produce' },
      { item: 'Onions (3 lbs)', quantity: '1 bag', estimatedCost: '$2.50', category: 'Produce' },
      { item: 'Tomatoes', quantity: '4', estimatedCost: '$3.00', category: 'Produce' },
      { item: 'Milk (gallon)', quantity: '1', estimatedCost: '$4.00', category: 'Dairy' },
      { item: 'Shredded cheese', quantity: '1 bag', estimatedCost: '$3.50', category: 'Dairy' },
      { item: 'Yogurt (32 oz)', quantity: '1', estimatedCost: '$4.00', category: 'Dairy' },
      { item: 'Rice (5 lbs)', quantity: '1 bag', estimatedCost: '$4.50', category: 'Pantry' },
      { item: 'Pasta (1 lb)', quantity: '2 boxes', estimatedCost: '$3.00', category: 'Pantry' },
      { item: 'Canned beans', quantity: '4 cans', estimatedCost: '$4.00', category: 'Pantry' },
      { item: 'Bread', quantity: '2 loaves', estimatedCost: '$5.00', category: 'Pantry' },
      { item: 'Tortillas', quantity: '1 pack', estimatedCost: '$3.00', category: 'Pantry' },
      { item: 'Frozen mixed vegetables', quantity: '2 bags', estimatedCost: '$5.00', category: 'Frozen' },
    ],
    weeklyTotal: '$148.50',
    savingsTips: [
      'Buy chicken thighs instead of breasts \u2014 they\u2019re 30\u201340% cheaper and more flavorful.',
      'Stock up on rice, beans, and pasta when they\u2019re on sale. They last months and form the base of dozens of meals.',
      'Plan one \u201cleftover night\u201d per week to cut waste. Sunday\u2019s chili becomes Monday\u2019s lunch.',
    ],
    insight: 'For a family of 4 on a $150/week budget, you have plenty of room for balanced, tasty meals. The key is building around affordable proteins like chicken thighs and eggs, and leaning on pantry staples like rice and beans to stretch every dollar.',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = nourishInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { householdSize, budget, dietary, cookingTime, zip } = parsed.data;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ data: buildFallback() });
    }

    const dietaryStr = dietary.length === 0 || dietary.includes('none')
      ? 'no dietary restrictions'
      : dietary.join(', ');

    const cookingLabels: Record<string, string> = {
      minimal: '15-20 minutes max per meal',
      moderate: 'up to 45 minutes per meal',
      flexible: 'happy to cook longer on weekends',
      batch: 'prefers batch cooking / meal prep once per week',
    };

    const prompt = `You are a family meal planning expert and budget grocery optimizer. Create a realistic 7-day meal plan for this family.

Profile:
- Household size: ${householdSize}
- Weekly grocery budget: $${budget}
- Dietary restrictions: ${dietaryStr}
- Cooking time: ${cookingLabels[cookingTime] || cookingTime}
- Location ZIP: ${zip}

Return ONLY valid JSON (no markdown, no code fences) in this exact structure:
{
  "weeklyPlan": [
    {
      "day": "Monday",
      "breakfast": { "name": "string", "prepTime": "X min", "cost": "$X.XX/serving" },
      "lunch": { "name": "string", "prepTime": "X min", "cost": "$X.XX/serving" },
      "dinner": { "name": "string", "prepTime": "X min", "cost": "$X.XX/serving" }
    }
  ],
  "shoppingList": [
    { "item": "string", "quantity": "string", "estimatedCost": "$X.XX", "category": "Produce|Protein|Dairy|Pantry|Frozen" }
  ],
  "weeklyTotal": "$X.XX",
  "savingsTips": ["tip1", "tip2", "tip3"],
  "insight": "2-3 sentence personalized summary about this family's meal plan and budget"
}

Requirements:
- All 7 days (Monday through Sunday)
- Respect ALL dietary restrictions strictly
- Per-serving costs should be realistic for 2026 US grocery prices
- Weekly total must be at or under the $${budget} budget
- Shopping list grouped by category
- Prep times must respect their cooking time preference
- Include 15-20 shopping list items covering all meals
- Meals should be family-friendly and practical, not gourmet
- 3 specific, actionable savings tips`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock) {
      return NextResponse.json({ data: buildFallback() });
    }

    try {
      const data = JSON.parse(textBlock.text) as NourishResponse;
      return NextResponse.json({ data });
    } catch {
      console.error('[API /nourish] Failed to parse Claude response');
      return NextResponse.json({ data: buildFallback() });
    }
  } catch (err) {
    console.error('[API /nourish] Error:', err);
    return NextResponse.json({ data: buildFallback() });
  }
}
