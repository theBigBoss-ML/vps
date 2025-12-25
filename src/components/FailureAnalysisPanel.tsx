import { AlertTriangle, MapPin, ChevronRight } from 'lucide-react';

interface FailureAnalysis {
  reason: string;
  count: number;
  locations: string[];
}

interface FailureAnalysisPanelProps {
  failures: FailureAnalysis[];
}

export function FailureAnalysisPanel({ failures }: FailureAnalysisPanelProps) {
  if (failures.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <div className="text-success text-lg font-medium">🎉 No failures to analyze!</div>
        <p className="text-muted-foreground text-sm mt-1">All tests passed with good confidence.</p>
      </div>
    );
  }

  const totalFailures = failures.reduce((sum, f) => sum + f.count, 0);

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-destructive/20 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold">Failure Analysis</h3>
            <p className="text-sm text-muted-foreground">{totalFailures} failed or partial matches</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border/30">
        {failures.map((failure, index) => (
          <div key={index} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="font-medium text-foreground">{failure.reason}</div>
                <div className="text-sm text-muted-foreground mt-0.5">
                  {failure.count} location{failure.count !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="px-3 py-1 bg-destructive/20 rounded-full text-destructive font-mono text-sm font-medium">
                {failure.count}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {failure.locations.slice(0, 5).map((location, locIndex) => (
                <div 
                  key={locIndex}
                  className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-md text-xs text-muted-foreground"
                >
                  <MapPin className="h-3 w-3" />
                  {location}
                </div>
              ))}
              {failure.locations.length > 5 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-muted/30 rounded-md text-xs text-muted-foreground">
                  <ChevronRight className="h-3 w-3" />
                  +{failure.locations.length - 5} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
