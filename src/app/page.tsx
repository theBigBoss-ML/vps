"use client";

import dynamic from 'next/dynamic';
import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, MagnifyingGlass, Crosshair, Warning } from '@phosphor-icons/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LocationButton } from '@/components/finder/LocationButton';
import { SmartSearch } from '@/components/finder/SmartSearch';
import { ManualSearch } from '@/components/finder/ManualSearch';
import { RecentLocations } from '@/components/finder/RecentLocations';
import { ErrorMessage } from '@/components/finder/ErrorMessage';
import { LoadingState } from '@/components/finder/LoadingState';
import { ThemeToggle } from '@/components/finder/ThemeToggle';
import { UsageStatsDisplay } from '@/components/finder/UsageStatsDisplay';
import { LocationPermissionModal } from '@/components/finder/LocationPermissionModal';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useRecentLocations } from '@/hooks/useRecentLocations';
import { useTheme } from '@/hooks/useTheme';
import { useUsageStats } from '@/hooks/useUsageStats';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { LocationResult, LookupStatus, RecentLocation } from '@/types/location';
import { rateLimitedGetPostalCode, getPostalCodeByStateLga } from '@/lib/postalCodeService';
import { PostalCode } from '@/data/postalCodes';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const PostalCodeDisplay = dynamic(
  () => import('@/components/finder/PostalCodeDisplay').then((mod) => mod.PostalCodeDisplay),
  { ssr: false }
);

const Index = () => {
  const [status, setStatus] = useState<LookupStatus>('idle');
  const [result, setResult] = useState<LocationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('gps');
  
  const { getCurrentPosition, error: geoError, clearError, accuracy, accuracyLevel } = useGeolocation();
  const { recentLocations, addRecentLocation, clearRecentLocations } = useRecentLocations();
  const { theme, toggleTheme } = useTheme();
  const { stats, loading: statsLoading, trackStat } = useUsageStats();
  const { 
    permissionStatus, 
    showModal, 
    setShowModal, 
    markModalSeen, 
    requestPermission 
  } = useLocationPermission();

  // Auto-switch to manual tab if location is denied
  useEffect(() => {
    if (permissionStatus === 'denied') {
      setActiveTab('manual');
    }
  }, [permissionStatus]);

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
    try {
      const locationResult = await rateLimitedGetPostalCode(coords.lat, coords.lng);
      if (locationResult) {
        setResult(locationResult);
        setStatus('success');
        addRecentLocation({
          postalCode: locationResult.postalCode,
          address: locationResult.address,
          area: locationResult.area,
          lga: locationResult.lga,
        });
        trackStat('generation', locationResult.postalCode);
        toast.success('Postal code found!');
        return;
      }
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Google Maps lookup is currently unavailable.';
      setStatus('error');
      setError(message);
      return;
    }

    setStatus('error');
    setError('Could not find postal code for your location. Try manual search.');
  }, [getCurrentPosition, geoError, addRecentLocation, trackStat]);

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
    trackStat('generation', result.postalCode);
    toast.success('Nigeria zip postal code found!');
  }, [addRecentLocation, trackStat]);

  const handleManualSearch = useCallback((state: string, lga: string) => {
    const result = getPostalCodeByStateLga(state, lga);
    if (result) {
      const locationResult: LocationResult = {
        postalCode: result.postalCode,
        source: 'database',
        address: `${result.locality}, ${result.area}, ${result.lga}, ${result.state}`,
        lga: result.lga,
        area: result.area,
        state: result.state,
        confidence: 100,
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
      trackStat('generation', result.postalCode);
      toast.success('Nigeria zip postal code found!');
    } else {
      setError(`No postal code found for ${lga}, ${state}. Try using the smart search instead.`);
    }
  }, [addRecentLocation, trackStat]);

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

  const handleCopy = useCallback(() => {
    if (result) {
      trackStat('copy', result.postalCode);
    }
  }, [result, trackStat]);

  const handleFeedback = useCallback((type: 'like' | 'dislike') => {
    if (result) {
      trackStat(type, result.postalCode);
    }
  }, [result, trackStat]);

  const isLoading = status === 'detecting' || status === 'geocoding';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg z-50">
        Skip to main content
      </a>

      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-primary/20 rounded-xl">
              <MapPin className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">AI-based Nigeria Zip Postal Code Finder</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">AI-based, free & fast Nigeria zip postal code lookup</p>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link 
              href="/drop-pin" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors hidden sm:block"
            >
              Drop Pin
            </Link>
            <Link 
              href="/state-maps" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors hidden sm:block"
            >
              State Maps
            </Link>
            <Link 
              href="/blog" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Blog
            </Link>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </nav>
        </div>
      </header>

      <main id="main-content" className="flex-1 container mx-auto px-4 py-8 max-w-lg">
        {status === 'success' && result ? (
          <PostalCodeDisplay 
            result={result} 
            onReset={handleReset} 
            onCopy={handleCopy}
            onFeedback={handleFeedback}
          />
        ) : isLoading ? (
          <LoadingState status={status} />
        ) : (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                <Crosshair className="h-3 w-3" />
                AI-assisted GPS + Smart Search
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Find Your Nigeria Zip Postal Code in a Split Second
              </h2>
              <p className="text-muted-foreground text-sm">
                AI-based Nigeria zip postal code finder for instant lookup using GPS or smart search
              </p>
            </div>

            {(error || geoError) && (
              <ErrorMessage 
                message={error || geoError || ''} 
                onDismiss={() => { setError(null); clearError(); }} 
              />
            )}

            {/* Location denied banner */}
            {permissionStatus === 'denied' && (
              <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
                <Warning className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
                  Location access is disabled. 
                  <Button 
                    variant="link" 
                    className="h-auto p-0 ml-1 text-amber-700 dark:text-amber-300 underline"
                    onClick={() => setShowModal(true)}
                  >
                    Learn how to enable it
                  </Button>
                  {' '}or use manual search below.
                </AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="gps" className="gap-2 h-10" disabled={permissionStatus === 'denied'}>
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  Use GPS
                  {permissionStatus === 'denied' && (
                    <span className="text-[10px] text-muted-foreground">(disabled)</span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="manual" className="gap-2 h-10">
                  <MagnifyingGlass className="h-4 w-4" aria-hidden="true" />
                  Manual
                </TabsTrigger>
              </TabsList>

              <TabsContent value="gps" className="space-y-6">
                <LocationButton 
                  onDetect={handleDetectLocation} 
                  isLoading={isLoading} 
                  accuracy={accuracy}
                  accuracyLevel={accuracyLevel}
                />
                <RecentLocations 
                  locations={recentLocations} 
                  onSelect={handleSelectRecent}
                  onClear={clearRecentLocations}
                />
              </TabsContent>

              <TabsContent value="manual" className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MagnifyingGlass className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Search by Location Name</span>
                  </div>
                  <SmartSearch onSelect={handleSmartSearch} isLoading={isLoading} />
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">or select from dropdown</span>
                  </div>
                </div>
                <ManualSearch onSearch={handleManualSearch} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      {/* Usage Stats Section */}
      <UsageStatsDisplay 
        generations={stats.generations}
        likes={stats.likes}
        copies={stats.copies}
        loading={statsLoading}
      />

      {/* Location Permission Modal */}
      <LocationPermissionModal
        open={showModal}
        onOpenChange={setShowModal}
        permissionStatus={permissionStatus}
        onRequestPermission={requestPermission}
        onSkip={markModalSeen}
      />

      <footer className="border-t border-border/50 py-8 md:py-12 bg-card/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
                <div className="p-1.5 bg-primary/20 rounded-lg">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground">AI-based Nigeria Zip Postal Code Finder</h3>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-based Nigeria zip postal code lookup using GPS or smart search.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Quick Links</h4>
              <nav className="flex flex-col gap-3">
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link>
                <Link href="/drop-pin" className="text-sm text-muted-foreground hover:text-primary transition-colors">Drop Pin</Link>
                <Link href="/state-maps" className="text-sm text-muted-foreground hover:text-primary transition-colors">State Maps</Link>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link>
              </nav>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Resources</h4>
              <nav className="flex flex-col gap-3">
                <Link href="/blog/nipost-services-guide" className="text-sm text-muted-foreground hover:text-primary transition-colors">NIPOST Guide</Link>
              </nav>
            </div>

            {/* About */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">About</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Helping Nigerians find accurate postal codes since 2024.
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-border/50 mt-8 pt-6">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              (c) {new Date().getFullYear()} AI-based Nigeria Zip Postal Code Finder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
