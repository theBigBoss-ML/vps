import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultPostalCodes } from '@/data/postalCodes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { state, lga } = body;

    if (!state || !lga || typeof state !== 'string' || typeof lga !== 'string') {
      return NextResponse.json(
        { error: 'invalid_input', message: 'State and LGA are required.' },
        { status: 400 }
      );
    }

    const normalizedState = state.toLowerCase().trim();
    const normalizedLga = lga.toLowerCase().trim();

    const match = defaultPostalCodes.find(
      (pc) =>
        pc.state.toLowerCase() === normalizedState &&
        pc.lga.toLowerCase() === normalizedLga
    );

    if (!match) {
      return NextResponse.json({ result: null });
    }

    return NextResponse.json({
      result: {
        postalCode: match.postalCode,
        source: 'database' as const,
        address: `${match.locality}, ${match.area}, ${match.lga}, ${match.state}`,
        lga: match.lga,
        area: match.area,
        state: match.state,
        confidence: 100,
        coordinates: { lat: 0, lng: 0 },
        timestamp: new Date(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'server_error', message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
