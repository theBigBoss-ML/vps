import { LocationResult } from '@/types/location';
import { defaultPostalCodes } from '@/data/postalCodes';
import { extractAddressComponents, matchAddressToPostalCode } from './matchingAlgorithm';

const GEOCODE_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

export async function getPostalCodeFromCoordinates(
  lat: number,
  lng: number,
  apiKey: string
): Promise<LocationResult | null> {
  try {
    const response = await fetch(
      `${GEOCODE_API_URL}?latlng=${lat},${lng}&key=${apiKey}`
    );
    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return null;
    }

    const result = data.results[0];
    const components = extractAddressComponents(result.address_components || []);
    const formattedAddress = result.formatted_address || '';

    // Priority 1: Use Google's postal code directly
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

    // Priority 2: Fallback to database matching
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
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export async function testApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${GEOCODE_API_URL}?latlng=6.5244,3.3792&key=${apiKey}`
    );
    const data = await response.json();
    return data.status === 'OK' || data.status === 'ZERO_RESULTS';
  } catch {
    return false;
  }
}

// Rate limiting helper
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds

export async function rateLimitedGetPostalCode(
  lat: number,
  lng: number,
  apiKey: string
): Promise<LocationResult | null> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
  return getPostalCodeFromCoordinates(lat, lng, apiKey);
}
