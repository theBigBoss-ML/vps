import { useState, useCallback } from 'react';

interface GeolocationState {
  coordinates: { lat: number; lng: number } | null;
  error: string | null;
  isLoading: boolean;
}

interface UseGeolocationReturn extends GeolocationState {
  getCurrentPosition: () => Promise<{ lat: number; lng: number } | null>;
  clearError: () => void;
}

// Nigeria bounds for validation
const NIGERIA_BOUNDS = {
  minLat: 4.0,
  maxLat: 14.0,
  minLng: 2.5,
  maxLng: 15.0,
};

function isInNigeria(lat: number, lng: number): boolean {
  return (
    lat >= NIGERIA_BOUNDS.minLat &&
    lat <= NIGERIA_BOUNDS.maxLat &&
    lng >= NIGERIA_BOUNDS.minLng &&
    lng <= NIGERIA_BOUNDS.maxLng
  );
}

export function useGeolocation(): UseGeolocationReturn {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    isLoading: false,
  });

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Helper to get position with specific options
  const getPositionWithOptions = (options: PositionOptions): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  };

  const getCurrentPosition = useCallback(async (): Promise<{ lat: number; lng: number } | null> => {
    if (!navigator.geolocation) {
      setState({
        coordinates: null,
        error: 'Geolocation is not supported by your browser',
        isLoading: false,
      });
      return null;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      let position: GeolocationPosition;

      // Phase 1: Try high accuracy first (GPS) with shorter timeout
      try {
        position = await getPositionWithOptions({
          enableHighAccuracy: true,
          timeout: 10000, // 10 seconds for high accuracy
          maximumAge: 60000, // Cache for 1 minute
        });
      } catch (highAccuracyError) {
        // Phase 2: Fall back to low accuracy (faster, but less precise)
        console.log('High accuracy failed, trying low accuracy...');
        position = await getPositionWithOptions({
          enableHighAccuracy: false,
          timeout: 15000, // 15 seconds for low accuracy
          maximumAge: 300000, // Cache for 5 minutes
        });
      }

      const { latitude: lat, longitude: lng } = position.coords;

      if (!isInNigeria(lat, lng)) {
        setState({
          coordinates: null,
          error: 'Your location appears to be outside Nigeria. Please use manual search.',
          isLoading: false,
        });
        return null;
      }

      // Log accuracy for debugging
      console.log(`Location accuracy: ${position.coords.accuracy} meters`);

      setState({
        coordinates: { lat, lng },
        error: null,
        isLoading: false,
      });
      return { lat, lng };

    } catch (error) {
      const geoError = error as GeolocationPositionError;
      let errorMessage = 'Unable to detect your location';
      
      switch (geoError.code) {
        case geoError.PERMISSION_DENIED:
          errorMessage = 'Location access denied. Please enable location permissions or use manual search.';
          break;
        case geoError.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable. Please try again or use manual search.';
          break;
        case geoError.TIMEOUT:
          errorMessage = 'Location request timed out. Please try again or use manual search.';
          break;
      }

      setState({
        coordinates: null,
        error: errorMessage,
        isLoading: false,
      });
      return null;
    }
  }, []);

  return {
    ...state,
    getCurrentPosition,
    clearError,
  };
}
