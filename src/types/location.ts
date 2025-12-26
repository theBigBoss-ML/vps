export interface LocationResult {
  postalCode: string;
  source: 'google' | 'database';
  address: string;
  lga: string | null;
  area: string | null;
  state: string | null;
  confidence: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  timestamp: Date;
}

export interface RecentLocation {
  id: string;
  postalCode: string;
  address: string;
  area: string | null;
  lga: string | null;
  timestamp: string;
}

export interface NigeriaState {
  name: string;
  lgas: string[];
}

export type LookupStatus = 'idle' | 'detecting' | 'geocoding' | 'success' | 'error';
