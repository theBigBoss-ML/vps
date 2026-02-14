import { useState, useEffect, useCallback, useRef } from 'react';

export type LocationPermissionStatus =
  | 'unknown'      // Haven't checked yet
  | 'prompt'       // Browser will show prompt
  | 'granted'      // User allowed
  | 'denied'       // User denied
  | 'unavailable'; // API not supported

export type ModalOpenReason = 'auto' | 'gps-attempt' | null;

interface PersistedPermissionState {
  userAction: 'none' | 'skipped' | 'granted' | 'denied';
  lastSeenAt: number;
}

interface UseLocationPermissionReturn {
  permissionStatus: LocationPermissionStatus;
  userAction: PersistedPermissionState['userAction'];
  showModal: boolean;
  modalOpenReason: ModalOpenReason;
  setShowModal: (show: boolean) => void;
  markModalSeen: (action?: 'skipped' | 'granted') => void;
  checkPermission: () => Promise<LocationPermissionStatus>;
  requestPermission: () => Promise<boolean>;
  showModalForGpsAttempt: () => void;
  handleModalOpenChange: (open: boolean) => void;
}

const STORAGE_KEY = 'location-permission-state';
const OLD_MODAL_SEEN_KEY = 'location-modal-seen';

function getPersistedState(): PersistedPermissionState {
  if (typeof window === 'undefined') return { userAction: 'none', lastSeenAt: 0 };
  try {
    // Migration from old boolean key
    const oldValue = localStorage.getItem(OLD_MODAL_SEEN_KEY);
    if (oldValue === 'true') {
      const migrated: PersistedPermissionState = { userAction: 'skipped', lastSeenAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      localStorage.removeItem(OLD_MODAL_SEEN_KEY);
      return migrated;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore corrupt data */ }
  return { userAction: 'none', lastSeenAt: 0 };
}

function setPersistedState(state: PersistedPermissionState) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

export function useLocationPermission(): UseLocationPermissionReturn {
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>('unknown');
  const [persisted, setPersisted] = useState<PersistedPermissionState>(getPersistedState);
  const [showModal, setShowModal] = useState(false);
  const [modalOpenReason, setModalOpenReason] = useState<ModalOpenReason>(null);

  // --- Permission listener setup (once on mount, with cleanup) ---
  const permissionResultRef = useRef<PermissionStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    let handleChange: (() => void) | null = null;
    let permResult: PermissionStatus | null = null;

    async function init() {
      if (!navigator.geolocation) {
        if (!cancelled) setPermissionStatus('unavailable');
        return;
      }
      if (!('permissions' in navigator)) {
        if (!cancelled) setPermissionStatus('prompt');
        return;
      }
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        if (cancelled) return;
        permResult = result;
        permissionResultRef.current = result;
        setPermissionStatus(result.state as LocationPermissionStatus);

        handleChange = () => {
          setPermissionStatus(result.state as LocationPermissionStatus);
        };
        result.addEventListener('change', handleChange);
      } catch {
        if (!cancelled) setPermissionStatus('prompt');
      }
    }

    init();

    return () => {
      cancelled = true;
      if (permResult && handleChange) {
        permResult.removeEventListener('change', handleChange);
      }
    };
  }, []);

  // --- Lightweight re-check (no listener added) ---
  const checkPermission = useCallback(async (): Promise<LocationPermissionStatus> => {
    if (!navigator.geolocation) {
      setPermissionStatus('unavailable');
      return 'unavailable';
    }

    // Use cached permission result if available
    if (permissionResultRef.current) {
      const status = permissionResultRef.current.state as LocationPermissionStatus;
      setPermissionStatus(status);
      return status;
    }

    // Fallback: re-query without adding a listener
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        const status = result.state as LocationPermissionStatus;
        setPermissionStatus(status);
        return status;
      } catch {
        setPermissionStatus('prompt');
        return 'prompt';
      }
    }

    setPermissionStatus('prompt');
    return 'prompt';
  }, []);

  // --- Request browser permission ---
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
          maximumAge: 0,
        }
      );
    });
  }, []);

  // --- Mark modal as seen with action type ---
  const markModalSeen = useCallback((action: 'skipped' | 'granted' = 'skipped') => {
    const newState: PersistedPermissionState = {
      userAction: action,
      lastSeenAt: Date.now(),
    };
    setPersistedState(newState);
    setPersisted(newState);
    setShowModal(false);
    setModalOpenReason(null);
  }, []);

  // --- Open modal for GPS button click ---
  const showModalForGpsAttempt = useCallback(() => {
    setModalOpenReason('gps-attempt');
    setShowModal(true);
  }, []);

  // --- Handle any modal close (backdrop, escape, X) ---
  const handleModalOpenChange = useCallback((open: boolean) => {
    if (!open) {
      // Only mark as skipped if user hasn't already been marked as granted
      if (persisted.userAction !== 'granted') {
        markModalSeen('skipped');
      } else {
        setShowModal(false);
        setModalOpenReason(null);
      }
    } else {
      setShowModal(true);
    }
  }, [persisted.userAction, markModalSeen]);

  // --- Auto-prompt: only first-time visitors with 'prompt' status ---
  useEffect(() => {
    if (permissionStatus === 'prompt' && persisted.userAction === 'none') {
      setModalOpenReason('auto');
      setShowModal(true);
    }
  }, [permissionStatus, persisted.userAction]);

  return {
    permissionStatus,
    userAction: persisted.userAction,
    showModal,
    modalOpenReason,
    setShowModal,
    markModalSeen,
    checkPermission,
    requestPermission,
    showModalForGpsAttempt,
    handleModalOpenChange,
  };
}
