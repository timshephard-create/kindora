import type { PlanRecommendation } from '@/types';

const rankStyles: Record<string, { badge: string; border: string }> = {
  best: { badge: 'bg-sky text-white', border: 'border-sky' },
  strong: { badge: 'bg-sky-light text-white', border: 'border-sky-light' },
  consider: { badge: 'bg-sky-pale text-sky', border: 'border-border' },
};

export default function PlanCard({ plan }: { plan: PlanRecommendation }) {
  const styles = rankStyles[plan.rank] || rankStyles.consider;

  return (
    <div className={`rounded-2xl border-2 ${styles.border} bg-white p-6 transition-shadow hover:shadow-md`}>
      <div className="mb-4 flex items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${styles.badge}`}>
          {plan.rankLabel}
        </span>
      </div>

      <h3 className="mb-2 font-heading text-xl font-bold text-charcoal">{plan.name}</h3>
      <p className="mb-4 text-sm leading-relaxed text-mid">{plan.why}</p>

      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-sage">
          Why this works for you
        </p>
        <ul className="space-y-1.5">
          {plan.pros.map((pro, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-charcoal">
              <span className="mt-0.5 text-sage">&#10003;</span>
              {pro}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold-dark">
          Watch out for
        </p>
        <ul className="space-y-1.5">
          {plan.watchOut.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-mid">
              <span className="mt-0.5 text-gold">&#9888;</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
