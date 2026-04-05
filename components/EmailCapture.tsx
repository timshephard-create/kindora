'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ToolConfig } from '@/config/platform';

interface EmailCaptureProps {
  tool: ToolConfig;
  profileSummary?: string;
  emailResultsData?: Record<string, unknown>;
  onDismiss: () => void;
}

export default function EmailCapture({ tool, profileSummary, emailResultsData, onDismiss }: EmailCaptureProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (value: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    setStatus('loading');

    try {
      await Promise.allSettled([
        fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            tool: tool.id,
            profileSummary,
          }),
        }),
        fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            tool: tool.id,
            results: emailResultsData,
          }),
        }),
      ]);
      setStatus('success');
      setTimeout(onDismiss, 1500);
    } catch {
      setStatus('error');
      setTimeout(onDismiss, 2000);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 px-5 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8"
        >
          {status === 'success' ? (
            <div className="py-4 text-center">
              <div className="mb-3 text-3xl">&#10003;</div>
              <p className="font-heading text-lg font-bold text-charcoal">
                Check your inbox!
              </p>
              <p className="mt-1 text-sm text-mid">
                We&apos;ve sent your results to {email}
              </p>
            </div>
          ) : (
            <>
              <h3 className="mb-2 font-heading text-xl font-bold text-charcoal">
                Get your results by email
              </h3>
              <p className="mb-6 text-sm text-mid">
                We&apos;ll send you a summary you can reference anytime.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="First name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-cream px-4 py-3 text-sm text-charcoal placeholder:text-mid/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    required
                    className="w-full rounded-xl border border-border bg-cream px-4 py-3 text-sm text-charcoal placeholder:text-mid/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                  />
                  {emailError && (
                    <p className="mt-1 text-xs text-[#B85C3A]">{emailError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading' || !name || !email}
                  className="w-full rounded-xl bg-sage py-3.5 text-sm font-semibold text-white transition-colors hover:bg-sage-light disabled:opacity-50"
                >
                  {status === 'loading' ? 'Sending...' : tool.emailCta}
                </button>

                {status === 'error' && (
                  <p className="text-center text-xs text-mid">
                    Something went wrong, but your results are still ready below.
                  </p>
                )}
              </form>

              <button
                onClick={onDismiss}
                className="mt-4 block w-full text-center text-sm text-mid hover:text-charcoal"
              >
                Skip &mdash; show me results
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
