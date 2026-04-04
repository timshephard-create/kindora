import Link from 'next/link';
import { TOOL_LIST, PLATFORM } from '@/config/platform';
import type { ToolConfig } from '@/config/platform';

const colorMap: Record<string, string> = {
  sage: 'hover:bg-sage-pale border-sage-light/30',
  sky: 'hover:bg-sky-pale border-sky-light/30',
  gold: 'hover:bg-gold-pale border-gold/30',
};

export default function CrossToolFooter({ currentToolId }: { currentToolId: string }) {
  const otherTools = TOOL_LIST.filter((t: ToolConfig) => t.id !== currentToolId);

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h3 className="mb-2 text-center font-heading text-xl font-bold text-charcoal">
        Explore more from {PLATFORM.name}
      </h3>
      <p className="mb-6 text-center text-sm text-mid">
        Each tool helps your family navigate a different system.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {otherTools.map((tool: ToolConfig) => (
          <Link
            key={tool.id}
            href={tool.route}
            className={`rounded-xl border ${colorMap[tool.color] || ''} bg-white p-5 transition-all hover:shadow-sm`}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl">{tool.icon}</span>
              <span className="font-heading text-lg font-bold text-charcoal">
                {tool.name}
              </span>
            </div>
            <p className="text-sm text-mid">{tool.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
