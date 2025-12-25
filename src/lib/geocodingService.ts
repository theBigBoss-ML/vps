import { TestCoordinate } from '@/data/testCoordinates';
import { PostalCode } from '@/data/postalCodes';
import { TestResult } from '@/types/validation';
import { matchAddressToPostalCode, extractAddressComponents } from './matchingAlgorithm';

const GEOCODE_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

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

export async function reverseGeocode(
  lat: number,
  lng: number,
  apiKey: string
): Promise<{
  formattedAddress: string | null;
  components: ReturnType<typeof extractAddressComponents>;
  raw: any;
}> {
  try {
    const response = await fetch(
      `${GEOCODE_API_URL}?latlng=${lat},${lng}&key=${apiKey}`
    );
    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return {
        formattedAddress: null,
        components: { lga: null, area: null, street: null, postalCode: null, state: null },
        raw: data,
      };
    }

    const result = data.results[0];
    const components = extractAddressComponents(result.address_components || []);

    return {
      formattedAddress: result.formatted_address || null,
      components,
      raw: data,
    };
  } catch (error) {
    return {
      formattedAddress: null,
      components: { lga: null, area: null, street: null, postalCode: null, state: null },
      raw: { error: String(error) },
    };
  }
}

export async function runValidationTest(
  coordinates: TestCoordinate[],
  postalCodes: PostalCode[],
  apiKey: string,
  onProgress: (current: number, total: number, locationName: string) => void
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  for (let i = 0; i < coordinates.length; i++) {
    const coord = coordinates[i];
    onProgress(i + 1, coordinates.length, coord.name);

    const geocodeResult = await reverseGeocode(coord.latitude, coord.longitude, apiKey);
    
    let result: TestResult;

    if (!geocodeResult.formattedAddress) {
      // API failed completely
      result = {
        id: `result-${coord.id}`,
        coordinateId: coord.id,
        locationName: coord.name,
        latitude: coord.latitude,
        longitude: coord.longitude,
        googleAddress: null,
        googlePostalCode: null,
        googleLga: null,
        googleArea: null,
        finalPostalCode: null,
        postalCodeSource: 'none',
        fallbackPostalCode: null,
        status: 'failed',
        failureReason: 'Google API did not return an address',
        rawGoogleResponse: geocodeResult.raw,
      };
    } else if (geocodeResult.components.postalCode) {
      // SUCCESS: Google returned a postal code directly
      result = {
        id: `result-${coord.id}`,
        coordinateId: coord.id,
        locationName: coord.name,
        latitude: coord.latitude,
        longitude: coord.longitude,
        googleAddress: geocodeResult.formattedAddress,
        googlePostalCode: geocodeResult.components.postalCode,
        googleLga: geocodeResult.components.lga,
        googleArea: geocodeResult.components.area,
        finalPostalCode: geocodeResult.components.postalCode,
        postalCodeSource: 'google',
        fallbackPostalCode: null,
        status: 'success',
        failureReason: null,
        rawGoogleResponse: geocodeResult.raw,
      };
    } else {
      // Google didn't return postal code - try database fallback
      const matchResult = matchAddressToPostalCode(
        geocodeResult.formattedAddress,
        geocodeResult.components.lga,
        geocodeResult.components.area,
        postalCodes
      );

      if (matchResult.postalCode && matchResult.confidence >= 50) {
        // FALLBACK SUCCESS: Found in database
        result = {
          id: `result-${coord.id}`,
          coordinateId: coord.id,
          locationName: coord.name,
          latitude: coord.latitude,
          longitude: coord.longitude,
          googleAddress: geocodeResult.formattedAddress,
          googlePostalCode: null,
          googleLga: geocodeResult.components.lga,
          googleArea: geocodeResult.components.area,
          finalPostalCode: matchResult.postalCode.postalCode,
          postalCodeSource: 'database',
          fallbackPostalCode: matchResult.postalCode.postalCode,
          status: 'fallback',
          failureReason: null,
          rawGoogleResponse: geocodeResult.raw,
        };
      } else {
        // FAILED: No postal code from Google and no database match
        result = {
          id: `result-${coord.id}`,
          coordinateId: coord.id,
          locationName: coord.name,
          latitude: coord.latitude,
          longitude: coord.longitude,
          googleAddress: geocodeResult.formattedAddress,
          googlePostalCode: null,
          googleLga: geocodeResult.components.lga,
          googleArea: geocodeResult.components.area,
          finalPostalCode: null,
          postalCodeSource: 'none',
          fallbackPostalCode: null,
          status: 'failed',
          failureReason: geocodeResult.components.lga 
            ? 'Google did not return postal code and no database match found'
            : 'Could not identify LGA from Google address',
          rawGoogleResponse: geocodeResult.raw,
        };
      }
    }

    results.push(result);

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return results;
}

export function calculateMetrics(results: TestResult[]): {
  total: number;
  googleReturned: number;
  databaseFallback: number;
  failed: number;
  googleRate: number;
  totalSuccessRate: number;
  viability: 'viable' | 'conditional' | 'not-viable';
} {
  const total = results.length;
  const googleReturned = results.filter(r => r.postalCodeSource === 'google').length;
  const databaseFallback = results.filter(r => r.postalCodeSource === 'database').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const googleRate = total > 0 ? (googleReturned / total) * 100 : 0;
  const totalSuccessRate = total > 0 ? ((googleReturned + databaseFallback) / total) * 100 : 0;

  let viability: 'viable' | 'conditional' | 'not-viable';
  if (googleRate >= 85) {
    viability = 'viable';
  } else if (googleRate >= 75) {
    viability = 'conditional';
  } else {
    viability = 'not-viable';
  }

  return {
    total,
    googleReturned,
    databaseFallback,
    failed,
    googleRate,
    totalSuccessRate,
    viability,
  };
}

export function analyzeFailures(results: TestResult[]): {
  reason: string;
  count: number;
  locations: string[];
}[] {
  const failedResults = results.filter(r => r.status === 'failed');
  const reasonMap = new Map<string, string[]>();

  for (const result of failedResults) {
    const reason = result.failureReason || 'Unknown reason';
    if (!reasonMap.has(reason)) {
      reasonMap.set(reason, []);
    }
    reasonMap.get(reason)!.push(result.locationName);
  }

  return Array.from(reasonMap.entries())
    .map(([reason, locations]) => ({
      reason,
      count: locations.length,
      locations,
    }))
    .sort((a, b) => b.count - a.count);
}
