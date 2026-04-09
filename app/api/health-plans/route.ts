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

    // Log full raw structure of first plan for debugging
    if (plans.length > 0) {
      const sample = plans[0];
      console.log('[CMS] Raw plan sample — FULL:', JSON.stringify({
        name: sample.name,
        premium: sample.premium,
        premium_w_credit: sample.premium_w_credit,
        deductibles: sample.deductibles,
        moops: sample.moops,
      }));
    }

    // 3. Map to simplified results, sort by subsidized premium
    const results: CMSPlanResult[] = plans
      .slice(0, 20)
      .map((plan) => {
        // Extract deductible — exhaustive search across all possible field shapes
        let annualDeductible = 0;
        if (plan.deductibles && plan.deductibles.length > 0) {
          // Try specific Individual match first
          const individual = plan.deductibles.find(
            (d) => d.family_cost === 'Individual' || (d as Record<string, unknown>).network_tier === 'In-Network',
          );
          const entry = individual || plan.deductibles[0];
          annualDeductible = entry.amount ?? entry.individual ?? 0;
          if (typeof annualDeductible !== 'number') annualDeductible = 0;
        }
        // Fallback: parse deductible from plan name (e.g. "Bronze 6000", "Silver 4000 HSA")
        if (annualDeductible === 0 && plan.name) {
          const nameMatch = plan.name.match(/(\d[,\d]+)(?:\s+HSA)?/);
          if (nameMatch) {
            const parsed = parseInt(nameMatch[1].replace(/,/g, ''), 10);
            if (parsed >= 500 && parsed <= 20000) annualDeductible = parsed;
          }
        }

        // Extract OOP max — same exhaustive approach
        let annualMoop = 0;
        if (plan.moops && plan.moops.length > 0) {
          const individual = plan.moops.find(
            (m) => m.family_cost === 'Individual' || (m as Record<string, unknown>).network_tier === 'In-Network',
          );
          const entry = individual || plan.moops[0];
          annualMoop = entry.amount ?? entry.individual ?? 0;
          if (typeof annualMoop !== 'number') annualMoop = 0;
        }
        // OOP max fallback: typically 2-3x deductible for standard plans
        if (annualMoop === 0 && annualDeductible > 0) {
          annualMoop = Math.min(annualDeductible * 2, 9200); // 2025 federal max is $9,200 individual
        }

        const monthlyWithSubsidy = plan.premium_w_credit ?? Math.max(0, (plan.premium || 0) - aptc);

        console.log('[CMS] Plan extraction:', plan.name,
          '| deductible:', annualDeductible,
          '| moop:', annualMoop,
          '| premium:', plan.premium,
          '| w_credit:', monthlyWithSubsidy);

        return {
          id: plan.id,
          name: plan.name,
          issuer: plan.issuer?.name || '',
          metalLevel: plan.metal_level || '',
          type: plan.type || '',
          monthlyPremium: plan.premium || 0,
          monthlyWithSubsidy,
          annualDeductible,
          annualMoop,
          benefitsUrl: plan.benefits_url || '',
          subsidyAmount: aptc,
        };
      })
      .sort((a, b) => a.monthlyWithSubsidy - b.monthlyWithSubsidy)
      .slice(0, 5);

    return NextResponse.json({ data: results });
  } catch (err) {
    console.error('[API /health-plans] Error:', err);
    return NextResponse.json({ data: [] });
  }
}
