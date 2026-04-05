'use client';

import { useState, useEffect, useMemo } from 'react';

interface LoadingStateProps {
  messages?: string[];
  color?: string;
}

const colorMap: Record<string, { spinner: string; text: string }> = {
  sage: { spinner: 'border-sage', text: 'text-sage' },
  sky: { spinner: 'border-sky', text: 'text-sky' },
  gold: { spinner: 'border-gold', text: 'text-gold-dark' },
  terra: { spinner: 'border-terra', text: 'text-terra' },
};

const DEFAULT_MESSAGES = ['Finding your results...'];

export default function LoadingState({ messages, color = 'sage' }: LoadingStateProps) {
  const [msgIndex, setMsgIndex] = useState(0);
  const msgs = useMemo(() => messages || DEFAULT_MESSAGES, [messages]);
  const colors = colorMap[color] || colorMap.sage;

  useEffect(() => {
    if (msgs.length <= 1) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % msgs.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [msgs]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-20">
      {/* Spinner */}
      <div
        className={`mb-6 h-10 w-10 animate-spin rounded-full border-4 border-border ${colors.spinner}`}
        style={{ borderTopColor: 'transparent' }}
      />
      {/* Rotating message */}
      <p className={`text-center text-sm font-medium ${colors.text} transition-opacity duration-300`}>
        {msgs[msgIndex]}
      </p>
    </div>
  );
}
