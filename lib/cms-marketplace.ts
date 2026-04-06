const CMS_API_KEY = process.env.CMS_MARKETPLACE_API_KEY || '';
const BASE_URL = 'https://marketplace.api.healthcare.gov/api/v1';

export interface HouseholdMember {
  age: number;
  aptc_eligible: boolean;
  does_not_cohabitate: boolean;
  gender: 'Male' | 'Female';
  has_mec: boolean;
  is_pregnant: boolean;
  is_self: boolean;
  relationship: string;
  uses_tobacco: boolean;
}

export interface CMSPlan {
  id: string;
  name: string;
  issuer: { name: string };
  metal_level: string;
  type: string;
  premium: number;
  premium_w_credit: number;
  ehb_premium: number;
  deductibles: Array<{ amount: number; type: string; family_cost: string }>;
  moops: Array<{ amount: number; type: string; family_cost: string }>;
  benefits_url: string;
  brochure_url: string;
}

interface CountyResult {
  fips: string;
  state: string;
}

export async function getCountyByZip(zip: string): Promise<CountyResult | null> {
  if (!CMS_API_KEY) return null;

  try {
    const res = await fetch(`${BASE_URL}/counties/by/zip/${zip}?apikey=${CMS_API_KEY}`);
    const data = await res.json();

    if (!res.ok) {
      console.error('[CMS] County lookup failed:', res.status, JSON.stringify(data));
      return null;
    }

    const county = data.counties?.[0];
    if (!county) return null;

    return { fips: county.fips, state: county.state };
  } catch (err) {
    console.error('[CMS] County lookup error:', err);
    return null;
  }
}

export async function getPlans(params: {
  zip: string;
  fips: string;
  state: string;
  income: number;
  people: HouseholdMember[];
  year: number;
}): Promise<CMSPlan[]> {
  if (!CMS_API_KEY) return [];

  try {
    const res = await fetch(`${BASE_URL}/plans/search?apikey=${CMS_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        household: {
          income: params.income,
          people: params.people,
        },
        market: 'Individual',
        place: {
          countyfips: params.fips,
          state: params.state,
          zipcode: params.zip,
        },
        year: params.year,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[CMS] Plan search failed:', res.status, JSON.stringify(data));
      return [];
    }

    return data.plans || [];
  } catch (err) {
    console.error('[CMS] Plan search error:', err);
    return [];
  }
}

export async function getSubsidyEstimate(params: {
  zip: string;
  fips: string;
  state: string;
  income: number;
  people: HouseholdMember[];
}): Promise<{ aptc: number; csr: string } | null> {
  if (!CMS_API_KEY) return null;

  try {
    const res = await fetch(
      `${BASE_URL}/households/eligibility/estimates?apikey=${CMS_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          household: {
            income: params.income,
            people: params.people,
          },
          market: 'Individual',
          place: {
            countyfips: params.fips,
            state: params.state,
            zipcode: params.zip,
          },
          year: new Date().getFullYear(),
        }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      console.error('[CMS] Subsidy estimate failed:', res.status, JSON.stringify(data));
      return null;
    }

    return {
      aptc: data.estimates?.[0]?.aptc || 0,
      csr: data.estimates?.[0]?.csr || '',
    };
  } catch (err) {
    console.error('[CMS] Subsidy estimate error:', err);
    return null;
  }
}

export function buildHouseholdMembers(householdSize: number): HouseholdMember[] {
  const members: HouseholdMember[] = [
    {
      age: 35,
      aptc_eligible: true,
      does_not_cohabitate: false,
      gender: 'Female',
      has_mec: false,
      is_pregnant: false,
      is_self: true,
      relationship: 'Self',
      uses_tobacco: false,
    },
  ];

  if (householdSize >= 2) {
    members.push({
      age: 35,
      aptc_eligible: true,
      does_not_cohabitate: false,
      gender: 'Male',
      has_mec: false,
      is_pregnant: false,
      is_self: false,
      relationship: 'Spouse',
      uses_tobacco: false,
    });
  }

  for (let i = 2; i < householdSize; i++) {
    members.push({
      age: 8,
      aptc_eligible: true,
      does_not_cohabitate: false,
      gender: i % 2 === 0 ? 'Female' : 'Male',
      has_mec: false,
      is_pregnant: false,
      is_self: false,
      relationship: 'Child',
      uses_tobacco: false,
    });
  }

  return members;
}
