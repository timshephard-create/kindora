import Link from 'next/link';
import type { ToolConfig } from '@/config/platform';

const colorMap: Record<string, { bg: string; border: string; badge: string }> = {
  sage: { bg: 'bg-sage-pale', border: 'border-sage-light/30', badge: 'bg-sage/10 text-sage' },
  sky: { bg: 'bg-sky-pale', border: 'border-sky-light/30', badge: 'bg-sky/10 text-sky' },
  gold: { bg: 'bg-gold-pale', border: 'border-gold/30', badge: 'bg-gold/10 text-gold-dark' },
  terra: { bg: 'bg-terra-pale', border: 'border-terra-light/30', badge: 'bg-terra/10 text-terra' },
};

export default function HubCard({ tool }: { tool: ToolConfig }) {
  const colors = colorMap[tool.color] || colorMap.sage;

  return (
    <Link
      href={tool.route}
      className={`group block rounded-2xl border ${colors.border} ${colors.bg} p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 sm:p-8`}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-3xl" role="img" aria-label={tool.badge}>
          {tool.icon}
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${colors.badge}`}>
          {tool.badge}
        </span>
      </div>

      <h3 className="mb-2 font-heading text-2xl font-bold text-charcoal">
        {tool.name}
      </h3>

      <p className="mb-4 text-sm leading-relaxed text-mid">
        {tool.description}
      </p>

      <span className="inline-flex items-center gap-1 text-sm font-medium text-charcoal group-hover:gap-2 transition-all">
        Get started
        <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
      </span>
    </Link>
  );
}
