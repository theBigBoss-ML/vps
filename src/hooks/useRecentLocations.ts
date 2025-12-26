import { useState, useEffect, useCallback } from 'react';
import { RecentLocation } from '@/types/location';

const STORAGE_KEY = 'nigeria-postal-code-recent';
const MAX_RECENT = 5;

export function useRecentLocations() {
  const [recentLocations, setRecentLocations] = useState<RecentLocation[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentLocations(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load recent locations:', e);
    }
  }, []);

  // Save to localStorage whenever it changes
  const saveLocations = useCallback((locations: RecentLocation[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
      setRecentLocations(locations);
    } catch (e) {
      console.error('Failed to save recent locations:', e);
    }
  }, []);

  const addRecentLocation = useCallback((location: Omit<RecentLocation, 'id' | 'timestamp'>) => {
    setRecentLocations(prev => {
      // Check if already exists (by postal code and address)
      const exists = prev.find(l => l.postalCode === location.postalCode && l.address === location.address);
      if (exists) {
        // Move to top
        const filtered = prev.filter(l => l.id !== exists.id);
        const updated = [{ ...exists, timestamp: new Date().toISOString() }, ...filtered];
        saveLocations(updated);
        return updated;
      }

      const newLocation: RecentLocation = {
        id: `recent-${Date.now()}`,
        ...location,
        timestamp: new Date().toISOString(),
      };

      const updated = [newLocation, ...prev].slice(0, MAX_RECENT);
      saveLocations(updated);
      return updated;
    });
  }, [saveLocations]);

  const clearRecentLocations = useCallback(() => {
    saveLocations([]);
  }, [saveLocations]);

  return {
    recentLocations,
    addRecentLocation,
    clearRecentLocations,
  };
}
