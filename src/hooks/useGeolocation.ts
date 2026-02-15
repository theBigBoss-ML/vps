import { useState, useCallback, useRef } from 'react';

interface GeolocationState {
  coordinates: { lat: number; lng: number } | null;
  error: string | null;
  isLoading: boolean;
  accuracy: number | null;
  accuracyLevel: 'high' | 'medium' | 'low' | null;
  progressMessage: string | null;
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

function attemptPosition(
  highAccuracy: boolean,
  timeoutMs: number,
  targetAccuracy: number,
  onProgress: (msg: string) => void,
  onUpdate: (accuracy: number) => void,
): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    let bestPosition: GeolocationPosition | null = null;
    let resolved = false;
    const startTime = Date.now();

    let watchId: number | null = null;

    const finalize = (position: GeolocationPosition | null) => {
      if (resolved) return;
      resolved = true;
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      resolve(position);
    };

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { accuracy } = position.coords;
        onUpdate(accuracy);

        // Keep the best position (lowest accuracy value = most precise)
        if (!bestPosition || accuracy < bestPosition.coords.accuracy) {
          bestPosition = position;
        }

        const elapsed = Date.now() - startTime;

        // Progress messages
        if (elapsed < 5000) {
          onProgress('Acquiring GPS signal...');
        } else if (elapsed < 12000) {
          onProgress('Refining location accuracy...');
        } else {
          onProgress('Almost there...');
        }

        // If we've achieved target accuracy, finalize immediately
        if (accuracy <= targetAccuracy) {
          finalize(bestPosition);
          return;
        }

        // Check if we've been trying long enough
        if (elapsed > timeoutMs * 0.7 && bestPosition) {
          finalize(bestPosition);
        }
      },
      (error) => {
        console.error('Geolocation error:', error.code, error.message);

        // If we have any position, use it despite the error
        if (bestPosition) {
          finalize(bestPosition);
          return;
        }

        finalize(null);
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout: timeoutMs,
        maximumAge: 0,
      }
    );

    // Safety timeout
    setTimeout(() => {
      if (!resolved) {
        finalize(bestPosition);
      }
    }, timeoutMs + 1000);
  });
}

export function useGeolocation(): UseGeolocationReturn {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    isLoading: false,
    accuracy: null,
    accuracyLevel: null,
    progressMessage: null,
  });

  const errorRef = useRef<string | null>(null);

  const clearError = useCallback(() => {
    errorRef.current = null;
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const getCurrentPosition = useCallback(async (forceHighAccuracy = true): Promise<{ lat: number; lng: number } | null> => {
    if (!navigator.geolocation) {
      const errMsg = 'Geolocation is not supported by your browser. Please use manual search.';
      errorRef.current = errMsg;
      setState({
        coordinates: null,
        error: errMsg,
        isLoading: false,
        accuracy: null,
        accuracyLevel: null,
        progressMessage: null,
      });
      return null;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, progressMessage: 'Acquiring GPS signal...' }));
    errorRef.current = null;

    const onProgress = (msg: string) => {
      setState(prev => ({ ...prev, progressMessage: msg }));
    };

    const onUpdate = (accuracy: number) => {
      setState(prev => ({ ...prev, accuracy, accuracyLevel: getAccuracyLevel(accuracy) }));
    };

    // Attempt 1: High accuracy (if requested)
    let position: GeolocationPosition | null = null;
    if (forceHighAccuracy) {
      position = await attemptPosition(
        true,
        25000, // 25s for high accuracy
        ACCURACY_THRESHOLDS.HIGH,
        onProgress,
        onUpdate,
      );
    }

    // Attempt 2: If high accuracy failed or wasn't requested, try medium accuracy
    if (!position) {
      onProgress('Trying alternative location method...');
      position = await attemptPosition(
        false,
        15000, // 15s for normal accuracy
        ACCURACY_THRESHOLDS.MEDIUM,
        onProgress,
        onUpdate,
      );
    }

    if (!position) {
      const errMsg = 'Location request timed out. Please try again or use manual search.';
      errorRef.current = errMsg;
      setState({
        coordinates: null,
        error: errMsg,
        isLoading: false,
        accuracy: null,
        accuracyLevel: null,
        progressMessage: null,
      });
      return null;
    }

    const { latitude: lat, longitude: lng, accuracy } = position.coords;

    if (!isInNigeria(lat, lng)) {
      const errMsg = 'Your location appears to be outside Nigeria. Please use manual search.';
      errorRef.current = errMsg;
      setState({
        coordinates: null,
        error: errMsg,
        isLoading: false,
        accuracy: null,
        accuracyLevel: null,
        progressMessage: null,
      });
      return null;
    }

    const accuracyLevel = getAccuracyLevel(accuracy);

    setState({
      coordinates: { lat, lng },
      error: null,
      isLoading: false,
      accuracy,
      accuracyLevel,
      progressMessage: null,
    });
    return { lat, lng };
  }, []);

  return {
    ...state,
    getCurrentPosition,
    clearError,
  };
}
