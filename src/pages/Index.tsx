import { useState, useCallback } from 'react';
import { MapPin, Search, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LocationButton } from '@/components/finder/LocationButton';
import { PostalCodeDisplay } from '@/components/finder/PostalCodeDisplay';

import { SmartSearch } from '@/components/finder/SmartSearch';
import { RecentLocations } from '@/components/finder/RecentLocations';
import { ErrorMessage } from '@/components/finder/ErrorMessage';
import { LoadingState } from '@/components/finder/LoadingState';
import { ThemeToggle } from '@/components/finder/ThemeToggle';
import { ApiKeySettings, getStoredApiKey } from '@/components/finder/ApiKeySettings';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useRecentLocations } from '@/hooks/useRecentLocations';
import { useTheme } from '@/hooks/useTheme';
import { LocationResult, LookupStatus, RecentLocation } from '@/types/location';
import { rateLimitedGetPostalCode } from '@/lib/postalCodeService';
import { defaultPostalCodes, PostalCode } from '@/data/postalCodes';
import { toast } from 'sonner';

const Index = () => {
  const [status, setStatus] = useState<LookupStatus>('idle');
  const [result, setResult] = useState<LocationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [apiKeyVersion, setApiKeyVersion] = useState(0);
  const { getCurrentPosition, error: geoError, clearError } = useGeolocation();
  const { recentLocations, addRecentLocation, clearRecentLocations } = useRecentLocations();
  const { theme, toggleTheme } = useTheme();

  const getApiKey = (): string => {
    // Force re-read when apiKeyVersion changes
    void apiKeyVersion;
    return getStoredApiKey();
  };

  const handleDetectLocation = useCallback(async () => {
    setError(null);
    setResult(null);
    setStatus('detecting');

    const coords = await getCurrentPosition();
    if (!coords) {
      setStatus('error');
      setError(geoError || 'Could not detect location');
      return;
    }

    setStatus('geocoding');
    const apiKey = getApiKey();
    
    if (!apiKey) {
      setStatus('error');
      setError('Please configure your Google Maps API key in Settings (gear icon in header).');
      return;
    }

    const locationResult = await rateLimitedGetPostalCode(coords.lat, coords.lng, apiKey);
    
    if (locationResult) {
      setResult(locationResult);
      setStatus('success');
      addRecentLocation({
        postalCode: locationResult.postalCode,
        address: locationResult.address,
        area: locationResult.area,
        lga: locationResult.lga,
      });
      toast.success('Postal code found!');
    } else {
      setStatus('error');
      setError('Could not find postal code for your location. Try manual search.');
    }
  }, [getCurrentPosition, geoError, addRecentLocation]);

  const handleSmartSearch = useCallback((result: PostalCode) => {
    const locationResult: LocationResult = {
      postalCode: result.postalCode,
      source: 'database',
      address: `${result.locality}, ${result.area}, ${result.lga}, ${result.state}`,
      lga: result.lga,
      area: result.area,
      state: result.state,
      confidence: 90,
      coordinates: { lat: 0, lng: 0 },
      timestamp: new Date(),
    };
    setResult(locationResult);
    setStatus('success');
    addRecentLocation({
      postalCode: result.postalCode,
      address: locationResult.address,
      area: result.area,
      lga: result.lga,
    });
    toast.success('Nigeria zip postal code found!');
  }, [addRecentLocation]);

  const handleSelectRecent = useCallback((location: RecentLocation) => {
    setResult({
      postalCode: location.postalCode,
      source: 'database',
      address: location.address,
      lga: location.lga,
      area: location.area,
      state: null,
      confidence: 100,
      coordinates: { lat: 0, lng: 0 },
      timestamp: new Date(),
    });
    setStatus('success');
  }, []);

  const handleReset = useCallback(() => {
    setResult(null);
    setStatus('idle');
    setError(null);
    clearError();
  }, [clearError]);

  const isLoading = status === 'detecting' || status === 'geocoding';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-nigeria-green text-white px-4 py-2 rounded-lg z-50">
        Skip to main content
      </a>

      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-nigeria-green/20 rounded-xl">
              <MapPin className="h-6 w-6 text-nigeria-green" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Nigeria Zip Code</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">AI-based Nigeria zip postal code finder</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ApiKeySettings onKeyUpdate={() => setApiKeyVersion(v => v + 1)} />
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1 container mx-auto px-4 py-8 max-w-lg">
        {status === 'success' && result ? (
          <PostalCodeDisplay result={result} onReset={handleReset} />
        ) : isLoading ? (
          <LoadingState status={status} />
        ) : (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-nigeria-green/10 text-nigeria-green text-xs font-medium rounded-full">
                <Sparkles className="h-3 w-3" />
                AI-Powered
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Find Your Nigeria Zip Postal Code
              </h2>
              <p className="text-muted-foreground text-sm">
                AI-based Nigeria zip postal code finder — instant lookup using GPS or smart search
              </p>
            </div>

            {(error || geoError) && (
              <ErrorMessage 
                message={error || geoError || ''} 
                onDismiss={() => { setError(null); clearError(); }} 
              />
            )}

            <Tabs defaultValue="gps" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="gps" className="gap-2 h-10">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  Use GPS
                </TabsTrigger>
                <TabsTrigger value="manual" className="gap-2 h-10">
                  <Search className="h-4 w-4" aria-hidden="true" />
                  Manual
                </TabsTrigger>
              </TabsList>

              <TabsContent value="gps" className="space-y-6">
                <LocationButton onDetect={handleDetectLocation} isLoading={isLoading} />
                <RecentLocations 
                  locations={recentLocations} 
                  onSelect={handleSelectRecent}
                  onClear={clearRecentLocations}
                />
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <SmartSearch onSelect={handleSmartSearch} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      <footer className="border-t border-border/50 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">AI-based Nigeria Zip Postal Code Finder</p>
          <p className="text-xs text-muted-foreground">Free & Fast Nigeria Zip Postal Code Lookup</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;