import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UsageStats {
  generations: number;
  likes: number;
  dislikes: number;
  copies: number;
}

export function useUsageStats() {
  const [stats, setStats] = useState<UsageStats>({
    generations: 0,
    likes: 0,
    dislikes: 0,
    copies: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('usage_stats')
        .select('stat_type');

      if (error) throw error;

      const counts: UsageStats = {
        generations: 0,
        likes: 0,
        dislikes: 0,
        copies: 0,
      };

      data?.forEach((row) => {
        if (row.stat_type === 'generation') counts.generations++;
        else if (row.stat_type === 'like') counts.likes++;
        else if (row.stat_type === 'dislike') counts.dislikes++;
        else if (row.stat_type === 'copy') counts.copies++;
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

  const trackStat = useCallback(async (statType: 'generation' | 'like' | 'dislike' | 'copy', postalCode?: string) => {
    try {
      const { error } = await supabase
        .from('usage_stats')
        .insert({ stat_type: statType, postal_code: postalCode });

      if (error) throw error;

      // Optimistically update local state
      setStats(prev => ({
        ...prev,
        [statType === 'generation' ? 'generations' : 
         statType === 'like' ? 'likes' : 
         statType === 'dislike' ? 'dislikes' : 'copies']: 
        prev[statType === 'generation' ? 'generations' : 
             statType === 'like' ? 'likes' : 
             statType === 'dislike' ? 'dislikes' : 'copies'] + 1,
      }));
    } catch (error) {
      console.error('Error tracking stat:', error);
    }
  }, []);

  return { stats, loading, trackStat, refetchStats: fetchStats };
}
