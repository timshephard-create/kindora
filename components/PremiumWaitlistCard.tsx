'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';

interface PremiumContent {
  headline: string;
  body: string;
  bullets: string[];
}

const TOOL_CONTENT: Record<string, PremiumContent> = {
  health: {
    headline: 'Save your plan & track your progress',
    body: 'Kindora Premium saves your results, tracks your HSA receipts, and reminds you every November when open enrollment opens. Never start from scratch again.',
    bullets: [
      'Saved plan comparison',
      'HSA expense tracker',
      'Annual open enrollment reminder',
      'Employer vs marketplace calculator',
    ],
  },
  childcare: {
    headline: 'Track your subsidy application',
    body: 'Kindora Premium gives you a step-by-step subsidy application tracker, provider shortlist, and waitlist reminders so nothing falls through the cracks.',
    bullets: [
      'Saved provider shortlist',
      'Subsidy application tracker',
      'Waitlist reminders',
      'Gap care finder for school closures',
    ],
  },
  media: {
    headline: "Build your family's media plan",
    body: "Kindora Premium creates a weekly screen time schedule for your kids' ages, saves your approved shows list, and alerts you when your child hits a new developmental milestone.",
    bullets: [
      'Weekly family media schedule',
      'Approved shows library',
      'Age milestone content alerts',
      'Screen time tracker',
    ],
  },
  meal: {
    headline: 'Auto-plan every month',
    body: "Kindora Premium generates a fresh meal plan every month, remembers your family's preferences, and will push your shopping list directly to Instacart when our integration launches.",
    bullets: [
      'Monthly auto-generated meal plans',
      'Saved plan library',
      'Leftovers and batch cooking mode',
      'Instacart cart push (coming soon)',
    ],
  },
};

export default function PremiumWaitlistCard({ toolId }: { toolId: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');

  const content = TOOL_CONTENT[toolId] || TOOL_CONTENT.health;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
      setEmailError('Please enter a valid email');
      return;
    }
    setEmailError('');
    setStatus('loading');

    try {
      const res = await fetch('/api/premium-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tool: toolId }),
      });
      if (res.ok) {
        setStatus('success');
        trackEvent('waitlist_joined', { tool: toolId });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div
      className="mt-8 rounded-2xl border border-border bg-gradient-to-br from-white to-cream p-6 shadow-sm"
      data-testid="premium-waitlist-card"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">&#10024;</span>
        <h3 className="font-heading text-lg font-bold text-charcoal">{content.headline}</h3>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-mid">{content.body}</p>

      <ul className="mb-6 space-y-1.5">
        {content.bullets.map((b, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-charcoal">
            <span className="text-sage">&#10003;</span>
            {b}
          </li>
        ))}
      </ul>

      {status === 'success' ? (
        <div className="rounded-xl bg-sage-pale p-4 text-center" data-testid="waitlist-success">
          <p className="text-sm font-semibold text-sage">You&apos;re on the list!</p>
          <p className="mt-1 text-xs text-mid">
            We&apos;ll email you when Premium launches with founding member pricing.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <p className="mb-2 text-xs font-semibold text-charcoal">
            Get early access + founding member pricing
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              data-testid="waitlist-email-input"
              className="flex-1 rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-mid/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              data-testid="waitlist-submit-btn"
              className="rounded-xl bg-sage px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sage-light disabled:opacity-50"
            >
              {status === 'loading' ? 'Joining...' : 'Join the Waitlist'}
            </button>
          </div>
          {emailError && <p className="mt-1 text-xs text-[#B85C3A]">{emailError}</p>}
          {status === 'error' && (
            <p className="mt-1 text-xs text-mid">
              Something went wrong. Try again or email tim@kindora.world
            </p>
          )}
          <p className="mt-2 text-[10px] text-mid">Free to join. No spam. Ever.</p>
        </form>
      )}
    </div>
  );
}
