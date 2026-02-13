import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

async function getCountForStatType(statType: UsageStatType): Promise<number> {
  const { count, error } = await supabase
    .from('usage_stats')
    .select('id', { count: 'exact', head: true })
    .eq('stat_type', statType);

  if (error) throw error;
  return count ?? 0;
}

export function useUsageStats() {
  const [stats, setStats] = useState<UsageStats>(EMPTY_USAGE_STATS);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const statTypes: UsageStatType[] = ['generation', 'like', 'dislike', 'copy'];
      const countEntries = await Promise.all(
        statTypes.map(async (statType) => {
          const count = await getCountForStatType(statType);
          return [statType, count] as const;
        })
      );

      const counts: UsageStats = { ...EMPTY_USAGE_STATS };
      countEntries.forEach(([statType, count]) => {
        counts[statTypeToStatsKey[statType]] = count;
      });

      setStats(counts);
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
      const { error } = await supabase
        .from('usage_stats')
        .insert({ stat_type: statType, postal_code: postalCode });

      if (error) throw error;

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
