"use client";

import dynamic from 'next/dynamic';
import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, MagnifyingGlass, Globe, ArrowRight, MapTrifold } from '@phosphor-icons/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LocationButton } from '@/components/finder/LocationButton';
import { SmartSearch } from '@/components/finder/SmartSearch';
import { ManualSearch } from '@/components/finder/ManualSearch';
import { RecentLocations } from '@/components/finder/RecentLocations';
import { ErrorMessage } from '@/components/finder/ErrorMessage';
import { LoadingState } from '@/components/finder/LoadingState';
import { ThemeToggle } from '@/components/finder/ThemeToggle';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useRecentLocations } from '@/hooks/useRecentLocations';
import { useTheme } from '@/hooks/useTheme';
import { useUsageStats } from '@/hooks/useUsageStats';
import { LocationResult, LookupStatus } from '@/types/location';
import { rateLimitedGetPostalCode } from '@/lib/postalCodeService';
import { toast } from 'sonner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { StatePageData } from '@/data/statePageData';

const PostalCodeDisplay = dynamic(
  () => import('@/components/finder/PostalCodeDisplay').then((mod) => mod.PostalCodeDisplay),
  { ssr: false }
);

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://postminer.com.ng';

interface StatePageClientProps {
  data: StatePageData;
  relatedStates: StatePageData[];
}

export default function StatePageClient({ data, relatedStates }: StatePageClientProps) {
  const { theme, toggleTheme } = useTheme();
  const { trackStat } = useUsageStats();
  const { recentLocations, addRecentLocation, clearRecentLocations } = useRecentLocations();
  const { getCurrentPosition, error: geoError, clearError, accuracy, accuracyLevel } = useGeolocation();

  const [status, setStatus] = useState<LookupStatus>('idle');
  const [result, setResult] = useState<LocationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('gps');

  const isLoading = status === 'detecting' || status === 'geocoding';

  const handleDetectLocation = useCallback(async () => {
    setError(null);
    clearError();
    setStatus('detecting');

    const coords = await getCurrentPosition();
    if (!coords) {
      setStatus('error');
      setError(geoError || 'Could not detect location. Please enable location services and try again.');
      return;
    }

    setStatus('geocoding');
    try {
      const locationResult = await rateLimitedGetPostalCode(coords.lat, coords.lng);
      if (locationResult) {
        setResult(locationResult);
        setStatus('success');
        trackStat('generation', locationResult.postalCode);
        addRecentLocation({
          postalCode: locationResult.postalCode,
          address: locationResult.address,
          area: locationResult.area,
          lga: locationResult.lga,
        });
        toast.success('Postal code found!');
      } else {
        setError('Could not determine postal code for your location. Try manual search.');
        setStatus('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Location detection failed.');
      setStatus('error');
    }
  }, [getCurrentPosition, clearError, geoError, trackStat, addRecentLocation]);

  const handleSmartSearch = useCallback((searchResult: { postalCode: string; area: string; locality: string; lga: string; state: string }) => {
    const locationResult: LocationResult = {
      postalCode: searchResult.postalCode,
      source: 'database',
      address: `${searchResult.locality}, ${searchResult.area}, ${searchResult.lga}, ${searchResult.state}`,
      lga: searchResult.lga,
      area: searchResult.area,
      state: searchResult.state,
      confidence: 90,
      coordinates: { lat: 0, lng: 0 },
      timestamp: new Date(),
    };
    setResult(locationResult);
    setStatus('success');
    addRecentLocation({
      postalCode: searchResult.postalCode,
      address: locationResult.address,
      area: searchResult.area,
      lga: searchResult.lga,
    });
    trackStat('generation', searchResult.postalCode);
    toast.success('Postal code found!');
  }, [trackStat, addRecentLocation]);

  const handleManualSearch = useCallback(async (state: string, lga: string) => {
    setError(null);
    setStatus('geocoding');
    try {
      const response = await fetch('/api/lookup/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, lga }),
      });
      const responseData = await response.json();

      if (responseData.result) {
        const locationResult: LocationResult = {
          postalCode: responseData.result.postalCode,
          source: 'database',
          address: responseData.result.address,
          lga: responseData.result.lga,
          area: responseData.result.area,
          state: responseData.result.state,
          confidence: 100,
          coordinates: { lat: 0, lng: 0 },
          timestamp: new Date(),
        };
        setResult(locationResult);
        setStatus('success');
        trackStat('generation', responseData.result.postalCode);
      } else {
        setError('No postal code found for that combination.');
        setStatus('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Manual search failed.');
      setStatus('error');
    }
  }, [trackStat]);

  const handleSelectRecent = useCallback((location: { postalCode: string; address: string; area: string | null; lga: string | null }) => {
    setResult({
      postalCode: location.postalCode,
      source: 'database',
      address: location.address,
      lga: location.lga,
      area: location.area,
      state: data.name,
      confidence: 0.8,
      coordinates: { lat: 0, lng: 0 },
      timestamp: new Date(),
    });
    setStatus('success');
  }, [data.name]);

  const handleReset = useCallback(() => {
    setResult(null);
    setStatus('idle');
    setError(null);
  }, []);

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

  const [lgas, setLgas] = useState<string[]>([]);

  useEffect(() => {
    const stateName = data.name === 'FCT Abuja' ? 'FCT' : data.name;
    fetch(`/api/states?state=${encodeURIComponent(stateName)}`)
      .then((res) => res.json())
      .then((d) => setLgas(d.lgas || []))
      .catch(() => setLgas([]));
  }, [data.name]);

  // Schema markup
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Postal Codes', item: `${siteUrl}/postal-codes` },
      { '@type': 'ListItem', position: 3, name: `${data.name} Postal Code` },
    ],
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-lg font-bold text-foreground">Postminer.com.ng</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link>
            <Link href="/drop-pin" className="text-sm text-muted-foreground hover:text-primary transition-colors hidden sm:block">Drop Pin</Link>
            <Link href="/state-maps" className="text-sm text-muted-foreground hover:text-primary transition-colors hidden sm:block">State Maps</Link>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <nav className="container mx-auto px-4 py-4 max-w-4xl" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
          <li>/</li>
          <li className="text-foreground font-medium">{data.name} Postal Code</li>
        </ol>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero + Tool Section */}
        <section className="container mx-auto px-4 pb-12 max-w-lg">
          <div className="text-center space-y-4 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
              <Globe className="h-3.5 w-3.5" />
              {data.name} &middot; Zone {data.zone}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              Find Your {data.name} Postal Code Instantly
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-[48ch] mx-auto">
              Get your exact {data.name} zip postal code using GPS detection or search. Works for {data.capital} and all {data.lgaCount} LGAs.
            </p>
          </div>

          {/* Tool */}
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
            <div className="space-y-6">
              {(error || geoError) && (
                <ErrorMessage
                  message={error || geoError || ''}
                  onDismiss={() => { setError(null); clearError(); }}
                />
              )}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50 backdrop-blur-sm">
                  <TabsTrigger value="gps" className="gap-2 h-10">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    Use GPS
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

              {/* Alternative methods */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/drop-pin"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-card border border-border/40 rounded-lg hover:border-primary/40 transition-colors"
                >
                  <MapPin className="h-4 w-4 text-primary" />
                  Drop a Pin on Map
                </Link>
                <Link
                  href="/state-maps"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-card border border-border/40 rounded-lg hover:border-primary/40 transition-colors"
                >
                  <MapTrifold className="h-4 w-4 text-primary" />
                  View State Maps
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* State Overview */}
        <section className="border-t border-border/30">
          <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              About {data.name} Postal Codes
            </h2>
            <div className="text-sm md:text-base text-muted-foreground leading-relaxed space-y-4 text-left">
              {data.description.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {/* Quick Facts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              <div className="p-4 bg-card/50 border border-border/40 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">{data.zone}</p>
                <p className="text-xs text-muted-foreground mt-1">NIPOST Zone</p>
              </div>
              <div className="p-4 bg-card/50 border border-border/40 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">{data.lgaCount}</p>
                <p className="text-xs text-muted-foreground mt-1">LGAs</p>
              </div>
              <div className="p-4 bg-card/50 border border-border/40 rounded-lg text-center">
                <p className="text-lg font-bold text-primary">{data.capital}</p>
                <p className="text-xs text-muted-foreground mt-1">Capital</p>
              </div>
              <div className="p-4 bg-card/50 border border-border/40 rounded-lg text-center">
                <p className="text-lg font-bold text-primary">{data.geopoliticalZone.replace('North ', 'N. ').replace('South ', 'S. ')}</p>
                <p className="text-xs text-muted-foreground mt-1">Region</p>
              </div>
            </div>
          </div>
        </section>

        {/* LGA Reference */}
        <section className="border-t border-border/30">
          <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Local Government Areas in {data.name}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {data.name} has {data.lgaCount} LGAs, each with their own postal codes within the {data.postalCodeRange} range.
              Instead of scrolling through a list, just{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-primary hover:underline">
                use the tool above
              </a>{' '}
              to get your exact code.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {lgas.map((lga) => (
                <div key={lga} className="px-3 py-2 bg-card/50 border border-border/40 rounded-lg text-sm text-muted-foreground text-left">
                  {lga}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border/30">
          <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Frequently Asked Questions — {data.name} Postal Codes
            </h2>
            <Accordion type="single" collapsible className="space-y-3 max-w-3xl mx-auto">
              {data.faq.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border border-border/40 rounded-xl px-4">
                  <AccordionTrigger className="text-left text-sm font-medium">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed text-left">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Related States */}
        {relatedStates.length > 0 && (
          <section className="border-t border-border/30">
            <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
                Nearby States
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedStates.map((rs) => (
                  <Link
                    key={rs.slug}
                    href={`/postal-codes/${rs.slug}`}
                    className="p-4 bg-card/50 border border-border/40 rounded-lg hover:border-primary/40 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-foreground">{rs.name}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {rs.capital} &middot; Zone {rs.zone} &middot; {rs.postalCodeRange}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-card/30">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Postminer.com.ng. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Schema Markup */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </div>
  );
}
