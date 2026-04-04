'use client';

import { motion } from 'framer-motion';

interface OptionButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  color: string;
  multi?: boolean;
}

const selectedColors: Record<string, string> = {
  sage: 'border-sage bg-sage-pale text-sage',
  sky: 'border-sky bg-sky-pale text-sky',
  gold: 'border-gold bg-gold-pale text-gold-dark',
};

export default function OptionButton({
  label,
  selected,
  onClick,
  color,
  multi = false,
}: OptionButtonProps) {
  const selectedClass = selectedColors[color] || selectedColors.sage;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full rounded-xl border-2 px-5 py-4 text-left text-sm font-medium transition-colors ${
        selected
          ? selectedClass
          : 'border-border bg-white text-charcoal hover:border-mid/40'
      }`}
    >
      <span className="flex items-center gap-3">
        <span
          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center ${
            multi ? 'rounded' : 'rounded-full'
          } border-2 ${
            selected
              ? `border-current bg-current`
              : 'border-border'
          }`}
        >
          {selected && (
            <svg
              className="h-3 w-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
        {label}
      </span>
    </motion.button>
  );
}
