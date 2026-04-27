'use client';

import { useState } from 'react';
import { PLATFORM } from '@/config/platform';
import { trackEvent } from '@/lib/analytics';

const FEATURES = [
  {
    tool: 'HealthGuide Premium',
    description: 'Save your plan, track HSA receipts, get open enrollment reminders',
    color: 'border-sky-light/30 bg-sky-pale',
    icon: '\uD83E\uDE7A',
  },
  {
    tool: 'Sprout Premium',
    description: 'Track your subsidy application, save provider shortlist, waitlist reminders',
    color: 'border-sage-light/30 bg-sage-pale',
    icon: '\uD83C\uDF31',
  },
  {
    tool: 'BrightWatch Premium',
    description: 'Weekly family media schedule, saved approved shows, age milestone alerts',
    color: 'border-gold/30 bg-gold-pale',
    icon: '\uD83D\uDCFA',
  },
  {
    tool: 'Nourish Premium',
    description: 'Monthly auto meal plans, leftovers logic, Instacart cart push',
    color: 'border-terra-light/30 bg-terra-pale',
    icon: '\uD83E\uDD57',
  },
];

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');

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
        body: JSON.stringify({ email, tool: 'waitlist-page' }),
      });
      if (res.ok) {
        setStatus('success');
        trackEvent('waitlist_joined', { tool: 'waitlist_page' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-charcoal px-5 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-white/50">
            &#10024; {PLATFORM.brandName} Premium
          </p>
          <h1 className="mb-6 font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            Be first when {PLATFORM.name} Premium launches
          </h1>
          <p className="mx-auto max-w-lg text-lg leading-relaxed text-white/70">
            {PLATFORM.name} Premium saves your results, tracks your progress, and reminds you when
            it&apos;s time to re-check. Founding members get early access and locked-in pricing &mdash; forever.
          </p>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <h2 className="mb-8 text-center font-display text-2xl font-bold text-charcoal">
          What&apos;s included
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.tool} className={`rounded-2xl border ${f.color} p-5`}>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xl">{f.icon}</span>
                <h3 className="font-display text-base font-bold text-charcoal">{f.tool}</h3>
              </div>
              <p className="text-sm leading-relaxed text-mid">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Email capture */}
      <section className="mx-auto max-w-md px-5 pb-16">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm" data-testid="waitlist-page-form">
          {status === 'success' ? (
            <div className="py-4 text-center">
              <div className="mb-3 text-3xl">&#10003;</div>
              <p className="font-display text-lg font-bold text-charcoal">You&apos;re on the list!</p>
              <p className="mt-1 text-sm text-mid">
                We&apos;ll email you when Premium launches with founding member pricing.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 className="mb-1 font-display text-lg font-bold text-charcoal">
                Join the founding member waitlist
              </h3>
              <p className="mb-4 text-sm text-mid">
                Early access + pricing locked in for life.
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
                  className="flex-1 rounded-xl border border-border bg-cream px-4 py-2.5 text-sm text-charcoal placeholder:text-mid/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="rounded-xl bg-sage px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sage-light disabled:opacity-50"
                >
                  {status === 'loading' ? 'Joining...' : 'Join the Waitlist'}
                </button>
              </div>
              {emailError && <p className="mt-1 text-xs text-[#B85C3A]">{emailError}</p>}
              {status === 'error' && (
                <p className="mt-1 text-xs text-mid">
                  Something went wrong. Try again or email {PLATFORM.email.fromEmail}
                </p>
              )}
              <p className="mt-2 text-[10px] text-mid">Free to join. No spam. Ever.</p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
