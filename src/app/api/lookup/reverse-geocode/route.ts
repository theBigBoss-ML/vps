import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const NIGERIA_BOUNDS = {
  lat: { min: 4.0, max: 14.0 },
  lng: { min: 2.5, max: 15.0 },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lat, lng } = body;

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < NIGERIA_BOUNDS.lat.min ||
      lat > NIGERIA_BOUNDS.lat.max ||
      lng < NIGERIA_BOUNDS.lng.min ||
      lng > NIGERIA_BOUNDS.lng.max
    ) {
      return NextResponse.json(
        { error: 'invalid_coordinates', message: 'Coordinates must be within Nigeria.' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'NigerianPostalCodeFinder/1.0',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'geocoding_failed', message: 'Reverse geocoding failed.' },
        { status: 502 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      result: {
        address: data.display_name || '',
        state: data.address?.state || '',
        lga: data.address?.county || data.address?.city || '',
        postalCode: data.address?.postcode || null,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'server_error', message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
