import type { BrightWatchRecommendation } from '@/types';

function ScoreRing({ score }: { score: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 85 ? 'text-sage' : score >= 70 ? 'text-gold' : 'text-[#B85C3A]';
  const bgColor =
    score >= 85 ? 'text-sage-pale' : score >= 70 ? 'text-gold-pale' : 'text-[#F5E0D6]';

  return (
    <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center">
      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          strokeWidth="5"
          className={`stroke-current ${bgColor}`}
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`stroke-current ${color}`}
        />
      </svg>
      <span className={`absolute font-heading text-lg font-bold ${color}`}>
        {score}
      </span>
    </div>
  );
}

const stimulationColors: Record<string, string> = {
  Low: 'bg-sage-pale text-sage',
  Medium: 'bg-gold-pale text-gold-dark',
  High: 'bg-[#F5E0D6] text-[#B85C3A]',
};

export default function BrightWatchCard({
  rec,
}: {
  rec: BrightWatchRecommendation;
}) {
  const stimColor = stimulationColors[rec.stimulation] || stimulationColors.Medium;

  return (
    <div className="rounded-2xl border border-border bg-white p-5 transition-shadow hover:shadow-md">
      <div className="flex gap-4">
        <ScoreRing score={rec.score} />
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="font-heading text-lg font-bold text-charcoal">
              {rec.name}
            </h3>
          </div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-sky-pale px-2.5 py-0.5 text-xs font-medium text-sky">
              {rec.type}
            </span>
            <span className="text-xs text-mid">{rec.platform}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${stimColor}`}>
              {rec.stimulation} stimulation
            </span>
          </div>
          <p className="mb-3 text-sm leading-relaxed text-mid">{rec.why}</p>
          <div className="rounded-lg border border-gold/30 bg-gold-pale p-3">
            <p className="text-xs font-semibold text-gold-dark">
              &#128161; Parent tip
            </p>
            <p className="mt-1 text-xs leading-relaxed text-charcoal">{rec.tip}</p>
          </div>
          <a
            href={`https://www.commonsensemedia.org/search/${encodeURIComponent(rec.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs text-mid hover:text-charcoal"
          >
            Full age &amp; content review on Common Sense Media &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
