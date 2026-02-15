import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';

const VALID_STAT_TYPES = ['generation', 'like', 'dislike', 'copy'];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { statType, postalCode } = body;

    if (!statType || !VALID_STAT_TYPES.includes(statType)) {
      return NextResponse.json(
        { error: 'invalid_input', message: 'Invalid stat type.' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();
    const { error } = await supabase
      .from('usage_stats')
      .insert({
        stat_type: statType,
        postal_code: typeof postalCode === 'string' ? postalCode : undefined,
      });

    if (error) {
      return NextResponse.json(
        { error: 'tracking_failed', message: 'Failed to track stat.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'server_error', message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
