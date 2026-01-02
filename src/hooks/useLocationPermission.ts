import { useState, useEffect, useCallback } from 'react';

export type LocationPermissionStatus = 
  | 'unknown'      // Haven't asked yet
  | 'prompt'       // Browser will show prompt
  | 'granted'      // User allowed
  | 'denied'       // User denied
  | 'unavailable'; // API not supported

interface UseLocationPermissionReturn {
  permissionStatus: LocationPermissionStatus;
  hasSeenModal: boolean;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  markModalSeen: () => void;
  checkPermission: () => Promise<LocationPermissionStatus>;
  requestPermission: () => Promise<boolean>;
}

const MODAL_SEEN_KEY = 'location-modal-seen';

export function useLocationPermission(): UseLocationPermissionReturn {
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>('unknown');
  const [hasSeenModal, setHasSeenModal] = useState(() => {
    return localStorage.getItem(MODAL_SEEN_KEY) === 'true';
  });
  const [showModal, setShowModal] = useState(false);

  const checkPermission = useCallback(async (): Promise<LocationPermissionStatus> => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setPermissionStatus('unavailable');
      return 'unavailable';
    }

    // Use Permissions API if available
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        const status = result.state as LocationPermissionStatus;
        setPermissionStatus(status);
        
        // Listen for changes
        result.addEventListener('change', () => {
          setPermissionStatus(result.state as LocationPermissionStatus);
        });
        
        return status;
      } catch {
        // Permissions API not supported for geolocation, default to prompt
        setPermissionStatus('prompt');
        return 'prompt';
      }
    }

    // Fallback: assume prompt state
    setPermissionStatus('prompt');
    return 'prompt';
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          setPermissionStatus('granted');
          resolve(true);
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setPermissionStatus('denied');
          }
          resolve(false);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000,
          maximumAge: 0 
        }
      );
    });
  }, []);

  const markModalSeen = useCallback(() => {
    localStorage.setItem(MODAL_SEEN_KEY, 'true');
    setHasSeenModal(true);
    setShowModal(false);
  }, []);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Show modal if first visit and permission not yet granted
  useEffect(() => {
    if (!hasSeenModal && permissionStatus !== 'granted' && permissionStatus !== 'unknown') {
      // Small delay to let page render first
      const timer = setTimeout(() => setShowModal(true), 500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenModal, permissionStatus]);

  return {
    permissionStatus,
    hasSeenModal,
    showModal,
    setShowModal,
    markModalSeen,
    checkPermission,
    requestPermission,
  };
}
