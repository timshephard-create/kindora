export default function LoadingState({ message = 'Finding your results...' }: { message?: string }) {
  return (
    <div className="mx-auto max-w-xl px-5 py-16">
      <div className="animate-pulse space-y-6">
        {/* Title skeleton */}
        <div className="h-8 w-3/4 rounded-lg bg-border/50" />

        {/* Subtitle skeleton */}
        <div className="h-4 w-1/2 rounded-lg bg-border/30" />

        {/* Card skeletons */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-white p-6">
            <div className="mb-4 h-6 w-1/3 rounded bg-border/50" />
            <div className="mb-2 h-4 w-full rounded bg-border/30" />
            <div className="mb-2 h-4 w-5/6 rounded bg-border/30" />
            <div className="h-4 w-2/3 rounded bg-border/30" />
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-mid">{message}</p>
    </div>
  );
}
