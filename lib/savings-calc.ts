import type { SavingsBreakdown } from '@/types';

export function calculateSavings(income: string): SavingsBreakdown {
  switch (income) {
    case 'under_35k':
      return { ccdf: 9600, fsa: 0, ctc: 2100, total: 11700 };
    case '35k_60k':
      return { ccdf: 4800, fsa: 1200, ctc: 2100, total: 8100 };
    case '60k_90k':
      return { ccdf: 0, fsa: 1500, ctc: 1200, total: 2700 };
    case '90k_plus':
      return { ccdf: 0, fsa: 2400, ctc: 600, total: 3000 };
    default:
      return { ccdf: 0, fsa: 0, ctc: 0, total: 0 };
  }
}
