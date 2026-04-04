interface AIInsightBlockProps {
  insight: string;
  color?: string;
}

const bgColors: Record<string, string> = {
  sage: 'bg-sage-pale border-sage-light/30',
  sky: 'bg-sky-pale border-sky-light/30',
  gold: 'bg-gold-pale border-gold/30',
};

export default function AIInsightBlock({ insight, color = 'sage' }: AIInsightBlockProps) {
  const bg = bgColors[color] || bgColors.sage;

  return (
    <div className={`rounded-2xl border ${bg} p-6`}>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm" role="img" aria-label="sparkle">&#10024;</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-mid">
          Personalized Insight
        </span>
      </div>
      <p className="text-sm leading-relaxed text-charcoal">{insight}</p>
    </div>
  );
}
