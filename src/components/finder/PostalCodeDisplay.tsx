import { useState, useEffect, useRef } from 'react';
import { Copy, Check, Share2, MapPin, Database, RefreshCw, Info, ThumbsUp, ThumbsDown, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocationResult } from '@/types/location';
import { toast } from 'sonner';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface PostalCodeDisplayProps {
  result: LocationResult;
  onReset: () => void;
  onCopy?: () => void;
  onFeedback?: (type: 'like' | 'dislike') => void;
}

export function PostalCodeDisplay({ result, onReset, onCopy, onFeedback }: PostalCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'like' | 'dislike' | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Get the area name for display - prioritize area, then LGA, then state
  const areaName = result.area || result.lga || result.state || 'your';

  // Check if we have valid coordinates
  const hasValidCoordinates = result.coordinates && 
    result.coordinates.lat !== 0 && 
    result.coordinates.lng !== 0;

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Initialize mini map
  useEffect(() => {
    if (!mapContainerRef.current || !hasValidCoordinates || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [result.coordinates.lat, result.coordinates.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // Custom marker icon
    const customIcon = L.divIcon({
      className: 'custom-location-marker',
      html: `
        <div class="location-marker-container">
          <div class="location-marker-dot"></div>
          <div class="location-marker-pulse"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    L.marker([result.coordinates.lat, result.coordinates.lng], { icon: customIcon }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [hasValidCoordinates, result.coordinates]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.postalCode);
      setCopied(true);
      toast.success('Postal code copied to clipboard!');
      onCopy?.();
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleFeedback = (type: 'like' | 'dislike') => {
    if (feedbackGiven) return;
    setFeedbackGiven(type);
    onFeedback?.(type);
    toast.success(type === 'like' ? 'Thanks for your feedback!' : 'Thanks! We\'ll work to improve accuracy.');
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Nigeria Zip Postal Code',
      text: `My Nigeria zip postal code is ${result.postalCode} (${areaName} area)`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(
        `My Nigeria zip postal code is ${result.postalCode} - ${result.address}`
      );
      toast.success('Share text copied to clipboard!');
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Main Postal Code Display */}
      <div className="text-center p-6 md:p-8 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Your Area's Postal Code
        </p>
        <div className="flex items-center justify-center gap-4">
          <span 
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary postal-code"
            aria-label={`Postal code: ${result.postalCode.split('').join(' ')}`}
          >
            {result.postalCode}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="h-10 w-10 md:h-12 md:w-12 border-primary/50 hover:bg-primary/10"
            aria-label={copied ? 'Copied!' : 'Copy postal code'}
          >
            {copied ? (
              <Check className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            ) : (
              <Copy className="h-4 w-4 md:h-5 md:w-5" />
            )}
          </Button>
        </div>

        {/* Explanatory text about shared postal code */}
        <p className="mt-3 text-sm text-muted-foreground">
          This code is shared by all addresses in the <span className="font-medium text-foreground">{areaName}</span> area
        </p>
        
        {/* Source indicator */}
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          {result.source === 'google' ? (
            <>
              <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span>Verified by Google Maps</span>
            </>
          ) : (
            <>
              <Database className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
              <span>Matched from database ({Math.round(result.confidence)}% confidence)</span>
            </>
          )}
        </div>

        {/* Feedback buttons */}
        <div className="mt-4 pt-4 border-t border-primary/20">
          <p className="text-xs text-muted-foreground mb-3">Was this result accurate?</p>
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFeedback('like')}
              disabled={feedbackGiven !== null}
              className={`gap-2 ${feedbackGiven === 'like' ? 'bg-primary/20 border-primary text-primary' : ''}`}
            >
              <ThumbsUp className={`h-4 w-4 ${feedbackGiven === 'like' ? 'fill-primary' : ''}`} />
              Yes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFeedback('dislike')}
              disabled={feedbackGiven !== null}
              className={`gap-2 ${feedbackGiven === 'dislike' ? 'bg-destructive/20 border-destructive text-destructive' : ''}`}
            >
              <ThumbsDown className={`h-4 w-4 ${feedbackGiven === 'dislike' ? 'fill-destructive' : ''}`} />
              No
            </Button>
          </div>
        </div>
      </div>

      {/* Educational Info Section - Collapsible */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works" className="border border-border rounded-xl px-4 bg-card">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Info className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>How Nigerian Postal Codes Work</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nigerian postal codes identify postal service areas, not individual addresses. 
              Everyone in the same neighborhood/area shares the same 6-digit code. 
              This code represents your nearest post office's service zone.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Address Details */}
      <div className="p-4 rounded-xl bg-card border border-border">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Location Details
        </h3>
        <div className="space-y-2 text-sm">
          {/* Postal Service Area - New field */}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Postal Service Area:</span>
            <span className="font-medium">{areaName}</span>
          </div>
          
          {result.area && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Area:</span>
              <span className="font-medium">{result.area}</span>
            </div>
          )}
          {result.lga && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">LGA:</span>
              <span className="font-medium">{result.lga}</span>
            </div>
          )}
          {result.state && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">State:</span>
              <span className="font-medium">{result.state}</span>
            </div>
          )}
          
          {/* Coverage info */}
          <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-md bg-primary/20 shrink-0">
                <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold text-primary mb-0.5">Coverage Area</p>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  This postal code serves the entire <span className="font-medium text-foreground">{areaName}</span> neighborhood and surrounding streets.
                </p>
              </div>
            </div>
          </div>
          
          {/* Nearest address with Mini Map */}
          <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-warning/10 to-warning/5 border border-warning/20">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-md bg-warning/20 shrink-0">
                <Navigation className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-warning mb-1">Nearest Address to Your Location</p>
                <p className="text-xs text-foreground/80 leading-relaxed mb-3">
                  {result.address}
                </p>
                
                {/* Mini Map */}
                {hasValidCoordinates && (
                  <div className="relative">
                    <div 
                      ref={mapContainerRef} 
                      className="w-full h-32 rounded-lg overflow-hidden border border-border"
                      style={{ minHeight: '128px' }}
                    />
                    <div className="absolute bottom-1 right-1 bg-background/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-muted-foreground">
                      © OpenStreetMap
                    </div>
                  </div>
                )}
                
                {/* Coordinates display */}
                {hasValidCoordinates && (
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="tabular-nums">
                      {result.coordinates.lat.toFixed(5)}, {result.coordinates.lng.toFixed(5)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleShare}
          className="flex-1 gap-2"
          aria-label="Share postal code"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          Share
        </Button>
        <Button
          variant="outline"
          onClick={onReset}
          className="flex-1 gap-2"
          aria-label="Find another postal code"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Search Again
        </Button>
      </div>

      {/* Custom marker styles */}
      <style>{`
        .custom-location-marker {
          background: transparent;
          border: none;
        }
        
        .location-marker-container {
          position: relative;
          width: 24px;
          height: 24px;
        }
        
        .location-marker-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          background: hsl(152, 69%, 31%);
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          z-index: 2;
        }
        
        .location-marker-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 24px;
          height: 24px;
          background: hsl(152, 69%, 31%, 0.3);
          border-radius: 50%;
          animation: pulse-ring 2s ease-out infinite;
        }
        
        @keyframes pulse-ring {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
