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

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(zip)}&key=${GOOGLE_API_KEY}`;
    console.log('[Places] Geocoding ZIP:', zip);
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK') {
      console.error('[Places] Geocoding failed:', data.status, data.error_message || '');
      // Fallback: use the Geocoding via Places Text Search to get coords
      return geocodeZipViaPlaces(zip);
    }

    const location = data.results?.[0]?.geometry?.location;
    if (location) {
      console.log('[Places] Geocoded ZIP to:', location.lat, location.lng);
      return location;
    }

    console.error('[Places] Geocoding returned no results for ZIP:', zip);
    return null;
  } catch (err) {
    console.error('[Places] Geocoding fetch error:', err);
    return geocodeZipViaPlaces(zip);
  }
}

// Fallback geocoding using Places API Text Search (in case Geocoding API isn't enabled)
async function geocodeZipViaPlaces(zip: string): Promise<GeocodeResult | null> {
  try {
    console.log('[Places] Trying Text Search fallback for geocoding ZIP:', zip);
    const res = await fetch(
      'https://places.googleapis.com/v1/places:searchText',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'places.location',
        },
        body: JSON.stringify({
          textQuery: `${zip}, USA`,
          maxResultCount: 1,
        }),
      },
    );

    const data = await res.json();
    console.log('[Places] Text Search geocode response status:', res.status);

    if (data.error) {
      console.error('[Places] Text Search geocode error:', JSON.stringify(data.error));
      return null;
    }

    const location = data.places?.[0]?.location;
    if (location) {
      console.log('[Places] Text Search geocoded to:', location.latitude, location.longitude);
      return { lat: location.latitude, lng: location.longitude };
    }

    console.error('[Places] Text Search geocode returned no results');
    return null;
  } catch (err) {
    console.error('[Places] Text Search geocode fetch error:', err);
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

  console.log('[Places] Total results:', allResults.length);

  // Sort by rating (highest first), nulls last
  allResults.sort((a, b) => {
    if (a.rating === null && b.rating === null) return 0;
    if (a.rating === null) return 1;
    if (b.rating === null) return -1;
    return b.rating - a.rating;
  });

  return allResults;
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
