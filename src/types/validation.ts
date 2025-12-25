export interface TestResult {
  id: string;
  coordinateId: string;
  locationName: string;
  latitude: number;
  longitude: number;
  googleAddress: string | null;
  googlePostalCode: string | null;
  googleLga: string | null;
  googleArea: string | null;
  matchedPostalCode: string | null;
  confidence: number;
  status: 'success' | 'partial' | 'failed';
  matchType: 'exact' | 'area' | 'lga' | 'fuzzy' | 'none';
  failureReason: string | null;
  rawGoogleResponse: any;
}

export interface TestProgress {
  current: number;
  total: number;
  status: 'idle' | 'testing' | 'completed' | 'error';
  currentLocation?: string;
}

export interface TestMetrics {
  total: number;
  highConfidence: number;
  mediumConfidence: number;
  lowConfidence: number;
  googleReturnedPostalCode: number;
  successRate: number;
  viability: 'viable' | 'conditional' | 'not-viable';
}

export interface FailureAnalysis {
  reason: string;
  count: number;
  locations: string[];
}
