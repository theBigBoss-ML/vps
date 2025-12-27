import { Zap, ThumbsUp, Copy } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="py-8 px-4 bg-card/50 border-t border-border/50">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-center gap-8 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-8 w-16 bg-muted rounded" />
                <div className="h-4 w-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 bg-card/50 border-t border-border/50">
      <div className="container mx-auto max-w-4xl">
        <h3 className="text-center text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">
          App Usage Statistics
        </h3>
        <div className="grid grid-cols-3 gap-4 sm:gap-8">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-nigeria-green" />
              <span className="text-2xl sm:text-3xl font-bold text-foreground">{formatNumber(generations)}</span>
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground text-center">Codes Generated</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-nigeria-green" />
              <span className="text-2xl sm:text-3xl font-bold text-foreground">{formatNumber(likes)}</span>
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground text-center">Helpful Votes</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Copy className="h-5 w-5 text-nigeria-green" />
              <span className="text-2xl sm:text-3xl font-bold text-foreground">{formatNumber(copies)}</span>
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground text-center">Codes Copied</span>
          </div>
        </div>
      </div>
    </div>
  );
}
