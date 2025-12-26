import { useState, useEffect } from 'react';
import { Copy, Check, Share2, MapPin, Database, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocationResult } from '@/types/location';
import { toast } from 'sonner';

interface PostalCodeDisplayProps {
  result: LocationResult;
  onReset: () => void;
}

export function PostalCodeDisplay({ result, onReset }: PostalCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.postalCode);
      setCopied(true);
      toast.success('Postal code copied to clipboard!');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Nigerian Postal Code',
      text: `My postal code is ${result.postalCode} (${result.area || result.lga || 'Nigeria'})`,
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
        `My Nigerian postal code is ${result.postalCode} - ${result.address}`
      );
      toast.success('Share text copied to clipboard!');
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Main Postal Code Display */}
      <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-nigeria-green/20 to-nigeria-green/5 border border-nigeria-green/30">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Your Postal Code
        </p>
        <div className="flex items-center justify-center gap-4">
          <span 
            className="text-5xl md:text-6xl font-bold text-nigeria-green tracking-wider mono"
            aria-label={`Postal code: ${result.postalCode.split('').join(' ')}`}
          >
            {result.postalCode}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="h-12 w-12 border-nigeria-green/50 hover:bg-nigeria-green/10"
            aria-label={copied ? 'Copied!' : 'Copy postal code'}
          >
            {copied ? (
              <Check className="h-5 w-5 text-nigeria-green" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        {/* Source indicator */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          {result.source === 'google' ? (
            <>
              <MapPin className="h-4 w-4 text-nigeria-green" aria-hidden="true" />
              <span>Verified by Google Maps</span>
            </>
          ) : (
            <>
              <Database className="h-4 w-4 text-nigeria-orange" aria-hidden="true" />
              <span>Matched from database ({Math.round(result.confidence)}% confidence)</span>
            </>
          )}
        </div>
      </div>

      {/* Address Details */}
      <div className="p-4 rounded-xl bg-card border border-border">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Location Details
        </h3>
        <div className="space-y-2 text-sm">
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
          <div className="pt-2 border-t border-border">
            <p className="text-muted-foreground text-xs leading-relaxed">
              {result.address}
            </p>
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
    </div>
  );
}
