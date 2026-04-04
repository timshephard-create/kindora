import type { PlaceResult } from '@/types';

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';

interface GeocodeResult {
  lat: number;
  lng: number;
}

async function geocodeZip(zip: string): Promise<GeocodeResult | null> {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=${GOOGLE_API_KEY}`,
    );
    const data = await res.json();
    if (data.results?.[0]?.geometry?.location) {
      return data.results[0].geometry.location;
    }
    return null;
  } catch {
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
  const coords = await geocodeZip(zip);
  if (!coords) return [];

  const allResults: PlaceResult[] = [];

  for (const type of types) {
    try {
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
          body: JSON.stringify({
            includedTypes: [type],
            locationRestriction: {
              circle: {
                center: { latitude: coords.lat, longitude: coords.lng },
                radius,
              },
            },
            maxResultCount: 5,
          }),
        },
      );

      const data = await res.json();
      const places: PlacesApiResult[] = data.places || [];

      for (const place of places) {
        const placeId = place.id || '';
        const lat = place.location?.latitude;
        const lng = place.location?.longitude;
        const mapsUrl = lat && lng
          ? `https://www.google.com/maps/place/?q=place_id:${placeId}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.displayName?.text || '')}`;

        // Calculate rough distance
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
    } catch {
      // Continue with next type if one fails
    }
  }

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
