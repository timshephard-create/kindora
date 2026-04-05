import type { PlaceResult } from '@/types';

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';

interface GeocodeResult {
  lat: number;
  lng: number;
}

async function geocodeZip(zip: string): Promise<GeocodeResult | null> {
  if (!GOOGLE_API_KEY) {
    console.error('[Places] No GOOGLE_PLACES_API_KEY set');
    return null;
  }

  // Use Places API (New) Text Search for geocoding — avoids needing the
  // separate legacy Geocoding API, which requires its own API restriction
  // entry on the key. This only needs "Places API (New)" enabled.
  try {
    const url = 'https://places.googleapis.com/v1/places:searchText';
    const body = {
      textQuery: `${zip}, USA`,
      maxResultCount: 1,
    };

    console.log('[Places] Geocoding ZIP via Text Search:', zip);
    console.log('[Places] Request URL:', url);
    console.log('[Places] API key present:', !!GOOGLE_API_KEY, '| length:', GOOGLE_API_KEY.length);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'places.location',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log('[Places] Geocode response status:', res.status);

    if (!res.ok || data.error) {
      console.error('[Places] Geocode error:', JSON.stringify(data.error || data));
      return null;
    }

    const location = data.places?.[0]?.location;
    if (location) {
      console.log('[Places] Geocoded ZIP to:', location.latitude, location.longitude);
      return { lat: location.latitude, lng: location.longitude };
    }

    console.error('[Places] Geocode returned no results for ZIP:', zip, '| response:', JSON.stringify(data));
    return null;
  } catch (err) {
    console.error('[Places] Geocode fetch error:', err);
    return null;
  }
}

interface PlacesApiResult {
  displayName?: { text: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  rating?: number;
  userRatingCount?: number;
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  location?: { latitude: number; longitude: number };
  id?: string;
}

const CHILDCARE_NAME_KEYWORDS = [
  'child', 'early', 'preschool', 'academy', 'learning', 'montessori',
  'daycare', 'day care', 'care', 'kids', 'little', 'tot', 'kiddie',
  'nursery', 'kinder', 'bright', 'sprout', 'tiny', 'infant', 'toddler',
];

const EXCLUDE_NAME_KEYWORDS = [
  'high school', 'middle school', 'junior high', 'university', 'college',
  'crossfit',
];

function isChildcareName(name: string): boolean {
  const lower = name.toLowerCase();
  return CHILDCARE_NAME_KEYWORDS.some((kw) => lower.includes(kw));
}

function isExcludedName(name: string): boolean {
  const lower = name.toLowerCase();
  // Always exclude these
  if (EXCLUDE_NAME_KEYWORDS.some((kw) => lower.includes(kw))) {
    // Exception: YMCA with childcare keywords
    if (lower.includes('ymca') || lower.includes('y.m.c.a')) {
      return !(lower.includes('child') || lower.includes('childcare') || lower.includes('daycare') || lower.includes('early learning'));
    }
    return true;
  }
  // YMCA without childcare keywords
  if ((lower.includes('ymca') || lower.includes('y.m.c.a')) &&
      !lower.includes('child watch') && !lower.includes('childcare') &&
      !lower.includes('early learning') && !lower.includes('daycare')) {
    return true;
  }
  return false;
}

function filterChildcareResults(results: PlaceResult[], relaxNameFilter = false): PlaceResult[] {
  return results.filter((place) => {
    const name = place.name;

    // Always exclude by name
    if (isExcludedName(name)) return false;

    // If name clearly matches childcare, keep it
    if (isChildcareName(name)) return true;

    // In strict mode, name must match keywords
    if (!relaxNameFilter) return false;

    // In relaxed mode, keep anything not explicitly excluded
    return true;
  });
}

export async function searchPlaces(
  zip: string,
  types: string[],
  radius: number = 16000,
): Promise<PlaceResult[]> {
  console.log('[Places] searchPlaces called with zip:', zip, 'types:', types, 'radius:', radius);

  const coords = await geocodeZip(zip);
  if (!coords) {
    console.error('[Places] Could not geocode ZIP — returning empty results');
    return [];
  }

  const allResults: PlaceResult[] = [];

  for (const type of types) {
    try {
      const requestBody = {
        includedTypes: [type],
        locationRestriction: {
          circle: {
            center: { latitude: coords.lat, longitude: coords.lng },
            radius,
          },
        },
        maxResultCount: 5,
      };

      console.log('[Places] Searching for type:', type, 'at', coords.lat, coords.lng);

      const res = await fetch(
        'https://places.googleapis.com/v1/places:searchNearby',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_API_KEY,
            'X-Goog-FieldMask':
              'places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.regularOpeningHours,places.location,places.id',
          },
          body: JSON.stringify(requestBody),
        },
      );

      const data = await res.json();

      if (!res.ok || data.error) {
        console.error(
          '[Places] Nearby Search error for type', type, ':',
          'status:', res.status,
          'response:', JSON.stringify(data),
        );
        continue;
      }

      const places: PlacesApiResult[] = data.places || [];
      console.log('[Places] Found', places.length, 'results for type:', type);

      for (const place of places) {
        const placeId = place.id || '';
        const lat = place.location?.latitude;
        const lng = place.location?.longitude;
        const mapsUrl = lat && lng
          ? `https://www.google.com/maps/place/?q=place_id:${placeId}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.displayName?.text || '')}`;

        let distance: string | null = null;
        if (lat && lng) {
          const d = haversine(coords.lat, coords.lng, lat, lng);
          distance = `${d.toFixed(1)} mi`;
        }

        allResults.push({
          name: place.displayName?.text || 'Unknown Provider',
          address: place.formattedAddress || '',
          phone: place.nationalPhoneNumber || null,
          rating: place.rating ?? null,
          totalRatings: place.userRatingCount || 0,
          hours: place.regularOpeningHours?.weekdayDescriptions || null,
          distance,
          placeId,
          mapsUrl,
        });
      }
    } catch (err) {
      console.error('[Places] Fetch error for type', type, ':', err);
    }
  }

  console.log('[Places] Pre-filter:', allResults.length, 'results');

  const filtered = filterChildcareResults(allResults);

  console.log('[Places] Post-filter:', filtered.length, 'results');

  // If filtering reduced too aggressively, relax name filter but keep type exclusions
  const finalResults = filtered.length >= 3
    ? filtered
    : filterChildcareResults(allResults, true);

  if (finalResults.length !== filtered.length) {
    console.log('[Places] Relaxed filter applied:', finalResults.length, 'results');
  }

  // Sort by rating (highest first), nulls last
  finalResults.sort((a, b) => {
    if (a.rating === null && b.rating === null) return 0;
    if (a.rating === null) return 1;
    if (b.rating === null) return -1;
    return b.rating - a.rating;
  });

  return finalResults;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Fallback data when Google Places API is unavailable
export const FALLBACK_PROVIDERS: PlaceResult[] = [
  {
    name: 'Sunshine Early Learning Center',
    address: '123 Main St, Your Area',
    phone: '(555) 123-4567',
    rating: 4.5,
    totalRatings: 89,
    hours: ['Monday-Friday: 6:30 AM - 6:00 PM'],
    distance: '1.2 mi',
    placeId: '',
    mapsUrl: '#',
  },
  {
    name: 'Little Steps Academy',
    address: '456 Oak Ave, Your Area',
    phone: '(555) 234-5678',
    rating: 4.3,
    totalRatings: 67,
    hours: ['Monday-Friday: 7:00 AM - 6:00 PM'],
    distance: '2.4 mi',
    placeId: '',
    mapsUrl: '#',
  },
  {
    name: 'Growing Minds Childcare',
    address: '789 Elm Blvd, Your Area',
    phone: '(555) 345-6789',
    rating: 4.7,
    totalRatings: 124,
    hours: ['Monday-Friday: 6:00 AM - 6:30 PM'],
    distance: '3.1 mi',
    placeId: '',
    mapsUrl: '#',
  },
  {
    name: 'Community Kids Center',
    address: '321 Pine Rd, Your Area',
    phone: '(555) 456-7890',
    rating: 4.1,
    totalRatings: 45,
    hours: ['Monday-Friday: 7:30 AM - 5:30 PM'],
    distance: '4.0 mi',
    placeId: '',
    mapsUrl: '#',
  },
];
