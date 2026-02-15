import { LocationResult } from '@/types/location';

// Rate limiting helper
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds

export async function rateLimitedGetPostalCode(
  lat: number,
  lng: number
): Promise<LocationResult | null> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }

  lastRequestTime = Date.now();
  const response = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);

  if (!response.ok) {
    let message = 'Unable to fetch geocoding results.';
    try {
      const data = await response.json();
      if (data?.message) {
        message = data.message;
      }
    } catch {
      // Ignore JSON parse errors and fall back to default message.
    }
    throw new Error(message);
  }

  const data = await response.json();
  const result = data?.result as LocationResult | null;

  if (!result) {
    return null;
  }

  if (result.timestamp) {
    result.timestamp = new Date(result.timestamp);
  }

  return result;
}
