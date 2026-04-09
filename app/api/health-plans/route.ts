import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getCountyByZip,
  getPlans,
  getSubsidyEstimate,
  buildHouseholdMembers,
} from '@/lib/cms-marketplace';
import type { CMSPlanResult } from '@/types';

const inputSchema = z.object({
  zip: z.string().regex(/^\d{5}$/),
  income: z.number().min(0),
  householdSize: z.number().min(1).max(10),
});

function householdSizeToNumber(size: string): number {
  switch (size) {
    case 'just_me': return 1;
    case 'me_partner': return 2;
    case 'family_3_4': return 4;
    case 'family_5_plus': return 6;
    default: return parseInt(size, 10) || 4;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Accept either numeric householdSize or string from quiz
    const normalized = {
      ...body,
      householdSize: typeof body.householdSize === 'string'
        ? householdSizeToNumber(body.householdSize)
        : body.householdSize,
    };
    const parsed = inputSchema.safeParse(normalized);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { zip, income, householdSize } = parsed.data;

    if (!process.env.CMS_MARKETPLACE_API_KEY) {
      console.log('[CMS] No API key set — skipping real plan lookup');
      return NextResponse.json({ data: [] });
    }

    // 1. Get county/state from ZIP
    const county = await getCountyByZip(zip);
    if (!county) {
      return NextResponse.json({ data: [] });
    }

    const members = buildHouseholdMembers(householdSize);
    const year = new Date().getFullYear();

    // 2. Fetch plans and subsidy in parallel
    const [plans, subsidy] = await Promise.all([
      getPlans({ zip, fips: county.fips, state: county.state, income, people: members, year }),
      getSubsidyEstimate({ zip, fips: county.fips, state: county.state, income, people: members }),
    ]);

    const aptc = subsidy?.aptc || 0;

    // Log raw structure of first plan for debugging deductible/moop field names
    if (plans.length > 0) {
      const sample = plans[0];
      console.log('[CMS] Raw plan sample — deductibles:', JSON.stringify(sample.deductibles?.slice(0, 3)));
      console.log('[CMS] Raw plan sample — moops:', JSON.stringify(sample.moops?.slice(0, 3)));
      console.log('[CMS] Raw plan sample — premium:', sample.premium, 'premium_w_credit:', sample.premium_w_credit);
    }

    // 3. Map to simplified results, sort by subsidized premium
    const results: CMSPlanResult[] = plans
      .slice(0, 20)
      .map((plan) => {
        // Extract deductible — try specific match first, then fall back to first entry
        const deductibleMatch = plan.deductibles?.find(
          (d) => d.type === 'Medical EHB Deductible' && d.family_cost === 'Individual',
        );
        const deductibleFallback = plan.deductibles?.[0];
        const annualDeductible = deductibleMatch?.amount
          ?? (deductibleFallback as Record<string, number | string>)?.['individual']
          ?? deductibleFallback?.amount
          ?? 0;

        // Extract OOP max — try specific match first, then fall back to first entry
        const moopMatch = plan.moops?.find(
          (m) => m.type === 'Maximum Out of Pocket for Medical EHB Benefits' && m.family_cost === 'Individual',
        );
        const moopFallback = plan.moops?.[0];
        const annualMoop = moopMatch?.amount
          ?? (moopFallback as Record<string, number | string>)?.['individual']
          ?? moopFallback?.amount
          ?? 0;

        return {
          id: plan.id,
          name: plan.name,
          issuer: plan.issuer?.name || '',
          metalLevel: plan.metal_level || '',
          type: plan.type || '',
          monthlyPremium: plan.premium || 0,
          monthlyWithSubsidy: plan.premium_w_credit ?? Math.max(0, (plan.premium || 0) - aptc),
          annualDeductible: typeof annualDeductible === 'number' ? annualDeductible : 0,
          annualMoop: typeof annualMoop === 'number' ? annualMoop : 0,
          benefitsUrl: plan.benefits_url || '',
          subsidyAmount: aptc,
        };
      })
      .sort((a, b) => a.monthlyWithSubsidy - b.monthlyWithSubsidy)
      .slice(0, 5);

    // Log mapped result for first plan
    if (results.length > 0) {
      console.log('[CMS] Mapped first plan:', JSON.stringify({
        name: results[0].name,
        monthlyPremium: results[0].monthlyPremium,
        monthlyWithSubsidy: results[0].monthlyWithSubsidy,
        annualDeductible: results[0].annualDeductible,
        annualMoop: results[0].annualMoop,
      }));
    }

    return NextResponse.json({ data: results });
  } catch (err) {
    console.error('[API /health-plans] Error:', err);
    return NextResponse.json({ data: [] });
  }
}
