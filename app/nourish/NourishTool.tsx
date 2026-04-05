'use client';

import { useState, useCallback } from 'react';
import { TOOLS } from '@/config/platform';
import QuizShell from '@/components/QuizShell';
import EmailCapture from '@/components/EmailCapture';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import AIInsightBlock from '@/components/AIInsightBlock';
import CrossToolFooter from '@/components/CrossToolFooter';
import type { NourishResponse, NourishDay, NourishShoppingItem } from '@/types';
import type { QuizQuestion } from '@/types';

const tool = TOOLS.meal;

const questions: QuizQuestion[] = [
  {
    id: 'householdSize',
    type: 'single',
    label: 'How many people are you feeding?',
    autoAdvance: true,
    options: [
      { value: '1', label: 'Just me (1 person)' },
      { value: '2', label: '2 people' },
      { value: '3-4', label: 'Family of 3\u20134' },
      { value: '5+', label: 'Family of 5+' },
    ],
  },
  {
    id: 'budget',
    type: 'slider',
    label: 'What\u2019s your weekly grocery budget?',
    min: 50,
    max: 500,
    step: 25,
    prefix: '$',
  },
  {
    id: 'dietary',
    type: 'multi',
    label: 'Any dietary preferences or restrictions?',
    helpText: 'Select all that apply',
    options: [
      { value: 'none', label: 'No restrictions' },
      { value: 'vegetarian', label: 'Vegetarian' },
      { value: 'vegan', label: 'Vegan' },
      { value: 'gluten-free', label: 'Gluten-free' },
      { value: 'dairy-free', label: 'Dairy-free' },
      { value: 'halal', label: 'Halal' },
      { value: 'kosher', label: 'Kosher' },
      { value: 'low-carb', label: 'Low-carb / Keto' },
      { value: 'nut-allergy', label: 'Nut allergy' },
    ],
  },
  {
    id: 'cookingTime',
    type: 'single',
    label: 'How much time do you have to cook?',
    autoAdvance: true,
    options: [
      { value: 'minimal', label: 'Minimal \u2014 15\u201320 min meals only' },
      { value: 'moderate', label: 'Moderate \u2014 up to 45 minutes' },
      { value: 'flexible', label: 'Flexible \u2014 happy to cook on weekends' },
      { value: 'batch', label: 'Batch cooking \u2014 I prep once for the week' },
    ],
  },
  {
    id: 'zip',
    type: 'text',
    label: 'What\u2019s your ZIP code?',
    helpText: 'We\u2019ll suggest stores near you.',
    placeholder: 'e.g. 78701',
    validate: (v: string) => /^\d{5}$/.test(v) ? null : 'Please enter a 5-digit ZIP code',
  },
];

const CATEGORIES: Array<{ key: string; label: string; icon: string }> = [
  { key: 'Produce', label: 'Produce', icon: '\uD83E\uDD66' },
  { key: 'Protein', label: 'Protein', icon: '\uD83E\uDD69' },
  { key: 'Dairy', label: 'Dairy', icon: '\uD83E\uDDC0' },
  { key: 'Pantry', label: 'Pantry', icon: '\uD83C\uDF3E' },
  { key: 'Frozen', label: 'Frozen', icon: '\u2744\uFE0F' },
];

function MealDayCard({ day, expanded, onToggle }: { day: NourishDay; expanded: boolean; onToggle: () => void }) {
  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="font-heading text-lg font-bold text-charcoal">{day.day}</span>
        <span className="text-mid transition-transform" style={{ transform: expanded ? 'rotate(180deg)' : '' }}>
          &#9660;
        </span>
      </button>
      {expanded && (
        <div className="border-t border-border px-5 py-4 space-y-3">
          {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
            <div key={meal} className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-terra">
                  {meal}
                </p>
                <p className="text-sm font-medium text-charcoal">{day[meal].name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-mid">{day[meal].prepTime}</p>
                <p className="text-xs font-medium text-charcoal">{day[meal].cost}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NourishTool() {
  const [phase, setPhase] = useState<'quiz' | 'loading' | 'email' | 'results'>('quiz');
  const [results, setResults] = useState<NourishResponse | null>(null);
  const [emailData, setEmailData] = useState<Record<string, unknown>>({});
  const [userBudget, setUserBudget] = useState(0);
  const [userZip, setUserZip] = useState('');
  const [expandedDay, setExpandedDay] = useState(0);
  const [error, setError] = useState(false);

  const handleComplete = useCallback(async (answers: Record<string, string | string[] | number>) => {
    setPhase('loading');
    setError(false);
    setUserBudget(answers.budget as number);
    setUserZip(answers.zip as string);

    try {
      const res = await fetch('/api/nourish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          householdSize: answers.householdSize,
          budget: answers.budget,
          dietary: answers.dietary || [],
          cookingTime: answers.cookingTime,
          zip: answers.zip,
        }),
      });

      const data = await res.json();
      const nourishData = data.data as NourishResponse;
      setResults(nourishData);

      const dinners = nourishData.weeklyPlan?.slice(0, 3).map((d) => d.dinner) || [];
      setEmailData({
        weeklyTotal: nourishData.weeklyTotal,
        topDinners: dinners,
        topSavingsTip: nourishData.savingsTips?.[0],
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
        <div className="bg-terra-pale px-5 py-8 text-center">
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
        <LoadingState message="Building your personalized meal plan..." />
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-cream">
        <ErrorState
          message="We couldn't generate your meal plan. Please try again."
          onRetry={() => setPhase('quiz')}
        />
      </div>
    );
  }

  const budgetNum = parseFloat(results.weeklyTotal.replace(/[^0-9.]/g, ''));
  const isUnderBudget = budgetNum <= userBudget;

  return (
    <div className="min-h-screen bg-cream">
      {phase === 'email' && (
        <EmailCapture tool={tool} emailResultsData={emailData} onDismiss={() => setPhase('results')} />
      )}

      <div className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
        <h1 className="mb-2 font-heading text-3xl font-bold text-charcoal sm:text-4xl">
          Your Weekly Meal Plan
        </h1>
        <p className="mb-8 text-sm text-mid">
          7 days of meals optimized for your budget, preferences, and schedule.
        </p>

        {/* AI Insight */}
        {results.insight && (
          <div className="mb-8">
            <AIInsightBlock insight={results.insight} color="terra" />
          </div>
        )}

        {/* Weekly Total */}
        <div className="mb-8 rounded-2xl bg-terra p-6 text-center text-white">
          <p className="text-xs font-medium uppercase tracking-wider text-white/70">
            Estimated weekly grocery cost
          </p>
          <p className="mt-1 font-heading text-4xl font-bold">{results.weeklyTotal}</p>
          <p className="mt-1 text-sm text-white/80">
            {isUnderBudget
              ? `That\u2019s $${(userBudget - budgetNum).toFixed(0)} under your $${userBudget} budget`
              : `Your budget: $${userBudget}/week`}
          </p>
        </div>

        {/* Meal Plan */}
        <section className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-bold text-charcoal">
            7-Day Plan
          </h2>
          <div className="space-y-3">
            {results.weeklyPlan.map((day: NourishDay, i: number) => (
              <MealDayCard
                key={day.day}
                day={day}
                expanded={expandedDay === i}
                onToggle={() => setExpandedDay(expandedDay === i ? -1 : i)}
              />
            ))}
          </div>
        </section>

        {/* Shopping List */}
        <section className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-bold text-charcoal">
            Shopping List
          </h2>
          <div className="space-y-4">
            {CATEGORIES.map(({ key, label, icon }) => {
              const items = results.shoppingList.filter(
                (item: NourishShoppingItem) => item.category === key,
              );
              if (items.length === 0) return null;
              return (
                <div key={key} className="rounded-xl border border-border bg-white p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-charcoal">
                    <span>{icon}</span> {label}
                  </h3>
                  <div className="space-y-2">
                    {items.map((item: NourishShoppingItem, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-charcoal">
                          {item.item} <span className="text-mid">({item.quantity})</span>
                        </span>
                        <span className="font-medium text-charcoal">{item.estimatedCost}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Savings Tips */}
        {results.savingsTips && results.savingsTips.length > 0 && (
          <section className="mb-8 rounded-2xl border border-terra-light/30 bg-terra-pale p-6">
            <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold text-terra">
              <span>&#128161;</span> Savings Tips
            </h2>
            <ul className="space-y-2">
              {results.savingsTips.map((tip: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-charcoal">
                  <span className="mt-0.5 text-terra">&#10003;</span>
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Store Suggestion */}
        <div className="mb-8 rounded-xl border border-border bg-white p-5">
          <p className="text-sm text-charcoal">
            <strong>For ZIP {userZip}</strong>, consider checking <strong>Walmart</strong>, <strong>Aldi</strong>, and <strong>HEB</strong> for the best prices on your list. Buying store-brand where available can save you another 15\u201325%.
          </p>
        </div>

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
                  profileSummary: 'Nourish premium interest',
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
