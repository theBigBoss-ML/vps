import { MapPin, SpinnerGap, Crosshair, Info } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LocationButtonProps {
  onDetect: () => void;
  isLoading: boolean;
  disabled?: boolean;
  accuracy?: number | null;
  accuracyLevel?: 'high' | 'medium' | 'low' | null;
}

function AccuracyIndicator({ accuracy, level }: { accuracy: number; level: 'high' | 'medium' | 'low' }) {
  const config = {
    high: {
      label: 'High Accuracy',
      description: 'GPS signal',
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
      bars: 3,
    },
    medium: {
      label: 'Medium Accuracy',
      description: 'Network location',
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      bars: 2,
    },
    low: {
      label: 'Low Accuracy',
      description: 'Approximate location',
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      bars: 1,
    },
  };

  const { label, description, color, bg, bars } = config[level];

  return (
    <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg text-sm', bg)}>
      <div className="flex gap-0.5 items-end h-4">
        {[1, 2, 3].map((bar) => (
          <div
            key={bar}
            className={cn(
              'w-1 rounded-full transition-colors',
              bar <= bars ? 'bg-current' : 'bg-current/20',
              color
            )}
            style={{ height: `${bar * 5 + 3}px` }}
          />
        ))}
      </div>
      <div className="flex-1">
        <span className={cn('font-medium', color)}>{label}</span>
        <span className="text-muted-foreground ml-1">({Math.round(accuracy)}m)</span>
      </div>
      <Info className={cn('h-4 w-4', color)} />
    </div>
  );
}

export function LocationButton({ onDetect, isLoading, disabled, accuracy, accuracyLevel }: LocationButtonProps) {
  return (
    <div className="space-y-3">
      <Button
        onClick={onDetect}
        disabled={disabled || isLoading}
        size="lg"
        className="w-full h-16 text-lg font-semibold gap-3 bg-nigeria-green hover:bg-nigeria-green/90 text-white shadow-lg shadow-nigeria-green/25 transition-all hover:shadow-xl hover:shadow-nigeria-green/30"
        aria-label="Detect my location to find postal code"
      >
        {isLoading ? (
          <>
            <SpinnerGap className="h-6 w-6 animate-spin" aria-hidden="true" />
            <span>Getting Precise Location...</span>
          </>
        ) : (
          <>
            <Crosshair className="h-6 w-6" aria-hidden="true" />
            <span>Find My Postal Code</span>
          </>
        )}
      </Button>

      {accuracy && accuracyLevel && (
        <AccuracyIndicator accuracy={accuracy} level={accuracyLevel} />
      )}

      <p className="text-xs text-muted-foreground text-center">
        <MapPin className="h-3 w-3 inline mr-1" />
        Uses GPS for highest accuracy. Enable location services for best results.
      </p>
    </div>
  );
}
