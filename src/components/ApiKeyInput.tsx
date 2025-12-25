import { useState, useEffect } from 'react';
import { Key, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { testApiKey } from '@/lib/geocodingService';

interface ApiKeyInputProps {
  onApiKeySet: (key: string) => void;
}

export function ApiKeyInput({ onApiKeySet }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [storedKey, setStoredKey] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('google_maps_api_key');
    if (saved) {
      setStoredKey(saved);
      setApiKey(saved);
      onApiKeySet(saved);
    }
  }, [onApiKeySet]);

  const handleValidate = async () => {
    if (!apiKey.trim()) return;
    
    setIsValidating(true);
    setValidationStatus('idle');

    const isValid = await testApiKey(apiKey.trim());
    
    setIsValidating(false);
    setValidationStatus(isValid ? 'valid' : 'invalid');

    if (isValid) {
      localStorage.setItem('google_maps_api_key', apiKey.trim());
      setStoredKey(apiKey.trim());
      onApiKeySet(apiKey.trim());
    }
  };

  const handleClear = () => {
    localStorage.removeItem('google_maps_api_key');
    setStoredKey(null);
    setApiKey('');
    setValidationStatus('idle');
    onApiKeySet('');
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Key className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Google Maps API Key</h3>
          <p className="text-sm text-muted-foreground">Required for reverse geocoding</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Input
          type="password"
          placeholder="Enter your Google Maps API key..."
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            setValidationStatus('idle');
          }}
          className="flex-1 bg-muted/50 border-border/50 font-mono text-sm"
        />
        <Button
          onClick={handleValidate}
          disabled={!apiKey.trim() || isValidating}
          variant={validationStatus === 'valid' ? 'default' : 'secondary'}
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : validationStatus === 'valid' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            'Validate'
          )}
        </Button>
        {storedKey && (
          <Button variant="ghost" onClick={handleClear} className="text-muted-foreground">
            Clear
          </Button>
        )}
      </div>

      {validationStatus === 'valid' && (
        <div className="flex items-center gap-2 text-sm text-success">
          <CheckCircle className="h-4 w-4" />
          API key validated and saved
        </div>
      )}

      {validationStatus === 'invalid' && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <XCircle className="h-4 w-4" />
          Invalid API key. Please check and try again.
        </div>
      )}

      <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
        <p className="font-medium mb-1">How to get an API key:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">console.cloud.google.com</a></li>
          <li>Create a new project or select existing</li>
          <li>Enable "Geocoding API"</li>
          <li>Create credentials → API Key</li>
        </ol>
      </div>
    </div>
  );
}
