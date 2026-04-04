'use client';

import { useState, useCallback } from 'react';
import { TOOLS } from '@/config/platform';
import QuizShell from '@/components/QuizShell';
import EmailCapture from '@/components/EmailCapture';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import PlanCard from '@/components/PlanCard';
import AIInsightBlock from '@/components/AIInsightBlock';
import CrossToolFooter from '@/components/CrossToolFooter';
import { generateRecommendations } from '@/lib/healthguide-logic';
import type { PlanRecommendation, HealthProfile } from '@/types';
import type { QuizQuestion } from '@/types';

const tool = TOOLS.health;

const questions: QuizQuestion[] = [
  {
    id: 'householdSize',
    type: 'single',
    label: 'What\u2019s your household size?',
    autoAdvance: true,
    options: [
      { value: 'just_me', label: 'Just me' },
      { value: 'me_partner', label: 'Me + partner' },
      { value: 'family_3_4', label: 'Family of 3\u20134' },
      { value: 'family_5_plus', label: 'Family of 5+' },
    ],
  },
  {
    id: 'income',
    type: 'slider',
    label: 'What\u2019s your annual household income?',
    helpText: 'This helps us estimate subsidy eligibility.',
    min: 20000,
    max: 250000,
    step: 5000,
    prefix: '$',
  },
  {
    id: 'employerCoverage',
    type: 'single',
    label: 'Do you have employer-sponsored coverage?',
    autoAdvance: true,
    options: [
      { value: 'good', label: 'Yes \u2014 good coverage (70%+)' },
      { value: 'poor', label: 'Yes \u2014 but poor coverage (<70%)' },
      { value: 'none', label: 'No employer coverage' },
      { value: 'medicaid', label: 'Currently on Medicaid' },
    ],
  },
  {
    id: 'healthUsage',
    type: 'single',
    label: 'How often does your family use healthcare?',
    autoAdvance: true,
    options: [
      { value: 'minimal', label: 'Minimal \u2014 yearly checkup only' },
      { value: 'moderate', label: 'Moderate \u2014 a few visits per year' },
      { value: 'frequent', label: 'Frequent \u2014 ongoing care or prescriptions' },
      { value: 'unpredictable', label: 'Unpredictable \u2014 young kids, expect surprises' },
    ],
  },
  {
    id: 'priority',
    type: 'single',
    label: 'What matters most to you in a plan?',
    autoAdvance: true,
    options: [
      { value: 'lowest_premium', label: 'Lowest monthly premium' },
      { value: 'low_oop', label: 'Low out-of-pocket costs' },
      { value: 'balance', label: 'Balance of both' },
      { value: 'want_hsa', label: 'I want an HSA' },
    ],
  },
  {
    id: 'doctorImportance',
    type: 'single',
    label: 'How important is keeping your current doctor?',
    autoAdvance: true,
    options: [
      { value: 'essential', label: 'Essential \u2014 won\u2019t switch' },
      { value: 'preferred', label: 'Preferred but flexible' },
      { value: 'open', label: 'Open to switching' },
    ],
  },
  {
    id: 'riskTolerance',
    type: 'single',
    label: 'How much financial risk are you comfortable with?',
    helpText: 'Higher risk = lower premiums but higher potential out-of-pocket costs.',
    autoAdvance: true,
    options: [
      { value: 'low', label: 'Low \u2014 I want predictability' },
      { value: 'medium', label: 'Medium \u2014 some risk is fine' },
      { value: 'high', label: 'High \u2014 I\u2019ll gamble on lower premiums' },
    ],
  },
];

const KEY_TERMS = [
  { term: 'Deductible', definition: 'The amount you pay out-of-pocket before your insurance starts covering costs.' },
  { term: 'OOP Max', definition: 'The most you\'ll pay in a year. After this, your plan covers 100% of covered services.' },
  { term: 'Premium', definition: 'Your monthly payment to keep your insurance active, regardless of whether you use it.' },
  { term: 'HSA', definition: 'Health Savings Account \u2014 a tax-advantaged savings account for medical expenses, paired with high-deductible plans.' },
  { term: 'ACA Subsidy', definition: 'Government financial help to lower your Marketplace premium, based on income and household size.' },
  { term: 'Copay', definition: 'A fixed amount you pay for a covered service (e.g., $25 for a doctor visit).' },
  { term: 'Network', definition: 'The group of doctors, hospitals, and pharmacies your plan has agreements with for lower rates.' },
];

export default function HealthGuideTool() {
  const [phase, setPhase] = useState<'quiz' | 'loading' | 'email' | 'results'>('quiz');
  const [plans, setPlans] = useState<PlanRecommendation[]>([]);
  const [insight, setInsight] = useState('');
  const [error, setError] = useState(false);

  const handleComplete = useCallback(async (answers: Record<string, string | string[] | number>) => {
    setPhase('loading');
    setError(false);

    try {
      const profile: HealthProfile = {
        householdSize: answers.householdSize as string,
        income: answers.income as number,
        employerCoverage: answers.employerCoverage as string,
        healthUsage: answers.healthUsage as string,
        priority: answers.priority as string,
        doctorImportance: answers.doctorImportance as string,
        riskTolerance: answers.riskTolerance as string,
      };

      const recommendations = generateRecommendations(profile);
      setPlans(recommendations);

      // Fetch AI insight in background
      fetch('/api/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'health', profile: answers }),
      })
        .then((r) => r.json())
        .then((data) => setInsight(data.data?.insight || ''))
        .catch(() => {});

      setPhase('email');
    } catch {
      setError(true);
      setPhase('results');
    }
  }, []);

  if (phase === 'quiz') {
    return (
      <div className="min-h-screen bg-cream">
        <div className="bg-sky-pale px-5 py-8 text-center">
          <span className="text-3xl">{tool.icon}</span>
          <h1 className="mt-2 font-heading text-3xl font-bold text-charcoal">{tool.name}</h1>
          <p className="mt-1 text-sm text-mid">{tool.badge} Navigator</p>
        </div>
        <QuizShell
          toolColor={tool.color}
          questions={questions}
          onComplete={handleComplete}
        />
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-cream">
        <LoadingState message="Building your plan recommendations..." />
      </div>
    );
  }

  if (error || plans.length === 0) {
    return (
      <div className="min-h-screen bg-cream">
        <ErrorState
          message="We couldn't generate your recommendations. Please try again."
          onRetry={() => setPhase('quiz')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {phase === 'email' && (
        <EmailCapture tool={tool} onDismiss={() => setPhase('results')} />
      )}

      <div className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
        <h1 className="mb-2 font-heading text-3xl font-bold text-charcoal sm:text-4xl">
          Your Plan Recommendations
        </h1>
        <p className="mb-8 text-sm text-mid">
          Based on your profile, here are your best options.
        </p>

        {/* AI Insight */}
        {insight && (
          <div className="mb-8">
            <AIInsightBlock insight={insight} color="sky" />
          </div>
        )}

        {/* Plan Cards */}
        <div className="space-y-6">
          {plans.map((plan, i) => (
            <PlanCard key={i} plan={plan} />
          ))}
        </div>

        {/* Key Terms */}
        <section className="mt-12">
          <h2 className="mb-4 font-heading text-xl font-bold text-charcoal">
            Key Terms Glossary
          </h2>
          <div className="space-y-3">
            {KEY_TERMS.map((item) => (
              <div key={item.term} className="rounded-xl border border-border bg-white p-4">
                <p className="text-sm font-semibold text-charcoal">{item.term}</p>
                <p className="mt-1 text-sm text-mid">{item.definition}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Action Strip */}
        <section className="mt-8 rounded-2xl bg-charcoal p-6 sm:p-8">
          <h2 className="mb-4 font-heading text-xl font-bold text-white">
            Ready to take action?
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <a
              href="https://www.healthcare.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-sky px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-sky-light"
            >
              Browse ACA Plans &rarr;
            </a>
            <a
              href="https://www.medicaid.gov/about-us/beneficiary-resources/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/20"
            >
              Check Medicaid Eligibility
            </a>
            <a
              href="https://www.policygenius.com" // TODO: replace with affiliate URL
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/20"
            >
              Talk to a Free Broker
            </a>
          </div>
        </section>

        {/* Disclaimer */}
        <p className="mt-6 rounded-xl border border-border bg-white p-4 text-xs leading-relaxed text-mid">
          <strong>Disclaimer:</strong> This tool provides educational guidance only and
          does not constitute licensed insurance advice. Plan availability, premiums,
          and subsidies vary by state and are subject to change. Always verify details
          at Healthcare.gov or with a licensed insurance broker before making enrollment decisions.
        </p>

        {/* Premium hook */}
        <div className="mt-8 rounded-2xl border-2 border-dashed border-border bg-white/50 p-6 text-center opacity-60">
          <span className="text-2xl">&#128274;</span>
          <p className="mt-2 font-heading text-lg font-bold text-charcoal">
            Get your full {tool.premiumLabel}
          </p>
          <p className="mt-1 text-sm text-mid">
            Unlock with {tool.name} Premium
          </p>
          <button
            onClick={() => {
              fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: '',
                  email: 'interest@placeholder.com',
                  tool: 'premium_interest',
                  profileSummary: `HealthGuide premium interest`,
                }),
              }).catch(() => {});
            }}
            className="mt-3 rounded-lg bg-border px-4 py-2 text-xs font-medium text-mid"
          >
            Coming soon
          </button>
        </div>

        <CrossToolFooter currentToolId={tool.id} />
      </div>
    </div>
  );
}
