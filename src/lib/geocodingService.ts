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
        matchedPostalCode: null,
        confidence: 0,
        status: 'failed',
        matchType: 'none',
        failureReason: 'Google API did not return an address',
        rawGoogleResponse: geocodeResult.raw,
      };
    } else {
      const matchResult = matchAddressToPostalCode(
        geocodeResult.formattedAddress,
        geocodeResult.components.lga,
        geocodeResult.components.area,
        postalCodes
      );

      let status: 'success' | 'partial' | 'failed';
      let failureReason: string | null = null;

      if (matchResult.confidence >= 80) {
        status = 'success';
      } else if (matchResult.confidence >= 50) {
        status = 'partial';
        failureReason = matchResult.matchType === 'lga' 
          ? 'Only LGA-level match available'
          : 'Partial area match only';
      } else {
        status = 'failed';
        if (!matchResult.postalCode) {
          failureReason = geocodeResult.components.lga 
            ? 'No postal code in database for this LGA/area'
            : 'Could not identify LGA from Google address';
        } else {
          failureReason = 'Address format does not match database entries';
        }
      }

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
        matchedPostalCode: matchResult.postalCode?.postalCode || null,
        confidence: matchResult.confidence,
        status,
        matchType: matchResult.matchType,
        failureReason,
        rawGoogleResponse: geocodeResult.raw,
      };
    }

    results.push(result);

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return results;
}

export function calculateMetrics(results: TestResult[]): {
  total: number;
  highConfidence: number;
  mediumConfidence: number;
  lowConfidence: number;
  googleReturnedPostalCode: number;
  successRate: number;
  viability: 'viable' | 'conditional' | 'not-viable';
} {
  const total = results.length;
  const highConfidence = results.filter(r => r.confidence >= 80).length;
  const mediumConfidence = results.filter(r => r.confidence >= 50 && r.confidence < 80).length;
  const lowConfidence = results.filter(r => r.confidence < 50).length;
  const googleReturnedPostalCode = results.filter(r => r.googlePostalCode !== null).length;
  const successRate = total > 0 ? (highConfidence / total) * 100 : 0;

  let viability: 'viable' | 'conditional' | 'not-viable';
  if (successRate >= 90) {
    viability = 'viable';
  } else if (successRate >= 80) {
    viability = 'conditional';
  } else {
    viability = 'not-viable';
  }

  return {
    total,
    highConfidence,
    mediumConfidence,
    lowConfidence,
    googleReturnedPostalCode,
    successRate,
    viability,
  };
}

export function analyzeFailures(results: TestResult[]): {
  reason: string;
  count: number;
  locations: string[];
}[] {
  const failedResults = results.filter(r => r.status === 'failed' || r.status === 'partial');
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
