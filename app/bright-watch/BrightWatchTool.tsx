'use client';

import { useState, useCallback } from 'react';
import { TOOLS } from '@/config/platform';
import QuizShell from '@/components/QuizShell';
import EmailCapture from '@/components/EmailCapture';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import BrightWatchCard from '@/components/BrightWatchCard';
import AIInsightBlock from '@/components/AIInsightBlock';
import CrossToolFooter from '@/components/CrossToolFooter';
import RecommendationDisclaimer from '@/components/RecommendationDisclaimer';
import type { BrightWatchResponse } from '@/types';
import type { QuizQuestion } from '@/types';

const tool = TOOLS.media;

const questions: QuizQuestion[] = [
  {
    id: 'age',
    type: 'single',
    label: 'How old is your child?',
    autoAdvance: true,
    options: [
      { value: 'under_12m', label: 'Under 12 months' },
      { value: '12_24m', label: '12\u201324 months' },
      { value: '2_3y', label: '2\u20133 years' },
      { value: '4_5y', label: '4\u20135 years' },
    ],
  },
  {
    id: 'context',
    type: 'single',
    label: 'What\u2019s the viewing context?',
    autoAdvance: true,
    options: [
      { value: 'learning', label: 'Learning time' },
      { value: 'wind_down', label: 'Wind-down before bed' },
      { value: 'co_viewing', label: 'Co-viewing with parent' },
      { value: 'independent', label: 'Independent play' },
    ],
  },
  {
    id: 'medium',
    type: 'single',
    label: 'What type of content?',
    autoAdvance: true,
    options: [
      { value: 'tv', label: 'TV shows' },
      { value: 'apps', label: 'Apps & games' },
      { value: 'both', label: 'Both' },
    ],
  },
];

export default function BrightWatchTool() {
  const [phase, setPhase] = useState<'quiz' | 'loading' | 'email' | 'results'>('quiz');
  const [results, setResults] = useState<BrightWatchResponse | null>(null);
  const [emailData, setEmailData] = useState<Record<string, unknown>>({});
  const [error, setError] = useState(false);

  const handleComplete = useCallback(async (answers: Record<string, string | string[] | number>) => {
    setPhase('loading');
    setError(false);

    try {
      const res = await fetch('/api/brightwatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: answers.age,
          context: answers.context,
          medium: answers.medium,
        }),
      });

      const data = await res.json();
      const bwData = data.data as BrightWatchResponse;
      setResults(bwData);
      setEmailData({
        childAge: answers.age as string,
        context: answers.context as string,
        recommendations: bwData?.recommendations?.map((r) => ({
          name: r.name, platform: r.platform, score: r.score, why: r.why,
        })),
        avoid: bwData?.avoid,
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
        <div className="bg-gold-pale px-5 py-8 text-center">
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
          color="gold"
          messages={[
            'Reviewing content for your child\'s age...',
            'Scoring developmental impact...',
            'Building your recommendations...',
          ]}
        />
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-cream">
        <ErrorState
          message="We couldn't load your recommendations. Please try again."
          onRetry={() => setPhase('quiz')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {phase === 'email' && (
        <EmailCapture tool={tool} emailResultsData={emailData} onDismiss={() => setPhase('results')} />
      )}

      <div className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
        <h1 className="mb-2 font-heading text-3xl font-bold text-charcoal sm:text-4xl">
          Your Recommendations
        </h1>
        <p className="mb-8 text-sm text-mid">
          Age-appropriate picks based on your child&apos;s profile.
        </p>

        {/* AI Insight */}
        {results.insight && (
          <div className="mb-8">
            <AIInsightBlock insight={results.insight} color="gold" />
          </div>
        )}

        {/* Availability disclaimer */}
        <p className="mb-4 text-xs italic text-mid">
          Platform availability changes frequently. Tap &ldquo;Full review&rdquo; to verify current streaming availability.
        </p>

        {/* Recommendation Cards */}
        <div className="space-y-4">
          {results.recommendations.map((rec, i) => (
            <BrightWatchCard key={i} rec={rec} />
          ))}
        </div>

        {/* What to Avoid */}
        {results.avoid && (
          <section className="mt-8 rounded-2xl border border-gold/30 bg-gold-pale p-6">
            <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-gold-dark">
              <span>&#9888;</span> What to Avoid
            </h2>
            <p className="text-sm leading-relaxed text-charcoal">{results.avoid}</p>
          </section>
        )}

        {/* Methodology Note */}
        <section className="mt-8 rounded-xl border border-border bg-cream p-5">
          <h3 className="mb-2 text-sm font-semibold text-charcoal">
            How BrightWatch scores content
          </h3>
          <p className="mb-3 text-xs leading-relaxed text-mid">
            BrightWatch ratings are based on current child development research for ages 0&ndash;5, scoring content on pacing, stimulation level, language richness, interactive design, and prosocial modeling. These criteria are different from age-appropriateness ratings.
          </p>
          <p className="mb-3 text-xs leading-relaxed text-mid">
            For full content reviews including age ratings, violence, language, and commercial content, we recommend Common Sense Media.
          </p>
          <a
            href="https://www.commonsensemedia.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-gold-dark hover:text-gold"
          >
            Visit Common Sense Media &rarr;
          </a>
        </section>

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
                  profileSummary: `BrightWatch premium interest`,
                }),
              }).catch(() => {});
            }}
            className="mt-3 rounded-lg bg-border px-4 py-2 text-xs font-medium text-mid"
          >
            Coming soon
          </button>
        </div>

        <RecommendationDisclaimer tool="brightwatch" />
        <CrossToolFooter currentToolId={tool.id} />
      </div>
    </div>
  );
}
