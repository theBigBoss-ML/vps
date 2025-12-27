import { useState, useCallback, useRef } from 'react';

interface GeolocationState {
  coordinates: { lat: number; lng: number } | null;
  error: string | null;
  isLoading: boolean;
  accuracy: number | null;
  accuracyLevel: 'high' | 'medium' | 'low' | null;
}

interface UseGeolocationReturn extends GeolocationState {
  getCurrentPosition: (forceHighAccuracy?: boolean) => Promise<{ lat: number; lng: number } | null>;
  clearError: () => void;
}

// Nigeria bounds for validation
const NIGERIA_BOUNDS = {
  minLat: 4.0,
  maxLat: 14.0,
  minLng: 2.5,
  maxLng: 15.0,
};

// Accuracy thresholds in meters
const ACCURACY_THRESHOLDS = {
  HIGH: 50,      // < 50m = high accuracy (GPS)
  MEDIUM: 200,   // < 200m = medium accuracy
  // > 200m = low accuracy (IP-based or cell tower)
};

function isInNigeria(lat: number, lng: number): boolean {
  return (
    lat >= NIGERIA_BOUNDS.minLat &&
    lat <= NIGERIA_BOUNDS.maxLat &&
    lng >= NIGERIA_BOUNDS.minLng &&
    lng <= NIGERIA_BOUNDS.maxLng
  );
}

function getAccuracyLevel(accuracy: number): 'high' | 'medium' | 'low' {
  if (accuracy <= ACCURACY_THRESHOLDS.HIGH) return 'high';
  if (accuracy <= ACCURACY_THRESHOLDS.MEDIUM) return 'medium';
  return 'low';
}

export function useGeolocation(): UseGeolocationReturn {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    isLoading: false,
    accuracy: null,
    accuracyLevel: null,
  });

  const watchIdRef = useRef<number | null>(null);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const getCurrentPosition = useCallback(async (forceHighAccuracy = true): Promise<{ lat: number; lng: number } | null> => {
    if (!navigator.geolocation) {
      setState({
        coordinates: null,
        error: 'Geolocation is not supported by your browser. Please use manual search.',
        isLoading: false,
        accuracy: null,
        accuracyLevel: null,
      });
      return null;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    stopWatching();

    return new Promise((resolve) => {
      let bestPosition: GeolocationPosition | null = null;
      let resolved = false;
      const startTime = Date.now();
      
      // Timeout duration based on accuracy preference
      const maxWaitTime = forceHighAccuracy ? 20000 : 15000; // 20s for high accuracy, 15s for normal
      const targetAccuracy = forceHighAccuracy ? ACCURACY_THRESHOLDS.HIGH : ACCURACY_THRESHOLDS.MEDIUM;

      const finalize = (position: GeolocationPosition | null, errorMsg?: string) => {
        if (resolved) return;
        resolved = true;
        stopWatching();

        if (!position) {
          setState({
            coordinates: null,
            error: errorMsg || 'Unable to detect your location. Please try again or use manual search.',
            isLoading: false,
            accuracy: null,
            accuracyLevel: null,
          });
          resolve(null);
          return;
        }

        const { latitude: lat, longitude: lng, accuracy } = position.coords;

        if (!isInNigeria(lat, lng)) {
          setState({
            coordinates: null,
            error: 'Your location appears to be outside Nigeria. Please use manual search.',
            isLoading: false,
            accuracy: null,
            accuracyLevel: null,
          });
          resolve(null);
          return;
        }

        const accuracyLevel = getAccuracyLevel(accuracy);
        console.log(`Final location - Accuracy: ${accuracy.toFixed(0)}m (${accuracyLevel}), Time: ${Date.now() - startTime}ms`);

        setState({
          coordinates: { lat, lng },
          error: null,
          isLoading: false,
          accuracy,
          accuracyLevel,
        });
        resolve({ lat, lng });
      };

      // Use watchPosition for progressive refinement
      // This gets multiple readings and picks the best one
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { accuracy } = position.coords;
          console.log(`Location update - Accuracy: ${accuracy.toFixed(0)}m`);

          // Keep the best position (lowest accuracy value = most precise)
          if (!bestPosition || accuracy < bestPosition.coords.accuracy) {
            bestPosition = position;
          }

          // If we've achieved target accuracy, finalize immediately
          if (accuracy <= targetAccuracy) {
            console.log(`Target accuracy (${targetAccuracy}m) achieved!`);
            finalize(bestPosition);
            return;
          }

          // Check if we've been trying long enough
          const elapsed = Date.now() - startTime;
          if (elapsed > maxWaitTime * 0.7 && bestPosition) {
            // We've waited 70% of max time and have a reading, finalize
            console.log('Time threshold reached, using best available position');
            finalize(bestPosition);
          }
        },
        (error) => {
          console.error('Geolocation error:', error.code, error.message);
          
          // If we have any position, use it despite the error
          if (bestPosition) {
            console.log('Using best position despite error');
            finalize(bestPosition);
            return;
          }

          let errorMessage = 'Unable to detect your location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permissions in your browser settings, then try again.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location unavailable. Please ensure GPS is enabled and try again, or use manual search.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please move to an area with better signal or use manual search.';
              break;
          }

          finalize(null, errorMessage);
        },
        {
          enableHighAccuracy: forceHighAccuracy,
          timeout: maxWaitTime,
          maximumAge: 0, // Always get fresh position
        }
      );

      // Safety timeout - finalize with best available position
      setTimeout(() => {
        if (!resolved) {
          console.log('Safety timeout reached');
          if (bestPosition) {
            finalize(bestPosition);
          } else {
            finalize(null, 'Location request timed out. Please try again or use manual search.');
          }
        }
      }, maxWaitTime + 1000);
    });
  }, [stopWatching]);

  return {
    ...state,
    getCurrentPosition,
    clearError,
  };
}
