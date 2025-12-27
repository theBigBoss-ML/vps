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

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;

          if (!isInNigeria(lat, lng)) {
            setState({
              coordinates: null,
              error: 'Your location appears to be outside Nigeria. Please use manual search.',
              isLoading: false,
            });
            resolve(null);
            return;
          }

          setState({
            coordinates: { lat, lng },
            error: null,
            isLoading: false,
          });
          resolve({ lat, lng });
        },
        (error) => {
          let errorMessage = 'Unable to detect your location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permissions or use manual search.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please try again or use manual search.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
          }

          setState({
            coordinates: null,
            error: errorMessage,
            isLoading: false,
          });
          resolve(null);
        },
        {
          enableHighAccuracy: false, // Use false for faster response
          timeout: 30000, // Increased to 30 seconds
          maximumAge: 300000, // Cache for 5 minutes
        }
      );
    });
  }, []);

  return {
    ...state,
    getCurrentPosition,
    clearError,
  };
}
