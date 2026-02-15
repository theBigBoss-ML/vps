import { NextResponse } from 'next/server';
import { getUsageStatsSnapshot } from '@/lib/usageStatsServer';

export async function GET() {
  try {
    const stats = await getUsageStatsSnapshot();
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json(
      { generations: 0, likes: 0, dislikes: 0, copies: 0 }
    );
  }
}
