import type { PlanComparison, HSAAnalysis, RecommendationResult } from '@/lib/health-calculations';

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

interface Props {
  recommendation: RecommendationResult;
  hsaAnalysis: HSAAnalysis;
}

function Row({ label, val1, val2, highlight, bold }: {
  label: string; val1: string; val2: string; highlight?: boolean; bold?: boolean;
}) {
  return (
    <tr className={highlight ? 'bg-sky-pale/30' : ''}>
      <td className={`px-4 py-2.5 text-sm ${bold ? 'font-semibold text-charcoal' : 'text-mid'}`}>
        {highlight && <span className="mr-1 text-sky">&#10022;</span>}{label}
      </td>
      <td className={`px-4 py-2.5 text-right text-sm ${bold ? 'font-bold text-charcoal' : 'text-charcoal'}`}>
        {val1}
      </td>
      <td className={`px-4 py-2.5 text-right text-sm ${bold ? 'font-bold text-charcoal' : 'text-charcoal'}`}>
        {val2}
      </td>
    </tr>
  );
}

function Divider() {
  return (
    <tr>
      <td colSpan={3} className="px-4 py-1">
        <div className="border-t border-border" />
      </td>
    </tr>
  );
}

export default function PlanComparisonCard({ recommendation, hsaAnalysis }: Props) {
  const { winner, runnerUp, breakEvenNote, cashFlowWarning, hsaOpportunity } = recommendation;

  if (!runnerUp) {
    return (
      <div className="rounded-2xl border-2 border-sky bg-white p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-sky px-3 py-1 text-xs font-bold text-white">Best for your family</span>
        </div>
        <h3 className="mb-1 font-display text-xl font-bold text-charcoal">{winner.plan.name}</h3>
        <p className="mb-4 text-xs text-mid">{winner.plan.issuer}</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Annual Premium" value={fmt(winner.annualPremium)} />
          <Stat label="Expected Year Cost" value={fmt(winner.expectedYearCost)} highlight />
          <Stat label="Healthy Year" value={fmt(winner.healthyYearCost)} />
          <Stat label="Rough Year" value={fmt(winner.roughYearCost)} />
        </div>
      </div>
    );
  }

  const plans: [PlanComparison, PlanComparison] = [winner, runnerUp];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-cream">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-mid" />
                <th className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="rounded-full bg-sky px-2 py-0.5 text-[10px] font-bold text-white">Best fit</span>
                    <span className="text-xs font-semibold text-charcoal">{plans[0].plan.name}</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-charcoal">
                  {plans[1].plan.name}
                </th>
              </tr>
            </thead>
            <tbody>
              <Row
                label="Monthly Premium"
                val1={plans[0].plan.monthlyWithSubsidy === 0 ? '$0 (fully subsidized)' : fmt(plans[0].plan.monthlyWithSubsidy)}
                val2={plans[1].plan.monthlyWithSubsidy === 0 ? '$0 (fully subsidized)' : fmt(plans[1].plan.monthlyWithSubsidy)}
              />
              <Row
                label="Annual Premium"
                val1={plans[0].annualPremium === 0 ? '$0 (fully subsidized)' : fmt(plans[0].annualPremium)}
                val2={plans[1].annualPremium === 0 ? '$0 (fully subsidized)' : fmt(plans[1].annualPremium)}
              />
              <Row label="Deductible" val1={fmt(plans[0].plan.annualDeductible)} val2={fmt(plans[1].plan.annualDeductible)} />
              <Row label="Out-of-Pocket Max" val1={fmt(plans[0].plan.annualMoop)} val2={fmt(plans[1].plan.annualMoop)} />
              <Divider />
              <Row label="Healthy Year Total" val1={fmt(plans[0].healthyYearCost)} val2={fmt(plans[1].healthyYearCost)} highlight bold />
              <Row label="Expected Year Total" val1={fmt(plans[0].expectedYearCost)} val2={fmt(plans[1].expectedYearCost)} highlight bold />
              <Row label="Rough Year Total" val1={fmt(plans[0].roughYearCost)} val2={fmt(plans[1].roughYearCost)} highlight bold />
              {hsaAnalysis.eligible && (
                <>
                  <Divider />
                  <Row label="HSA Tax Savings" val1={fmt(hsaAnalysis.annualTaxSavings)} val2="N/A" />
                  <Row label="Net Expected After HSA" val1={fmt(hsaAnalysis.netExpectedCostAfterHsa)} val2={fmt(plans[1].expectedYearCost)} bold />
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes below the table */}
      <div className="space-y-3">
        {breakEvenNote && (
          <div className="rounded-xl border border-border bg-white p-4">
            <p className="text-xs font-semibold text-charcoal">Your break-even point</p>
            <p className="mt-1 text-xs leading-relaxed text-mid">{breakEvenNote}</p>
          </div>
        )}

        {cashFlowWarning && (
          <div className="rounded-xl border border-gold/40 bg-gold-pale p-4">
            <p className="text-xs font-semibold text-gold-dark">Cash flow note</p>
            <p className="mt-1 text-xs leading-relaxed text-charcoal">{cashFlowWarning}</p>
          </div>
        )}

        {hsaOpportunity && (
          <div className="rounded-xl border border-sage-light/40 bg-sage-pale p-4">
            <p className="text-xs font-semibold text-sage">HSA opportunity</p>
            <p className="mt-1 text-xs leading-relaxed text-charcoal">{hsaOpportunity}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-mid">{label}</p>
      <p className={`text-sm font-bold ${highlight ? 'text-sky' : 'text-charcoal'}`}>{value}</p>
    </div>
  );
}
