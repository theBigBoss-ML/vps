import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultPostalCodes } from '@/data/postalCodes';
import { extractAddressComponents, matchAddressToPostalCode, type AddressComponent } from '@/lib/matchingAlgorithm';
import type { LocationResult } from '@/types/location';

const GEOCODE_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

function buildLocationResult(
  data: {
    status?: string;
    results?: Array<{
      formatted_address?: string;
      address_components?: Array<{
        long_name?: string;
        short_name?: string;
        types?: string[];
      }>;
    }>;
  },
  lat: number,
  lng: number
): LocationResult | null {
  if (data.status !== 'OK' || !data.results || data.results.length === 0) {
    return null;
  }

  const result = data.results[0];
  const rawComponents = result.address_components || [];
  const safeComponents = rawComponents.filter((component): component is AddressComponent => {
    return Boolean(component?.long_name) && Array.isArray(component.types);
  });
  const components = extractAddressComponents(safeComponents);
  const formattedAddress = result.formatted_address || '';

  if (components.postalCode) {
    return {
      postalCode: components.postalCode,
      source: 'google',
      address: formattedAddress,
      lga: components.lga,
      area: components.area,
      state: components.state,
      confidence: 100,
      coordinates: { lat, lng },
      timestamp: new Date(),
    };
  }

  const matchResult = matchAddressToPostalCode(
    formattedAddress,
    components.lga,
    components.area,
    defaultPostalCodes
  );

  if (matchResult.postalCode && matchResult.confidence >= 50) {
    return {
      postalCode: matchResult.postalCode.postalCode,
      source: 'database',
      address: formattedAddress,
      lga: components.lga || matchResult.postalCode.lga,
      area: components.area || matchResult.postalCode.area,
      state: components.state || matchResult.postalCode.state,
      confidence: matchResult.confidence,
      coordinates: { lat, lng },
      timestamp: new Date(),
    };
  }

  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get('lat'));
  const lng = Number(searchParams.get('lng'));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { error: 'invalid_coordinates', message: 'Valid latitude and longitude are required.' },
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: 'missing_api_key',
        message: 'Google Maps API key is not configured on the server.',
      },
      { status: 500 }
    );
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `${GEOCODE_API_URL}?latlng=${lat},${lng}&key=${apiKey}`,
      { cache: 'no-store', signal: controller.signal }
    );
    clearTimeout(timer);

    const data = await response.json();
    const result = buildLocationResult(data, lat, lng);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Geocoding error:', error);
    const isTimeout = error instanceof DOMException && error.name === 'AbortError';
    return NextResponse.json(
      {
        error: 'geocoding_failed',
        message: isTimeout
          ? 'Google Maps API request timed out. Please try again.'
          : 'Unable to reach Google Maps Geocoding API.',
      },
      { status: 502 }
    );
  }
}
