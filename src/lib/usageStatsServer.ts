import { createServerSupabase } from "@/lib/supabaseServer";

type UsageStatType = "generation" | "like" | "dislike" | "copy";

export interface UsageStatsSnapshot {
  generations: number;
  likes: number;
  dislikes: number;
  copies: number;
}

const EMPTY_USAGE_STATS: UsageStatsSnapshot = {
  generations: 0,
  likes: 0,
  dislikes: 0,
  copies: 0,
};

const statTypeToSnapshotKey: Record<UsageStatType, keyof UsageStatsSnapshot> = {
  generation: "generations",
  like: "likes",
  dislike: "dislikes",
  copy: "copies",
};

export async function getUsageStatsSnapshot(): Promise<UsageStatsSnapshot> {
  const statTypes: UsageStatType[] = ["generation", "like", "dislike", "copy"];

  try {
    const supabase = createServerSupabase();

    const counts = await Promise.all(
      statTypes.map(async (statType) => {
        const { count, error } = await supabase
          .from("usage_stats")
          .select("id", { count: "exact", head: true })
          .eq("stat_type", statType);

        if (error) throw error;
        return [statType, count ?? 0] as const;
      })
    );

    const stats: UsageStatsSnapshot = { ...EMPTY_USAGE_STATS };
    for (const [statType, count] of counts) {
      stats[statTypeToSnapshotKey[statType]] = count;
    }

    return stats;
  } catch (error) {
    console.error("Error fetching usage stats for server schema:", error);
    return EMPTY_USAGE_STATS;
  }
}
