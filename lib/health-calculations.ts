import type { CMSPlanResult } from '@/types';

// --- Input Types ---

export interface UserHealthInputs {
  planMembers: 'just_me' | 'me_spouse' | 'me_kids' | 'whole_family';
  prescriptions: 'none' | 'generic' | 'brand';
  specialistVisits: 'none' | '1_3' | '4_8' | '8_plus';
  plannedProcedures: 'none' | 'pregnancy' | 'surgery' | 'dental';
  cashFlowComfort: 'comfortable' | 'tight' | 'no';
  employerHsa: 'yes' | 'no' | 'not_sure';
  incomeBracket: '30k_under' | '31_60k' | '61_100k' | '101k_plus';
}

// --- Output Types ---

export interface PlanComparison {
  plan: CMSPlanResult;
  annualPremium: number;
  healthyYearCost: number;
  expectedYearCost: number;
  roughYearCost: number;
  estimatedOop: number;
  isWinner: boolean;
}

export interface HSAAnalysis {
  eligible: boolean;
  maxContribution: number;
  taxRate: number;
  annualTaxSavings: number;
  netExpectedCostAfterHsa: number;
}

export interface FSAAnalysis {
  limit: number;
  recommendedContribution: number;
  taxRate: number;
  annualTaxSavings: number;
}

export interface RecommendationResult {
  winner: PlanComparison;
  runnerUp: PlanComparison | null;
  marginOfSavings: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  keyFactors: string[];
  breakEvenNote: string;
  cashFlowWarning: string | null;
  hsaOpportunity: string | null;
}

export interface HealthCostResult {
  planComparisons: PlanComparison[];
  recommendation: RecommendationResult;
  hsaAnalysis: HSAAnalysis;
  fsaAnalysis: FSAAnalysis;
}

// --- Constants ---

const VISIT_COST_SICK = 150;
const VISIT_COST_SPECIALIST = 250;
const RX_COST_GENERIC_MONTHLY = 15;
const RX_COST_BRAND_MONTHLY = 80;
const PROCEDURE_COST_PREGNANCY = 10000;
const PROCEDURE_COST_SURGERY = 15000;
const PROCEDURE_COST_DENTAL = 3000;

const HSA_MAX_INDIVIDUAL_2025 = 4300;
const HSA_MAX_FAMILY_2025 = 8550;
const FSA_LIMIT_2025 = 3300;

const TAX_RATES: Record<string, number> = {
  '30k_under': 0.12,
  '31_60k': 0.22,
  '61_100k': 0.24,
  '101k_plus': 0.32,
};

// --- Defensive Defaults ---

function withDefaults(inputs: Partial<UserHealthInputs>): UserHealthInputs {
  return {
    planMembers: inputs.planMembers || 'whole_family',
    prescriptions: inputs.prescriptions || 'none',
    specialistVisits: inputs.specialistVisits || '1_3',
    plannedProcedures: inputs.plannedProcedures || 'none',
    cashFlowComfort: inputs.cashFlowComfort || 'tight',
    employerHsa: inputs.employerHsa || 'not_sure',
    incomeBracket: inputs.incomeBracket || '31_60k',
  };
}

// --- Utilization Estimation ---

function estimateSickVisits(inputs: UserHealthInputs): number {
  switch (inputs.specialistVisits) {
    case 'none': return 2;
    case '1_3': return 4;
    case '4_8': return 6;
    case '8_plus': return 10;
    default: return 4;
  }
}

function estimateSpecialistVisits(inputs: UserHealthInputs): number {
  switch (inputs.specialistVisits) {
    case 'none': return 0;
    case '1_3': return 2;
    case '4_8': return 6;
    case '8_plus': return 10;
    default: return 2;
  }
}

function estimateAnnualRxCost(inputs: UserHealthInputs): number {
  switch (inputs.prescriptions) {
    case 'none': return 0;
    case 'generic': return RX_COST_GENERIC_MONTHLY * 12;
    case 'brand': return RX_COST_BRAND_MONTHLY * 12;
    default: return 0;
  }
}

function estimateProcedureCost(inputs: UserHealthInputs): number {
  switch (inputs.plannedProcedures) {
    case 'none': return 0;
    case 'pregnancy': return PROCEDURE_COST_PREGNANCY;
    case 'surgery': return PROCEDURE_COST_SURGERY;
    case 'dental': return PROCEDURE_COST_DENTAL;
    default: return 0;
  }
}

function isFamily(inputs: UserHealthInputs): boolean {
  return inputs.planMembers === 'me_spouse' || inputs.planMembers === 'me_kids' || inputs.planMembers === 'whole_family';
}

// --- Core Calculation ---

function calculatePlanCosts(plan: CMSPlanResult, inputs: UserHealthInputs): PlanComparison {
  // Use subsidized premium — only fall back to full premium if subsidized is null/undefined, NOT if it's 0
  const monthlyPremium = plan.monthlyWithSubsidy != null ? plan.monthlyWithSubsidy : plan.monthlyPremium;
  const annualPremium = monthlyPremium * 12;
  const deductible = plan.annualDeductible || 0;
  const oopMax = plan.annualMoop || 0;

  // Healthy year: only preventive (covered at $0), just pay premium
  const healthyYearCost = annualPremium;

  // Estimated OOP from utilization
  const sickVisitCost = estimateSickVisits(inputs) * VISIT_COST_SICK;
  const specialistCost = estimateSpecialistVisits(inputs) * VISIT_COST_SPECIALIST;
  const rxCost = estimateAnnualRxCost(inputs);
  const procedureCost = estimateProcedureCost(inputs);
  const totalMedicalSpend = sickVisitCost + specialistCost + rxCost + procedureCost;

  // Calculate OOP: pay deductible first, then coinsurance on remainder
  let estimatedOop: number;
  if (totalMedicalSpend <= deductible) {
    // All spend is under deductible — you pay it all
    estimatedOop = totalMedicalSpend;
  } else {
    // Deductible met, then ~20% coinsurance on remainder
    const afterDeductible = totalMedicalSpend - deductible;
    const coinsurancePortion = afterDeductible * 0.2;
    estimatedOop = Math.min(deductible + coinsurancePortion, oopMax);
  }

  const expectedYearCost = annualPremium + estimatedOop;
  const roughYearCost = annualPremium + oopMax;

  return {
    plan,
    annualPremium,
    healthyYearCost,
    expectedYearCost,
    roughYearCost,
    estimatedOop,
    isWinner: false,
  };
}

// --- Main Entry Point ---

export function calculateHealthCosts(
  plans: CMSPlanResult[],
  rawInputs: UserHealthInputs,
): HealthCostResult {
  const inputs = withDefaults(rawInputs);

  console.log('[HealthCalc] Entry — plans:', plans.length, 'inputs:', JSON.stringify(inputs));

  if (plans.length === 0) {
    console.log('[HealthCalc] No plans provided — returning empty result');
    const empty: PlanComparison = {
      plan: { id: '', name: 'No plans available', issuer: '', metalLevel: '', type: '', monthlyPremium: 0, monthlyWithSubsidy: 0, annualDeductible: 0, annualMoop: 0, benefitsUrl: '', subsidyAmount: 0 },
      annualPremium: 0, healthyYearCost: 0, expectedYearCost: 0, roughYearCost: 0, estimatedOop: 0, isWinner: true,
    };
    return {
      planComparisons: [empty],
      recommendation: { winner: empty, runnerUp: null, marginOfSavings: 0, confidenceLevel: 'low', keyFactors: ['No plans available for comparison'], breakEvenNote: '', cashFlowWarning: null, hsaOpportunity: null },
      hsaAnalysis: { eligible: false, maxContribution: 0, taxRate: 0, annualTaxSavings: 0, netExpectedCostAfterHsa: 0 },
      fsaAnalysis: { limit: FSA_LIMIT_2025, recommendedContribution: 0, taxRate: 0, annualTaxSavings: 0 },
    };
  }

  // Log first plan data to diagnose $0 issues
  console.log('[HealthCalc] First plan:', JSON.stringify({
    name: plans[0].name,
    monthlyPremium: plans[0].monthlyPremium,
    monthlyWithSubsidy: plans[0].monthlyWithSubsidy,
    annualDeductible: plans[0].annualDeductible,
    annualMoop: plans[0].annualMoop,
  }));

  // Calculate costs for each plan
  const comparisons = plans.map((plan) => calculatePlanCosts(plan, inputs));

  // Sort by expected year cost
  comparisons.sort((a, b) => a.expectedYearCost - b.expectedYearCost);

  const winner = comparisons[0];
  winner.isWinner = true;
  const runnerUp = comparisons.length > 1 ? comparisons[1] : null;

  const marginOfSavings = runnerUp
    ? runnerUp.expectedYearCost - winner.expectedYearCost
    : 0;

  // HSA Analysis
  const taxRate = TAX_RATES[inputs.incomeBracket] || 0.22;
  const hsaMax = isFamily(inputs) ? HSA_MAX_FAMILY_2025 : HSA_MAX_INDIVIDUAL_2025;
  const hsaEligible = inputs.employerHsa === 'yes';
  const hsaTaxSavings = hsaEligible ? Math.round(hsaMax * taxRate) : 0;

  const hsaAnalysis: HSAAnalysis = {
    eligible: hsaEligible,
    maxContribution: hsaMax,
    taxRate,
    annualTaxSavings: hsaTaxSavings,
    netExpectedCostAfterHsa: winner.expectedYearCost - hsaTaxSavings,
  };

  // FSA Analysis
  const fsaRecommended = Math.min(
    Math.round(winner.estimatedOop * 0.85),
    FSA_LIMIT_2025,
  );
  const fsaTaxSavings = Math.round(fsaRecommended * taxRate);

  const fsaAnalysis: FSAAnalysis = {
    limit: FSA_LIMIT_2025,
    recommendedContribution: fsaRecommended,
    taxRate,
    annualTaxSavings: fsaTaxSavings,
  };

  // Key factors
  const keyFactors: string[] = [];
  if (inputs.plannedProcedures !== 'none') {
    keyFactors.push(`Planned ${inputs.plannedProcedures} factored into cost estimates`);
  }
  if (inputs.prescriptions === 'brand') {
    keyFactors.push('Brand-name prescriptions significantly impact annual costs');
  }
  if (hsaEligible) {
    keyFactors.push(`HSA tax savings of $${hsaTaxSavings}/year reduce effective cost`);
  }
  if (marginOfSavings > 500) {
    keyFactors.push(`Clear winner by $${Math.round(marginOfSavings)}/year`);
  } else if (marginOfSavings > 0) {
    keyFactors.push('Top plans are close in cost \u2014 other factors may matter more');
  }

  // Confidence level
  let confidenceLevel: 'high' | 'medium' | 'low' = 'high';
  if (marginOfSavings < 200) confidenceLevel = 'low';
  else if (marginOfSavings < 600) confidenceLevel = 'medium';

  // Break-even note
  let breakEvenNote = '';
  if (runnerUp && winner.annualPremium !== runnerUp.annualPremium) {
    const premiumDiff = Math.abs(winner.annualPremium - runnerUp.annualPremium);
    const oopDiff = Math.abs(winner.estimatedOop - runnerUp.estimatedOop);
    if (winner.annualPremium < runnerUp.annualPremium) {
      breakEvenNote = `${winner.plan.name} saves you $${Math.round(premiumDiff)} in premiums. You'd need $${Math.round(oopDiff)} more in medical costs for ${runnerUp.plan.name} to break even.`;
    } else {
      breakEvenNote = `${runnerUp.plan.name} has lower premiums by $${Math.round(premiumDiff)}/year, but ${winner.plan.name} saves more overall because of lower out-of-pocket costs for your expected usage.`;
    }
  }

  // Cash flow warning
  let cashFlowWarning: string | null = null;
  if (inputs.cashFlowComfort === 'no' && winner.plan.annualDeductible > 2000) {
    cashFlowWarning = `Your top plan has a $${winner.plan.annualDeductible.toLocaleString()} deductible. Since a $3,000 bill would be difficult, consider whether a higher-premium plan with a lower deductible might give you more peace of mind.`;
  } else if (inputs.cashFlowComfort === 'tight' && winner.plan.annualDeductible > 4000) {
    cashFlowWarning = `This plan's $${winner.plan.annualDeductible.toLocaleString()} deductible is high. You indicated a large unexpected bill would hurt \u2014 make sure you have savings to cover the deductible if needed.`;
  }

  // HSA opportunity
  let hsaOpportunity: string | null = null;
  if (hsaEligible && hsaTaxSavings > 0) {
    hsaOpportunity = `By maxing out your HSA contribution ($${hsaMax.toLocaleString()}/year), you'd save approximately $${hsaTaxSavings.toLocaleString()}/year in taxes. Unlike an FSA, unused HSA funds roll over forever.`;
  }

  const result: HealthCostResult = {
    planComparisons: comparisons,
    recommendation: {
      winner,
      runnerUp,
      marginOfSavings,
      confidenceLevel,
      keyFactors,
      breakEvenNote,
      cashFlowWarning,
      hsaOpportunity,
    },
    hsaAnalysis,
    fsaAnalysis,
  };

  console.log('[HealthCalc] Output — winner:', winner.plan.name,
    'annualPremium:', winner.annualPremium,
    'expectedYear:', winner.expectedYearCost,
    'roughYear:', winner.roughYearCost,
    'estimatedOop:', winner.estimatedOop);

  return result;
}
