import { useState, useEffect, useCallback } from 'react';

interface UsageStats {
  generations: number;
  likes: number;
  dislikes: number;
  copies: number;
}

type UsageStatType = 'generation' | 'like' | 'dislike' | 'copy';

const EMPTY_USAGE_STATS: UsageStats = {
  generations: 0,
  likes: 0,
  dislikes: 0,
  copies: 0,
};

const statTypeToStatsKey: Record<UsageStatType, keyof UsageStats> = {
  generation: 'generations',
  like: 'likes',
  dislike: 'dislikes',
  copy: 'copies',
};

export function useUsageStats() {
  const [stats, setStats] = useState<UsageStats>(EMPTY_USAGE_STATS);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats({
        generations: data.generations ?? 0,
        likes: data.likes ?? 0,
        dislikes: data.dislikes ?? 0,
        copies: data.copies ?? 0,
      });
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const trackStat = useCallback(async (statType: UsageStatType, postalCode?: string) => {
    try {
      await fetch('/api/stats/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statType, postalCode }),
      });

      // Optimistically update local state
      setStats(prev => ({
        ...prev,
        [statTypeToStatsKey[statType]]: prev[statTypeToStatsKey[statType]] + 1,
      }));
    } catch (error) {
      console.error('Error tracking stat:', error);
    }
  }, []);

  return { stats, loading, trackStat, refetchStats: fetchStats };
}
