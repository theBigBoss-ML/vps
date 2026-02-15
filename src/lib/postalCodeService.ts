import { LocationResult } from '@/types/location';

// Rate limiting helper
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 500; // 500ms

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchGeocode(lat: number, lng: number): Promise<LocationResult | null> {
  const response = await fetchWithTimeout(`/api/geocode?lat=${lat}&lng=${lng}`, {}, 10000);

  if (!response.ok) {
    let message = 'Unable to fetch geocoding results.';
    try {
      const data = await response.json();
      if (data?.message) {
        message = data.message;
      }
    } catch {
      // Ignore JSON parse errors
    }
    throw new Error(message);
  }

  const data = await response.json();
  const result = data?.result as LocationResult | null;

  if (result?.timestamp) {
    result.timestamp = new Date(result.timestamp);
  }

  return result;
}

async function fetchNominatimFallback(lat: number, lng: number): Promise<LocationResult | null> {
  try {
    const response = await fetchWithTimeout(
      '/api/lookup/reverse-geocode',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng }),
      },
      10000
    );

    if (!response.ok) return null;

    const data = await response.json();
    const result = data?.result;

    if (!result) return null;

    // Nominatim may return a postal code or at least address info
    if (result.postalCode) {
      return {
        postalCode: result.postalCode,
        source: 'database',
        address: result.address || '',
        lga: result.lga || '',
        area: result.lga || '',
        state: result.state || '',
        confidence: 70,
        coordinates: { lat, lng },
        timestamp: new Date(),
      };
    }

    // Even without postal code, return address info for the manual lookup fallback suggestion
    return null;
  } catch {
    return null;
  }
}

export async function rateLimitedGetPostalCode(
  lat: number,
  lng: number
): Promise<LocationResult | null> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }

  lastRequestTime = Date.now();

  // Try Google Maps geocoding with up to 2 retries
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await fetchGeocode(lat, lng);
      if (result) return result;
      // If result is null (no postal code found), don't retry — try fallback instead
      break;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Geocoding failed');
      if (attempt < 2) {
        // Exponential backoff: 1s, 2s
        await delay(1000 * (attempt + 1));
      }
    }
  }

  // Fallback to Nominatim if Google failed or returned no result
  const fallbackResult = await fetchNominatimFallback(lat, lng);
  if (fallbackResult) return fallbackResult;

  // If we had an error from Google (not just null result), throw it
  if (lastError) {
    throw lastError;
  }

  return null;
}
