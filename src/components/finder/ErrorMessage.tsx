import { WarningCircle, X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div 
      className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 animate-fade-in"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <WarningCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1">
          <p className="text-sm text-destructive font-medium">
            {message}
          </p>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:bg-destructive/20"
            onClick={onDismiss}
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
