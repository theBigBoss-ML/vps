import { MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationButtonProps {
  onDetect: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function LocationButton({ onDetect, isLoading, disabled }: LocationButtonProps) {
  return (
    <Button
      onClick={onDetect}
      disabled={disabled || isLoading}
      size="lg"
      className="w-full h-16 text-lg font-semibold gap-3 bg-nigeria-green hover:bg-nigeria-green/90 text-white shadow-lg shadow-nigeria-green/25 transition-all hover:shadow-xl hover:shadow-nigeria-green/30"
      aria-label="Detect my location to find postal code"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
          <span>Detecting Location...</span>
        </>
      ) : (
        <>
          <MapPin className="h-6 w-6" aria-hidden="true" />
          <span>Find My Postal Code</span>
        </>
      )}
    </Button>
  );
}
