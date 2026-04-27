'use client';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="mx-auto max-w-md px-5 py-16 text-center">
      <div className="mb-4 text-4xl">&#128533;</div>
      <h2 className="mb-2 font-display text-xl font-bold text-charcoal">
        Oops — we hit a snag
      </h2>
      <p className="mb-6 text-sm text-mid">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-xl bg-sage px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sage-light"
        >
          Try again
        </button>
      )}
    </div>
  );
}
