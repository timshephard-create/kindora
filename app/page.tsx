import { PLATFORM, TOOL_LIST } from '@/config/platform';
import HubCard from '@/components/HubCard';

export default function HubPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-charcoal px-5 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-white/50">
            &#10022; Family Navigation Platform
          </p>
          <h1 className="mb-6 font-heading text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            {PLATFORM.tagline}
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/70">
            {PLATFORM.description}
          </p>
        </div>
      </section>

      {/* Tool Cards */}
      <section className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TOOL_LIST.map((tool) => (
            <HubCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

    </>
  );
}
