import type { SavingsBreakdown } from '@/types';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

const tiles = [
  { key: 'ccdf' as const, label: 'CCDF Subsidy', description: 'Federal childcare assistance' },
  { key: 'fsa' as const, label: 'FSA Savings', description: 'Pre-tax dependent care' },
  { key: 'ctc' as const, label: 'Child Tax Credit', description: 'Annual tax credit' },
];

export default function SavingsTiles({ savings }: { savings: SavingsBreakdown }) {
  return (
    <div className="mb-8">
      <h3 className="mb-4 font-heading text-xl font-bold text-charcoal">
        Your estimated annual savings
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tiles.map(
          (tile) =>
            savings[tile.key] > 0 && (
              <div
                key={tile.key}
                className="rounded-xl border border-sage-light/30 bg-sage-pale p-4"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-sage">
                  {tile.label}
                </p>
                <p className="mt-1 font-heading text-2xl font-bold text-sage">
                  {formatCurrency(savings[tile.key])}
                </p>
                <p className="mt-1 text-xs text-mid">{tile.description}</p>
              </div>
            ),
        )}
      </div>
      <div className="mt-3 rounded-xl bg-sage p-4 text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-white/80">
          Total potential savings
        </p>
        <p className="mt-1 font-heading text-3xl font-bold text-white">
          {formatCurrency(savings.total)}
        </p>
        <p className="mt-1 text-xs text-white/60">per year</p>
      </div>
    </div>
  );
}
