'use client';

import { useState, useEffect } from 'react';

interface SliderInputProps {
  value: number;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  onChange: (value: number) => void;
  color: string;
}

export default function SliderInput({
  value,
  min,
  max,
  step,
  prefix = '',
  suffix = '',
  onChange,
}: SliderInputProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setLocalValue(v);
    onChange(v);
  };

  const formatValue = (v: number) => {
    const formatted = v.toLocaleString('en-US');
    return `${prefix}${formatted}${suffix}`;
  };

  const percent = ((localValue - min) / (max - min)) * 100;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <span className="font-display text-4xl font-bold text-charcoal">
          {formatValue(localValue)}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleChange}
          className="w-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--sage) 0%, var(--sage) ${percent}%, var(--border) ${percent}%, var(--border) 100%)`,
          }}
        />
        <div className="mt-2 flex justify-between text-xs text-mid">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      </div>
    </div>
  );
}
