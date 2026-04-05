'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuizQuestion } from '@/types';
import OptionButton from './OptionButton';
import SliderInput from './SliderInput';

interface QuizShellProps {
  toolColor: string;
  questions: QuizQuestion[];
  onComplete: (answers: Record<string, string | string[] | number>) => void;
}

const colorClasses: Record<string, { button: string; progress: string }> = {
  sage: { button: 'bg-sage hover:bg-sage-light', progress: 'bg-sage' },
  sky: { button: 'bg-sky hover:bg-sky-light', progress: 'bg-sky' },
  gold: { button: 'bg-gold hover:bg-gold-dark', progress: 'bg-gold' },
  terra: { button: 'bg-terra hover:bg-terra-light', progress: 'bg-terra' },
};

export default function QuizShell({ toolColor, questions, onComplete }: QuizShellProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [direction, setDirection] = useState(1);

  const question = questions[step];
  const total = questions.length;
  const progress = ((step + 1) / total) * 100;
  const colors = colorClasses[toolColor] || colorClasses.sage;

  const currentAnswer = answers[question.id];
  const hasAnswer = currentAnswer !== undefined && currentAnswer !== '' &&
    !(Array.isArray(currentAnswer) && currentAnswer.length === 0);

  const goNext = useCallback(() => {
    if (step < total - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    } else {
      onComplete(answers);
    }
  }, [step, total, answers, onComplete]);

  const goBack = useCallback(() => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  }, [step]);

  const handleSingleSelect = useCallback(
    (value: string) => {
      setAnswers((prev) => ({ ...prev, [question.id]: value }));
      if (question.autoAdvance) {
        setTimeout(() => {
          if (step < total - 1) {
            setDirection(1);
            setStep((s) => s + 1);
          } else {
            onComplete({ ...answers, [question.id]: value });
          }
        }, 250);
      }
    },
    [question, step, total, answers, onComplete],
  );

  const handleMultiSelect = useCallback(
    (value: string) => {
      setAnswers((prev) => {
        const current = (prev[question.id] as string[]) || [];
        const next = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [question.id]: next };
      });
    },
    [question.id],
  );

  const handleTextChange = useCallback(
    (value: string) => {
      setAnswers((prev) => ({ ...prev, [question.id]: value }));
    },
    [question.id],
  );

  const handleSliderChange = useCallback(
    (value: number) => {
      setAnswers((prev) => ({ ...prev, [question.id]: value }));
    },
    [question.id],
  );

  return (
    <div className="mx-auto max-w-xl px-5 py-8 sm:py-12">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-xs text-mid">
          <span>Question {step + 1} of {total}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
          <motion.div
            className={`h-full rounded-full ${colors.progress}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          initial={{ opacity: 0, x: direction * 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -30 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          <h2 className="mb-2 font-heading text-2xl font-bold text-charcoal sm:text-3xl">
            {question.label}
          </h2>
          {question.helpText && (
            <p className="mb-6 text-sm text-mid">{question.helpText}</p>
          )}

          <div className="mt-6 space-y-3">
            {/* Single select */}
            {question.type === 'single' && question.options?.map((opt) => (
              <OptionButton
                key={opt.value}
                label={opt.label}
                selected={(currentAnswer as string) === opt.value}
                onClick={() => handleSingleSelect(opt.value)}
                color={toolColor}
              />
            ))}

            {/* Multi select */}
            {question.type === 'multi' && question.options?.map((opt) => (
              <OptionButton
                key={opt.value}
                label={opt.label}
                selected={((currentAnswer as string[]) || []).includes(opt.value)}
                onClick={() => handleMultiSelect(opt.value)}
                color={toolColor}
                multi
              />
            ))}

            {/* Text input */}
            {question.type === 'text' && (
              <input
                type="text"
                value={(currentAnswer as string) || ''}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={question.placeholder || ''}
                className="w-full rounded-xl border border-border bg-white px-4 py-3.5 text-charcoal placeholder:text-mid/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                autoFocus
              />
            )}

            {/* Slider */}
            {question.type === 'slider' && (
              <SliderInput
                value={(currentAnswer as number) ?? question.min ?? 0}
                min={question.min ?? 0}
                max={question.max ?? 100}
                step={question.step ?? 1}
                prefix={question.prefix}
                suffix={question.suffix}
                onChange={handleSliderChange}
                color={toolColor}
              />
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={goBack}
          disabled={step === 0}
          className="rounded-lg px-4 py-2 text-sm font-medium text-mid transition-colors hover:text-charcoal disabled:invisible"
        >
          &larr; Back
        </button>

        {!(question.type === 'single' && question.autoAdvance) && (
          <button
            onClick={goNext}
            disabled={!hasAnswer}
            className={`rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed ${colors.button}`}
          >
            {step === total - 1 ? 'See my results' : 'Continue'}
          </button>
        )}
      </div>
    </div>
  );
}
