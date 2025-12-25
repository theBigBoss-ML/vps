import { Play, Loader2, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TestProgress } from '@/types/validation';

interface TestControlsProps {
  progress: TestProgress;
  hasApiKey: boolean;
  onStart: () => void;
  onStop: () => void;
  coordinateCount: number;
}

export function TestControls({ 
  progress, 
  hasApiKey, 
  onStart, 
  onStop,
  coordinateCount 
}: TestControlsProps) {
  const isRunning = progress.status === 'testing';
  const progressPercent = progress.total > 0 
    ? (progress.current / progress.total) * 100 
    : 0;

  return (
    <div className="glass-card p-6">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-foreground">
              {isRunning ? (
                <>Testing: <span className="text-primary">{progress.currentLocation}</span></>
              ) : progress.status === 'completed' ? (
                'Test completed!'
              ) : (
                `Ready to test ${coordinateCount} coordinates`
              )}
            </div>
            {isRunning && (
              <div className="text-sm font-mono text-muted-foreground">
                {progress.current}/{progress.total}
              </div>
            )}
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {!hasApiKey && (
            <div className="mt-2 text-xs text-warning">
              ⚠️ Please add your Google Maps API key to start testing
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {isRunning ? (
            <Button 
              onClick={onStop}
              variant="destructive"
              size="lg"
              className="gap-2 min-w-[160px]"
            >
              <Square className="h-5 w-5" />
              Stop Test
            </Button>
          ) : (
            <Button 
              onClick={onStart}
              disabled={!hasApiKey || progress.status === 'testing'}
              size="lg"
              className="gap-2 min-w-[160px] bg-primary hover:bg-primary/90"
            >
              {progress.status === 'testing' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Play className="h-5 w-5" />
              )}
              Start Test
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
