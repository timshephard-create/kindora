import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { NearbyStore } from '@/types';

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';

const inputSchema = z.object({ zip: z.string().regex(/^\d{5}$/) });

interface Coords { lat: number; lng: number }

const CHAINS = [
  { chain: 'Walmart', keywords: ['Walmart Supercenter', 'Walmart Neighborhood Market'] },
  { chain: 'HEB', keywords: ['H-E-B', 'HEB'] },
  { chain: 'Aldi', keywords: ['Aldi'] },
  { chain: 'Kroger', keywords: ['Kroger'] },
  { chain: 'Target', keywords: ['Target'] },
  { chain: 'Costco', keywords: ['Costco'] },
  { chain: "Sam's Club", keywords: ["Sam's Club"] },
  { chain: 'Amazon Fresh', keywords: ['Amazon Fresh'] },
  { chain: "Trader Joe's", keywords: ["Trader Joe's"] },
  { chain: 'Whole Foods', keywords: ['Whole Foods'] },
];

const RADIUS = 19312; // 12 miles in meters

async function geocodeZip(zip: string): Promise<Coords | null> {
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'places.location',
      },
      body: JSON.stringify({ textQuery: `${zip}, USA`, maxResultCount: 1 }),
    });
    const data = await res.json();
    const loc = data.places?.[0]?.location;
    if (loc) return { lat: loc.latitude, lng: loc.longitude };
    return null;
  } catch {
    return null;
  }
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface PlaceHit {
  displayName?: { text: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  location?: { latitude: number; longitude: number };
  id?: string;
}

async function searchChain(
  chain: string,
  keywords: string[],
  center: Coords,
): Promise<NearbyStore | null> {
  // Try each keyword variant, return first hit
  for (const keyword of keywords) {
    try {
      const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask':
            'places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.regularOpeningHours,places.location,places.id',
        },
        body: JSON.stringify({
          textQuery: keyword,
          locationBias: {
            circle: { center: { latitude: center.lat, longitude: center.lng }, radius: RADIUS },
          },
          maxResultCount: 3,
        }),
      });

      const data = await res.json();
      const places: PlaceHit[] = data.places || [];

      // Find closest within 12 miles
      let closest: NearbyStore | null = null;
      let closestDist = Infinity;

      for (const p of places) {
        if (!p.location) continue;
        const dist = haversine(center.lat, center.lng, p.location.latitude, p.location.longitude);
        if (dist <= 12 && dist < closestDist) {
          closestDist = dist;
          const placeId = p.id || '';
          const todayHours = p.regularOpeningHours?.weekdayDescriptions;
          const dayIndex = new Date().getDay();
          // weekdayDescriptions is Mon=0..Sun=6 in Google, JS getDay is Sun=0..Sat=6
          const todayStr = todayHours?.[dayIndex === 0 ? 6 : dayIndex - 1] || null;
          closest = {
            chain,
            name: p.displayName?.text || chain,
            address: p.formattedAddress || '',
            distance: `${dist.toFixed(1)} mi away`,
            phone: p.nationalPhoneNumber || null,
            hours: todayStr,
            mapsUrl: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
            placeId,
          };
        }
      }

      if (closest) return closest;
    } catch {
      // continue to next keyword
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = inputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid ZIP' }, { status: 400 });
    }

    if (!GOOGLE_API_KEY) {
      return NextResponse.json({ stores: [] });
    }

    const coords = await geocodeZip(parsed.data.zip);
    if (!coords) {
      return NextResponse.json({ stores: [] });
    }

    // Search all chains in parallel
    const results = await Promise.all(
      CHAINS.map(({ chain, keywords }) => searchChain(chain, keywords, coords)),
    );

    const stores = results
      .filter((s): s is NearbyStore => s !== null)
      .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

    return NextResponse.json({ stores });
  } catch (err) {
    console.error('[API /nearby-stores] Error:', err);
    return NextResponse.json({ stores: [] });
  }
}
