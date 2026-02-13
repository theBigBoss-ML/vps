import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

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

async function getCountForStatType(
  supabase: ReturnType<typeof createClient<Database>>,
  statType: UsageStatType
): Promise<number> {
  const { count, error } = await supabase
    .from("usage_stats")
    .select("id", { count: "exact", head: true })
    .eq("stat_type", statType);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function getUsageStatsSnapshot(): Promise<UsageStatsSnapshot> {
  const statTypes: UsageStatType[] = ["generation", "like", "dislike", "copy"];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return EMPTY_USAGE_STATS;
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  try {
    const counts = await Promise.all(
      statTypes.map(async (statType) => {
        const count = await getCountForStatType(supabase, statType);
        return [statType, count] as const;
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
