import { useState, useEffect } from 'react';
import { MapPin, NavigationArrow, Shield, Lightning, CaretRight, DeviceMobile, Monitor, Warning } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LocationPermissionStatus, ModalOpenReason } from '@/hooks/useLocationPermission';

interface LocationPermissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permissionStatus: LocationPermissionStatus;
  modalOpenReason: ModalOpenReason;
  onRequestPermission: () => Promise<boolean>;
  onMarkSeen: (action?: 'skipped' | 'granted') => void;
  onPermissionGranted: () => void;
}

function FeatureItem({ icon: Icon, title, description }: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h4 className="text-sm font-medium text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function EnableInstructions() {
  const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
        <Warning className="h-5 w-5" />
        <span className="font-medium text-sm">Location access was denied</span>
      </div>

      <p className="text-sm text-muted-foreground">
        To use GPS-based postal code lookup, you'll need to enable location access in your settings:
      </p>

      <div className="space-y-3 bg-muted/50 rounded-lg p-4">
        {isIOS ? (
          <>
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <DeviceMobile className="h-4 w-4" />
              <span>iPhone/iPad Instructions</span>
            </div>
            <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Open <strong>Settings</strong> app</li>
              <li>Scroll down and tap <strong>Safari</strong> (or your browser)</li>
              <li>Tap <strong>Location</strong></li>
              <li>Select <strong>Allow</strong> or <strong>Ask</strong></li>
              <li>Return here and refresh the page</li>
            </ol>
          </>
        ) : isAndroid ? (
          <>
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <DeviceMobile className="h-4 w-4" />
              <span>Android Instructions</span>
            </div>
            <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Open <strong>Settings</strong> app</li>
              <li>Tap <strong>Location</strong> (or Privacy -&gt; Location)</li>
              <li>Ensure Location is <strong>ON</strong></li>
              <li>Tap <strong>App permissions</strong></li>
              <li>Find your browser and set to <strong>Allow</strong></li>
              <li>Return here and refresh the page</li>
            </ol>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Monitor className="h-4 w-4" />
              <span>Browser Instructions</span>
            </div>
            <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Click the <strong>lock icon</strong> in your browser's address bar</li>
              <li>Find <strong>Location</strong> in the permissions</li>
              <li>Change to <strong>Allow</strong></li>
              <li>Refresh this page</li>
            </ol>
          </>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        You can also use <strong>Manual Search</strong> to find postal codes without location access.
      </p>
    </div>
  );
}

export function LocationPermissionModal({
  open,
  onOpenChange,
  permissionStatus,
  modalOpenReason,
  onRequestPermission,
  onMarkSeen,
  onPermissionGranted,
}: LocationPermissionModalProps) {
  const [showDeniedInstructions, setShowDeniedInstructions] = useState(false);
  const isBrowserDenied = permissionStatus === 'denied';
  const isUnavailable = permissionStatus === 'unavailable';

  // Show denied instructions directly only when:
  // - User clicked GPS button AND browser has already denied (settings change needed)
  // - OR user just tried to enable and got denied (showDeniedInstructions)
  // - OR geolocation is unavailable
  const isDenied =
    showDeniedInstructions ||
    isUnavailable ||
    (modalOpenReason === 'gps-attempt' && isBrowserDenied);

  useEffect(() => {
    if (open) {
      setShowDeniedInstructions(false);
    }
  }, [open]);

  const handleEnableLocation = async () => {
    const success = await onRequestPermission();
    if (success) {
      onMarkSeen('granted');
      onPermissionGranted();
      return;
    }
    setShowDeniedInstructions(true);
  };

  const handleSkip = () => {
    onMarkSeen('skipped');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-6 pb-4">
          <DialogHeader className="text-left">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
              <MapPin className="h-7 w-7 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold">
              {isDenied ? 'Enable Location Access' : 'Welcome! Enable Location'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {isDenied
                ? 'Location access is required for GPS-based postal code lookup.'
                : 'Get your Nigerian postal code instantly with GPS accuracy.'
              }
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6 pt-4 space-y-6">
          {isDenied ? (
            <EnableInstructions />
          ) : (
            <>
              {/* Benefits */}
              <div className="space-y-4">
                <FeatureItem
                  icon={NavigationArrow}
                  title="Instant GPS Location"
                  description="One-tap postal code lookup using your device's GPS"
                />
                <FeatureItem
                  icon={Lightning}
                  title="High Accuracy"
                  description="GPS provides the most accurate location data"
                />
                <FeatureItem
                  icon={Shield}
                  title="Private & Secure"
                  description="Your location is only used to find your postal code"
                />
              </div>

              {/* CTA */}
              <div className="space-y-3">
                <Button
                  onClick={handleEnableLocation}
                  className="w-full h-12 text-base font-semibold gap-2 bg-nigeria-green hover:bg-nigeria-green/90"
                >
                  <MapPin className="h-5 w-5" />
                  Enable Location Access
                  <CaretRight className="h-4 w-4 ml-auto" />
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  Skip for now - I'll use manual search
                </Button>
              </div>
            </>
          )}

          {isDenied && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSkip}
                className="flex-1"
              >
                Use Manual Search
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 bg-nigeria-green hover:bg-nigeria-green/90"
              >
                Refresh Page
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
