import type { HealthProfile, PlanRecommendation } from '@/types';

// 2025 Federal Poverty Level thresholds (annual)
const FPL: Record<number, number> = {
  1: 15060,
  2: 20440,
  3: 25820,
  4: 31200,
  5: 36580,
  6: 41960,
};

function getFPL(householdSize: string): number {
  switch (householdSize) {
    case 'just_me': return FPL[1];
    case 'me_partner': return FPL[2];
    case 'family_3_4': return FPL[4];
    case 'family_5_plus': return FPL[6];
    default: return FPL[4];
  }
}

function getHouseholdNumber(householdSize: string): number {
  switch (householdSize) {
    case 'just_me': return 1;
    case 'me_partner': return 2;
    case 'family_3_4': return 4;
    case 'family_5_plus': return 6;
    default: return 4;
  }
}

function isSubsidyEligible(income: number, householdSize: string): boolean {
  const fpl = getFPL(householdSize);
  // ACA subsidy eligible up to 400% FPL (expanded through ARP/IRA)
  return income <= fpl * 4;
}

function estimateMonthlySubsidy(income: number, householdSize: string): number {
  const fpl = getFPL(householdSize);
  const fplPercent = (income / fpl) * 100;
  const members = getHouseholdNumber(householdSize);

  if (fplPercent <= 150) return members * 250;
  if (fplPercent <= 200) return members * 180;
  if (fplPercent <= 250) return members * 120;
  if (fplPercent <= 300) return members * 70;
  if (fplPercent <= 400) return members * 30;
  return 0;
}

export function generateRecommendations(profile: HealthProfile): PlanRecommendation[] {
  const plans: PlanRecommendation[] = [];

  // Medicaid eligible
  if (profile.employerCoverage === 'medicaid') {
    plans.push({
      rank: 'best',
      rankLabel: 'Best Fit',
      name: 'Medicaid / CHIP',
      why: 'Based on your household income and family size, you likely qualify for Medicaid or CHIP. These programs provide comprehensive coverage with minimal or no premiums and very low out-of-pocket costs.',
      pros: [
        'Little to no monthly premium',
        'Very low copays and no deductible in most states',
        'Comprehensive coverage including dental and vision for children',
      ],
      watchOut: [
        'Provider network may be more limited than private insurance',
        'Coverage must be renewed annually — watch for re-enrollment deadlines',
      ],
    });
    return plans;
  }

  // Good employer coverage
  if (profile.employerCoverage === 'good') {
    plans.push({
      rank: 'best',
      rankLabel: 'Best Fit',
      name: 'Employer-Sponsored Plan',
      why: 'Your employer offers solid coverage. Employer plans typically come with pre-tax premiums and employer contributions that are hard to beat on the open market.',
      pros: [
        'Employer pays a significant share of your premium',
        'Pre-tax premium deductions lower your taxable income',
        'No underwriting — guaranteed coverage for you and dependents',
      ],
      watchOut: [
        'Compare plan tiers carefully — the cheapest premium may cost more in copays',
        'Check that your preferred doctors are in-network before enrolling',
      ],
    });

    if (profile.priority === 'want_hsa' || profile.riskTolerance === 'high') {
      plans.push({
        rank: 'strong',
        rankLabel: 'Strong Option',
        name: 'HDHP + HSA (via Employer)',
        why: 'A high-deductible plan paired with a Health Savings Account gives you tax-free savings for medical expenses. Great if you\'re generally healthy and want to build a healthcare nest egg.',
        pros: [
          'Triple tax advantage: tax-deductible contributions, tax-free growth, tax-free withdrawals',
          'Lower monthly premiums than traditional plans',
          'HSA funds roll over year to year — no "use it or lose it"',
        ],
        watchOut: [
          'Higher deductible means more out-of-pocket before insurance kicks in',
          'Can be risky if you have frequent medical needs or young children',
        ],
      });
    }
    return plans;
  }

  // No employer coverage
  if (profile.employerCoverage === 'none') {
    const eligible = isSubsidyEligible(profile.income, profile.householdSize);
    const monthlySubsidy = estimateMonthlySubsidy(profile.income, profile.householdSize);

    if (eligible && monthlySubsidy > 0) {
      plans.push({
        rank: 'best',
        rankLabel: 'Best Fit',
        name: 'ACA Marketplace + Premium Subsidy',
        why: `Based on your income, you likely qualify for an estimated $${monthlySubsidy}/month in premium subsidies through the ACA Marketplace. This can make a Silver or Gold plan surprisingly affordable.`,
        pros: [
          `Estimated subsidy: ~$${monthlySubsidy}/month to lower your premium`,
          'Silver plans include extra cost-sharing reductions if income is under 250% FPL',
          'Guaranteed coverage regardless of pre-existing conditions',
        ],
        watchOut: [
          'Open enrollment is typically Nov 1 – Jan 15 (special enrollment with qualifying event)',
          'Subsidy amount is estimated — actual amount determined at enrollment',
        ],
      });
    } else {
      plans.push({
        rank: 'best',
        rankLabel: 'Best Fit',
        name: 'ACA Marketplace Plan',
        why: 'Without employer coverage, the ACA Marketplace is your best path to comprehensive insurance. Even without subsidies, you get guaranteed issue and standardized benefits.',
        pros: [
          'Guaranteed coverage — no denial for pre-existing conditions',
          'Standardized benefits (Essential Health Benefits) across all plans',
          'Multiple plan tiers (Bronze/Silver/Gold/Platinum) to match your needs',
        ],
        watchOut: [
          'Without subsidies, premiums can be significant',
          'Narrow networks — always verify your providers before enrolling',
        ],
      });
    }

    if (profile.healthUsage === 'minimal' && profile.riskTolerance !== 'low') {
      plans.push({
        rank: 'strong',
        rankLabel: 'Strong Option',
        name: 'HDHP + HSA (Marketplace)',
        why: 'Since you use healthcare minimally, a high-deductible plan with an HSA lets you save on premiums and build tax-advantaged savings for future medical needs.',
        pros: [
          'Lowest monthly premium option on the Marketplace',
          'HSA contributions are tax-deductible even without employer involvement',
          'HSA funds grow tax-free and carry over indefinitely',
        ],
        watchOut: [
          'High deductible (minimum $1,650 individual / $3,300 family in 2025)',
          'Not ideal if you anticipate medical needs this year',
        ],
      });
    }

    plans.push({
      rank: 'consider',
      rankLabel: 'Also Consider',
      name: eligible ? 'Silver / Gold ACA Plan' : 'Bronze ACA Plan',
      why: eligible
        ? 'If you prefer lower out-of-pocket costs and more predictable expenses, a Gold plan trades higher premiums for lower copays and deductibles.'
        : 'A Bronze plan offers the lowest premiums. Good as a safety net if you rarely use healthcare but want catastrophic protection.',
      pros: eligible
        ? [
            'Lower deductibles and copays than Silver or Bronze',
            'More predictable costs for doctor visits and prescriptions',
            'Better for families with moderate to frequent healthcare needs',
          ]
        : [
            'Lowest premium option available',
            'Still covers Essential Health Benefits',
            'Free preventive care visits included',
          ],
      watchOut: eligible
        ? [
            'Higher monthly premium than Bronze or Silver plans',
            'May not be worth it if you rarely use healthcare',
          ]
        : [
            'High deductible — you pay most costs out of pocket until deductible is met',
            'Can result in big bills from unexpected medical events',
          ],
    });

    return plans;
  }

  // Poor employer coverage
  if (profile.employerCoverage === 'poor') {
    plans.push({
      rank: 'best',
      rankLabel: 'Best Fit',
      name: 'Compare: Marketplace vs. Employer Plan',
      why: 'Your employer plan covers less than 70% of costs. Under the ACA\'s "affordability test," you may qualify for Marketplace subsidies if your employer plan is considered unaffordable (premium exceeds ~8.4% of household income).',
      pros: [
        'May unlock Marketplace subsidies if employer plan fails affordability test',
        'Marketplace plans may offer better coverage at similar or lower cost',
        'Worth running the numbers at Healthcare.gov to compare',
      ],
      watchOut: [
        'If your employer plan is deemed "affordable," you won\'t qualify for subsidies',
        'Switching mid-year requires a qualifying life event',
      ],
    });

    plans.push({
      rank: 'strong',
      rankLabel: 'Strong Option',
      name: 'HDHP + HSA',
      why: 'Whether through your employer or the Marketplace, an HDHP with HSA lets you take advantage of tax savings while keeping premiums low.',
      pros: [
        'Tax-advantaged savings for medical expenses',
        'Lower premiums free up cash flow',
        'HSA funds never expire and are portable',
      ],
      watchOut: [
        'High deductible means significant out-of-pocket exposure',
        'Risky for families with unpredictable medical needs',
      ],
    });

    return plans;
  }

  return plans;
}
