import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { nigeriaStates, getLgasByState } from '@/data/nigeriaStates';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stateName = searchParams.get('state');

  if (stateName) {
    const lgas = getLgasByState(stateName);
    return NextResponse.json({ lgas });
  }

  return NextResponse.json({
    states: nigeriaStates.map((s) => s.name),
  });
}
