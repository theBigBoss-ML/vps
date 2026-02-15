import { SpinnerGap } from '@phosphor-icons/react';
import { LookupStatus } from '@/types/location';

interface LoadingStateProps {
  status: LookupStatus;
  progressMessage?: string | null;
}

const statusMessages: Record<LookupStatus, string> = {
  idle: '',
  detecting: 'Detecting your location...',
  geocoding: 'Finding your postal code...',
  success: 'Found!',
  error: 'Something went wrong',
};

export function LoadingState({ status, progressMessage }: LoadingStateProps) {
  if (status === 'idle' || status === 'success' || status === 'error') {
    return null;
  }

  const message = (status === 'detecting' && progressMessage) || statusMessages[status];

  return (
    <div
      className="flex flex-col items-center justify-center py-12 animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-nigeria-green/20 animate-ping" />
        <div className="relative p-4 rounded-full bg-nigeria-green/10">
          <SpinnerGap className="h-8 w-8 text-nigeria-green animate-spin" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-4 text-muted-foreground font-medium">
        {message}
      </p>
      <p className="text-sm text-muted-foreground/70 mt-1">
        This may take a few seconds
      </p>
    </div>
  );
}
