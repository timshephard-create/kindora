'use client';

import { useState, useCallback } from 'react';
import { TOOLS } from '@/config/platform';
import QuizShell from '@/components/QuizShell';
import EmailCapture from '@/components/EmailCapture';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import PlaceCard from '@/components/PlaceCard';
import SavingsTiles from '@/components/SavingsTiles';
import AIInsightBlock from '@/components/AIInsightBlock';
import CrossToolFooter from '@/components/CrossToolFooter';
import { calculateSavings } from '@/lib/savings-calc';
import type { PlaceResult, SavingsBreakdown } from '@/types';
import type { QuizQuestion } from '@/types';

const tool = TOOLS.childcare;

const questions: QuizQuestion[] = [
  {
    id: 'situation',
    type: 'single',
    label: 'What best describes your situation?',
    autoAdvance: true,
    options: [
      { value: 'looking', label: 'Actively looking for care' },
      { value: 'expensive', label: 'Have care but paying too much' },
      { value: 'gap', label: 'Need to cover a gap (school break, closure, holiday)' },
      { value: 'planning', label: 'Planning ahead' },
    ],
  },
  {
    id: 'childAges',
    type: 'multi',
    label: 'How old are your children?',
    helpText: 'Select all that apply',
    options: [
      { value: 'infant', label: 'Infant (under 12 months)' },
      { value: 'toddler', label: 'Toddler (1\u20132 years)' },
      { value: 'preschool', label: 'Preschool Age (3\u20134 years)' },
      { value: 'prek', label: 'Pre-K / Kindergarten (4\u20135 years)' },
    ],
  },
  {
    id: 'zip',
    type: 'text',
    label: 'What\u2019s your ZIP code?',
    helpText: 'We\u2019ll find providers and programs near you.',
    placeholder: 'e.g. 90210',
    validate: (v: string) => /^\d{5}$/.test(v) ? null : 'Please enter a 5-digit ZIP code',
  },
  {
    id: 'income',
    type: 'single',
    label: 'What\u2019s your approximate household income?',
    helpText: 'This helps us find savings programs you qualify for.',
    autoAdvance: true,
    options: [
      { value: 'under_35k', label: 'Under $35,000' },
      { value: '35k_60k', label: '$35,000\u2013$60,000' },
      { value: '60k_90k', label: '$60,000\u2013$90,000' },
      { value: '90k_plus', label: '$90,000+' },
    ],
  },
  {
    id: 'schedule',
    type: 'single',
    label: 'What schedule do you need?',
    autoAdvance: true,
    options: [
      { value: 'fulltime', label: 'Full-time (5 days/week)' },
      { value: 'parttime', label: 'Part-time (2\u20133 days)' },
      { value: 'flexible', label: 'Flexible / drop-in' },
      { value: 'breaks', label: 'School breaks / backup only' },
    ],
  },
  {
    id: 'budget',
    type: 'slider',
    label: 'What\u2019s your monthly childcare budget?',
    min: 200,
    max: 3000,
    step: 50,
    prefix: '$',
  },
];

const HEAD_START_CARD: PlaceResult = {
  name: 'Head Start Program',
  address: 'Free, federally-funded early childhood education',
  phone: null,
  rating: null,
  totalRatings: 0,
  hours: null,
  distance: null,
  placeId: '',
  mapsUrl: 'https://www.acf.hhs.gov/ohs/about/head-start',
};

const GAP_CARE_EXTRAS: PlaceResult[] = [
  {
    name: 'Bright Horizons Backup Care',
    address: 'Employer-sponsored backup childcare benefit',
    phone: null,
    rating: 4.2,
    totalRatings: 0,
    hours: null,
    distance: null,
    placeId: '',
    mapsUrl: 'https://www.brighthorizons.com/backup-care', // TODO: replace with affiliate URL
  },
  {
    name: 'Care.com \u2014 Nanny Search',
    address: 'Find babysitters and nannies near you',
    phone: null,
    rating: 4.0,
    totalRatings: 0,
    hours: null,
    distance: null,
    placeId: '',
    mapsUrl: 'https://www.care.com', // TODO: replace with affiliate URL
  },
];

export default function SproutTool() {
  const [phase, setPhase] = useState<'quiz' | 'loading' | 'email' | 'results'>('quiz');
  const [results, setResults] = useState<{
    places: PlaceResult[];
    savings: SavingsBreakdown;
    insight: string;
    isGapMode: boolean;
    fallback: boolean;
    emailData: Record<string, unknown>;
  } | null>(null);
  const [error, setError] = useState(false);

  const handleComplete = useCallback(async (answers: Record<string, string | string[] | number>) => {
    setPhase('loading');
    setError(false);

    const situation = answers.situation as string;
    const schedule = answers.schedule as string;
    const zip = answers.zip as string;
    const income = answers.income as string;
    const isGapMode = situation === 'gap' || schedule === 'breaks';

    const placeTypes = isGapMode
      ? ['gym', 'child_care_agency', 'primary_school']
      : ['child_care_agency', 'primary_school'];

    try {
      const [placesRes, insightRes] = await Promise.allSettled([
        fetch('/api/places', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zip, types: placeTypes }),
        }).then((r) => r.json()),
        fetch('/api/insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tool: 'childcare', profile: answers }),
        }).then((r) => r.json()),
      ]);

      const placesData = placesRes.status === 'fulfilled' ? placesRes.value : { data: [], fallback: true };
      const insightData = insightRes.status === 'fulfilled' ? insightRes.value : { data: { insight: '' } };

      let places: PlaceResult[] = placesData.data || [];

      if (isGapMode) {
        places = [...places, ...GAP_CARE_EXTRAS];
      }

      // Inject Head Start if income under $60k
      if (!isGapMode && (income === 'under_35k' || income === '35k_60k')) {
        places = [HEAD_START_CARD, ...places];
      }

      const savings = calculateSavings(income);

      setResults({
        places,
        savings,
        insight: insightData.data?.insight || '',
        isGapMode,
        fallback: placesData.fallback || false,
        emailData: {
          savingsTotal: savings.total,
          ccdf: savings.ccdf,
          fsa: savings.fsa,
          ctc: savings.ctc,
          income,
          isGapMode,
        },
      });

      setPhase('email');
    } catch {
      setError(true);
      setPhase('results');
    }
  }, []);

  if (phase === 'quiz') {
    return (
      <div className="min-h-screen bg-cream">
        <div className="bg-sage-pale px-5 py-8 text-center">
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
        <LoadingState
          color="sage"
          messages={[
            'Finding providers near you...',
            'Calculating your savings...',
            'Building your personalized plan...',
          ]}
        />
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-cream">
        <ErrorState
          message="We couldn't load your results. Please try again."
          onRetry={() => setPhase('quiz')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {phase === 'email' && (
        <EmailCapture
          tool={tool}
          emailResultsData={results.emailData}
          onDismiss={() => setPhase('results')}
        />
      )}

      <div className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
        <h1 className="mb-2 font-heading text-3xl font-bold text-charcoal sm:text-4xl">
          {results.isGapMode ? 'Gap Care Options' : 'Your Childcare Matches'}
        </h1>
        <p className="mb-8 text-sm text-mid">
          {results.isGapMode
            ? 'Here are backup and short-term care options near you.'
            : 'Providers near you, sorted by rating, with your estimated savings.'}
        </p>

        {results.fallback && (
          <div className="mb-6 rounded-xl border border-gold/30 bg-gold-pale p-4 text-sm text-gold-dark">
            Live results unavailable &mdash; showing example options near you.
          </div>
        )}

        {/* AI Insight */}
        {results.insight && (
          <div className="mb-8">
            <AIInsightBlock insight={results.insight} color="sage" />
          </div>
        )}

        {/* Savings (provider mode only) */}
        {!results.isGapMode && results.savings.total > 0 && (
          <SavingsTiles savings={results.savings} />
        )}

        {/* Place Cards */}
        <div className="space-y-4">
          {results.places.map((place, i) => (
            <PlaceCard key={`${place.placeId || place.name}-${i}`} place={place} />
          ))}
        </div>

        {/* Premium upgrade hook */}
        <div className="mt-8 rounded-2xl border-2 border-dashed border-border bg-white/50 p-6 text-center opacity-60">
          <span className="text-2xl">&#128274;</span>
          <p className="mt-2 font-heading text-lg font-bold text-charcoal">
            Get your full {tool.premiumLabel}
          </p>
          <p className="mt-1 text-sm text-mid">
            Unlock with {TOOLS.childcare.name} Premium
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
                  profileSummary: `Sprout premium interest`,
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
