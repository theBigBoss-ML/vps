import { useState, useEffect } from 'react';
import { Settings, Key, ExternalLink, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const API_KEY_STORAGE = 'nigeria-postal-api-key';

interface ApiKeySettingsProps {
  onKeyUpdate?: () => void;
}

export function ApiKeySettings({ onKeyUpdate }: ApiKeySettingsProps) {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(API_KEY_STORAGE);
    if (stored) {
      setApiKey(stored);
      setHasKey(true);
    }
  }, [open]);

  const testApiKey = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=6.5244,3.3792&key=${key}`
      );
      const data = await response.json();
      return data.status === 'OK' || data.status === 'ZERO_RESULTS';
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    setIsTesting(true);
    const isValid = await testApiKey(apiKey.trim());
    setIsTesting(false);

    if (isValid) {
      localStorage.setItem(API_KEY_STORAGE, apiKey.trim());
      setHasKey(true);
      toast.success('API key saved successfully!');
      onKeyUpdate?.();
      setOpen(false);
    } else {
      toast.error('Invalid API key. Please check and try again.');
    }
  };

  const handleRemove = () => {
    localStorage.removeItem(API_KEY_STORAGE);
    setApiKey('');
    setHasKey(false);
    toast.success('API key removed');
    onKeyUpdate?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full relative"
          aria-label="API Settings"
        >
          <Settings className="h-5 w-5" />
          {hasKey && (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-nigeria-green rounded-full" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-nigeria-green" />
            Google Maps API Key
          </DialogTitle>
          <DialogDescription>
            Enter your Google Maps API key to enable GPS-based postal code lookup.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Google Maps API key"
              className="font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isTesting || !apiKey.trim()}
              className="flex-1 bg-nigeria-green hover:bg-nigeria-green/90"
            >
              {isTesting ? 'Testing...' : hasKey ? 'Update Key' : 'Save Key'}
            </Button>
            {hasKey && (
              <Button
                variant="outline"
                onClick={handleRemove}
                className="text-destructive hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {hasKey && (
            <div className="flex items-center gap-2 text-sm text-nigeria-green">
              <Check className="h-4 w-4" />
              <span>API key configured</span>
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">
              Don't have an API key? Get one free from Google Cloud Console.
            </p>
            <a
              href="https://console.cloud.google.com/google/maps-apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-nigeria-green hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Get API Key from Google Cloud
            </a>
            
            <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground space-y-1">
              <p><strong>Setup steps:</strong></p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Create a Google Cloud project</li>
                <li>Enable "Geocoding API"</li>
                <li>Create credentials → API key</li>
                <li>Restrict key to your domain (recommended)</li>
              </ol>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function getStoredApiKey(): string {
  // Environment variable takes priority, then localStorage
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || localStorage.getItem(API_KEY_STORAGE) || '';
}
