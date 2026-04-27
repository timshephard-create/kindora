import type { PlaceResult } from '@/types';

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-xs text-mid">No ratings</span>;
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1">
      <span className="text-sm font-semibold text-charcoal">{rating.toFixed(1)}</span>
      <div className="flex" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, i) => (
          <svg
            key={i}
            className={`h-3.5 w-3.5 ${
              i < full
                ? 'text-gold'
                : i === full && half
                  ? 'text-gold/50'
                  : 'text-border'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    </div>
  );
}

interface PlaceCardProps {
  place: PlaceResult;
  affiliateUrl?: string;
}

export default function PlaceCard({ place, affiliateUrl }: PlaceCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="font-display text-lg font-bold text-charcoal">{place.name}</h3>
        <StarRating rating={place.rating} />
      </div>

      <p className="mb-2 text-sm text-mid">{place.address}</p>

      {place.phone && (
        <a
          href={`tel:${place.phone}`}
          className="mb-2 inline-block text-sm text-sage hover:underline"
        >
          {place.phone}
        </a>
      )}

      {place.distance && (
        <p className="mb-3 text-xs text-mid">{place.distance} away</p>
      )}

      <div className="flex items-center gap-3">
        <a
          href={place.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-sage hover:text-sage-light"
        >
          View on Maps &rarr;
        </a>
        {affiliateUrl && (
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-sage hover:text-sage-light"
          >
            {/* TODO: replace with affiliate URL */}
            Learn More &rarr;
          </a>
        )}
      </div>
    </div>
  );
}
