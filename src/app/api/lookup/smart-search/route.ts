import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, input, place_id } = body;

    if (action === 'autocomplete') {
      if (!input || typeof input !== 'string' || input.length < 2) {
        return NextResponse.json(
          { error: 'invalid_input', message: 'Input must be at least 2 characters.' },
          { status: 400 }
        );
      }

      const supabase = createServerSupabase();
      const { data, error } = await supabase.functions.invoke('google-places', {
        body: { action: 'autocomplete', input },
      });

      if (error) {
        return NextResponse.json(
          { error: 'search_failed', message: 'Failed to fetch suggestions.' },
          { status: 502 }
        );
      }

      if (data?.status === 'OK' && data?.predictions) {
        return NextResponse.json({
          predictions: data.predictions.slice(0, 5).map((p: { place_id: string; description: string; structured_formatting?: { main_text: string; secondary_text: string } }) => ({
            place_id: p.place_id,
            description: p.description,
            structured_formatting: p.structured_formatting,
          })),
        });
      }

      return NextResponse.json({ predictions: [] });
    }

    if (action === 'details') {
      if (!place_id || typeof place_id !== 'string') {
        return NextResponse.json(
          { error: 'invalid_input', message: 'place_id is required.' },
          { status: 400 }
        );
      }

      const supabase = createServerSupabase();
      const { data, error } = await supabase.functions.invoke('google-places', {
        body: { action: 'details', place_id },
      });

      if (error) {
        return NextResponse.json(
          { error: 'details_failed', message: 'Failed to fetch place details.' },
          { status: 502 }
        );
      }

      if (data?.status === 'OK' && data?.result) {
        const details = data.result;
        const components = details.address_components || [];

        const postalCode = components.find((c: { types: string[] }) => c.types.includes('postal_code'))?.long_name;
        const locality = components.find((c: { types: string[] }) => c.types.includes('neighborhood') || c.types.includes('sublocality'))?.long_name;
        const lga = components.find((c: { types: string[] }) => c.types.includes('administrative_area_level_2'))?.long_name;
        const state = components.find((c: { types: string[] }) => c.types.includes('administrative_area_level_1'))?.long_name;

        return NextResponse.json({
          result: postalCode
            ? {
                postalCode,
                area: locality || '',
                locality: locality || '',
                lga: lga || '',
                state: state || '',
              }
            : null,
        });
      }

      return NextResponse.json({ result: null });
    }

    return NextResponse.json(
      { error: 'invalid_action', message: 'Action must be "autocomplete" or "details".' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: 'server_error', message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
