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
  finalPostalCode: string | null;
  postalCodeSource: 'google' | 'database' | 'none';
  fallbackPostalCode: string | null;
  status: 'success' | 'fallback' | 'failed';
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
  googleReturned: number;
  databaseFallback: number;
  failed: number;
  googleRate: number;
  totalSuccessRate: number;
  viability: 'viable' | 'conditional' | 'not-viable';
}

export interface FailureAnalysis {
  reason: string;
  count: number;
  locations: string[];
}
