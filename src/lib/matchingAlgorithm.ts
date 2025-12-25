import { PostalCode } from '@/data/postalCodes';

// Common abbreviations and their expansions
const abbreviations: Record<string, string[]> = {
  'vi': ['victoria island'],
  'gra': ['government reservation area', 'government reserved area'],
  'lekki ph1': ['lekki phase 1', 'lekki phase one'],
  'lekki ph2': ['lekki phase 2', 'lekki phase two'],
  'vgc': ['victoria garden city'],
  'festac': ['festival town'],
  'unilag': ['university of lagos'],
  'luth': ['lagos university teaching hospital'],
  'mmia': ['murtala muhammed international airport'],
  'cms': ['church missionary society'],
};

// Normalize text for comparison
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Expand abbreviations
export function expandAbbreviations(text: string): string[] {
  const normalized = normalizeText(text);
  const variations = [normalized];
  
  Object.entries(abbreviations).forEach(([abbr, expansions]) => {
    if (normalized.includes(abbr)) {
      expansions.forEach(expansion => {
        variations.push(normalized.replace(abbr, expansion));
      });
    }
    expansions.forEach(expansion => {
      if (normalized.includes(expansion)) {
        variations.push(normalized.replace(expansion, abbr));
      }
    });
  });
  
  return [...new Set(variations)];
}

// Calculate similarity between two strings (Levenshtein distance based)
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  
  if (s1 === s2) return 100;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 100;
  
  // Check if one contains the other
  if (longer.includes(shorter) || shorter.includes(longer)) {
    return 85 + (shorter.length / longer.length) * 15;
  }
  
  // Word-level matching
  const words1 = s1.split(' ');
  const words2 = s2.split(' ');
  const commonWords = words1.filter(w => words2.includes(w));
  const wordSimilarity = (commonWords.length * 2) / (words1.length + words2.length) * 100;
  
  return Math.min(wordSimilarity, 100);
}

export interface MatchResult {
  postalCode: PostalCode | null;
  confidence: number;
  matchType: 'exact' | 'area' | 'lga' | 'fuzzy' | 'none';
}

// Main matching function
export function matchAddressToPostalCode(
  googleAddress: string,
  googleLga: string | null,
  googleArea: string | null,
  postalCodes: PostalCode[]
): MatchResult {
  if (!googleAddress && !googleLga && !googleArea) {
    return { postalCode: null, confidence: 0, matchType: 'none' };
  }

  const addressVariations = expandAbbreviations(googleAddress || '');
  const lgaVariations = googleLga ? expandAbbreviations(googleLga) : [];
  const areaVariations = googleArea ? expandAbbreviations(googleArea) : [];

  let bestMatch: MatchResult = { postalCode: null, confidence: 0, matchType: 'none' };

  for (const pc of postalCodes) {
    const pcLgaNorm = normalizeText(pc.lga);
    const pcAreaNorm = normalizeText(pc.area);
    const pcLocalityNorm = normalizeText(pc.locality);
    const pcStreetNorm = pc.street ? normalizeText(pc.street) : '';

    // Check LGA match first
    const lgaMatch = lgaVariations.some(v => 
      pcLgaNorm.includes(v) || v.includes(pcLgaNorm) || calculateSimilarity(v, pcLgaNorm) > 80
    );

    if (!lgaMatch) continue;

    // Try exact match (LGA + Area + Locality/Street)
    for (const addrVar of addressVariations) {
      const hasAreaMatch = pcAreaNorm && addrVar.includes(pcAreaNorm);
      const hasLocalityMatch = pcLocalityNorm && addrVar.includes(pcLocalityNorm);
      const hasStreetMatch = pcStreetNorm && addrVar.includes(pcStreetNorm);

      if (hasAreaMatch && (hasLocalityMatch || hasStreetMatch)) {
        const confidence = 95;
        if (confidence > bestMatch.confidence) {
          bestMatch = { postalCode: pc, confidence, matchType: 'exact' };
        }
      } else if (hasAreaMatch && hasLocalityMatch) {
        const confidence = 90;
        if (confidence > bestMatch.confidence) {
          bestMatch = { postalCode: pc, confidence, matchType: 'exact' };
        }
      }
    }

    // Try area match (LGA + Area)
    const areaMatch = areaVariations.some(v => 
      calculateSimilarity(v, pcAreaNorm) > 70 ||
      v.includes(pcAreaNorm) || 
      pcAreaNorm.includes(v)
    );

    if (areaMatch) {
      const confidence = 75 + calculateSimilarity(googleArea || '', pc.area) * 0.1;
      if (confidence > bestMatch.confidence) {
        bestMatch = { postalCode: pc, confidence: Math.min(confidence, 85), matchType: 'area' };
      }
    }

    // LGA only match
    if (lgaMatch && bestMatch.confidence < 60) {
      const confidence = 55;
      if (confidence > bestMatch.confidence) {
        bestMatch = { postalCode: pc, confidence, matchType: 'lga' };
      }
    }

    // Fuzzy match on address
    for (const addrVar of addressVariations) {
      const localitySim = calculateSimilarity(addrVar, pcLocalityNorm);
      const areaSim = calculateSimilarity(addrVar, pcAreaNorm);
      const maxSim = Math.max(localitySim, areaSim);
      
      if (maxSim > 60 && lgaMatch) {
        const confidence = 40 + maxSim * 0.3;
        if (confidence > bestMatch.confidence) {
          bestMatch = { postalCode: pc, confidence: Math.min(confidence, 70), matchType: 'fuzzy' };
        }
      }
    }
  }

  return bestMatch;
}

// Extract components from Google address
export function extractAddressComponents(addressComponents: any[]): {
  lga: string | null;
  area: string | null;
  street: string | null;
  postalCode: string | null;
  state: string | null;
} {
  let lga: string | null = null;
  let area: string | null = null;
  let street: string | null = null;
  let postalCode: string | null = null;
  let state: string | null = null;

  for (const component of addressComponents) {
    const types = component.types || [];
    const name = component.long_name;

    if (types.includes('administrative_area_level_2')) {
      lga = name;
    } else if (types.includes('sublocality_level_1') || types.includes('neighborhood')) {
      area = name;
    } else if (types.includes('sublocality') && !area) {
      area = name;
    } else if (types.includes('route')) {
      street = name;
    } else if (types.includes('postal_code')) {
      postalCode = name;
    } else if (types.includes('administrative_area_level_1')) {
      state = name;
    } else if (types.includes('locality') && !area) {
      area = name;
    }
  }

  return { lga, area, street, postalCode, state };
}
