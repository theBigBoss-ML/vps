import { Lightning, ThumbsUp, Copy } from '@phosphor-icons/react';

interface UsageStatsDisplayProps {
  generations: number;
  likes: number;
  copies: number;
  loading?: boolean;
}

export function UsageStatsDisplay({ generations, likes, copies, loading }: UsageStatsDisplayProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  const generationValue = loading ? "--" : formatNumber(generations);
  const likesValue = loading ? "--" : formatNumber(likes);
  const copiesValue = loading ? "--" : formatNumber(copies);

  return (
    <div className="py-8 px-4 bg-card/50 border-t border-border/50">
      <div className="container mx-auto max-w-4xl">
        <h3 className="text-center text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">
          App Usage Statistics
        </h3>
        <div className="grid grid-cols-3 gap-4 sm:gap-8">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Lightning className="h-5 w-5 text-nigeria-green" />
              <span className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums min-w-[2.6ch] text-right">{generationValue}</span>
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground text-center">Codes Generated</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-nigeria-green" />
              <span className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums min-w-[2.6ch] text-right">{likesValue}</span>
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground text-center">Helpful Votes</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Copy className="h-5 w-5 text-nigeria-green" />
              <span className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums min-w-[2.6ch] text-right">{copiesValue}</span>
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground text-center">Codes Copied</span>
          </div>
        </div>
      </div>
    </div>
  );
}
