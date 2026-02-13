"use client";

import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { MapPin, MagnifyingGlass, Crosshair, BookOpen, Calendar } from '@phosphor-icons/react';
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
import { getAllBlogPosts } from '@/data/blogPosts';
import { toast } from 'sonner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const PostalCodeDisplay = dynamic(
  () => import('@/components/finder/PostalCodeDisplay').then((mod) => mod.PostalCodeDisplay),
  { ssr: false }
);

const Index = () => {
  const [status, setStatus] = useState<LookupStatus>('idle');
  const [result, setResult] = useState<LocationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('manual');
  
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
  const homepageGuide = getAllBlogPosts()[0];
  const guidePublishedDate = homepageGuide
    ? new Date(homepageGuide.publishedAt).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

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
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What mail options does NIPOST provide?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'NIPOST supports first class, second class, and registered mail options for different delivery priorities and handling requirements.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which delivery method should I choose in Nigeria?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Choose post office box for private collection, PMB for high mail volume, and street delivery when formal addressing is stable.',
        },
      },
      {
        '@type': 'Question',
        name: 'What can I do at a NIPOST counter?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can buy stamps, send inland money orders, purchase postal orders, and access additional agency-related postal services.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why is the right Nigeria zip postal code important?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Correct postal codes improve routing accuracy, reduce failed deliveries, and help forms, banks, and ecommerce systems verify destinations.',
        },
      },
    ],
  };

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
              <h1 className="text-lg font-bold text-foreground">Postminer.com.ng</h1>
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
              href="/#nipost-guide" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              NIPOST Guide
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
            <div className="text-center space-y-4 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                <Crosshair className="h-3 w-3" />
                AI-assisted GPS + Smart Search
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.15] text-foreground max-w-[20ch] mx-auto">
                Find Your Nigeria Zip Postal Code
                <span className="block mt-1">
                  in a{" "}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-primary/35 bg-primary/15 text-primary shadow-sm shadow-primary/20">
                    Split Second
                  </span>
                </span>
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-[52ch] mx-auto">
                Get accurate Nigeria zip postal codes instantly using GPS detection or manual location search.
              </p>
            </div>

            {(error || geoError) && (
              <ErrorMessage 
                message={error || geoError || ''} 
                onDismiss={() => { setError(null); clearError(); }} 
              />
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="gps" className="gap-2 h-10" disabled={permissionStatus === 'denied'}>
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  Use GPS
                  <span
                    className={`text-[10px] text-muted-foreground ${
                      permissionStatus === 'denied' ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    (disabled)
                  </span>
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

      {homepageGuide && (
        <section id="nipost-guide" className="border-t border-border/50 bg-gradient-to-b from-card/10 to-background">
          <div className="container mx-auto px-4 py-10 md:py-14 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  <BookOpen className="h-3 w-3" />
                  Postal Code Help Center
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Nigeria Zip Postal Code Guide for Delivery, Forms, and Online Orders
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  You can use this page to quickly find a Nigeria zip postal code, then use the right code on delivery
                  addresses, ecommerce checkouts, bank forms, and government applications. Accurate postcode details reduce
                  failed deliveries, routing delays, and returned mail.
                </p>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  NIPOST (Nigerian Postal Service) is the national mail carrier for letters, parcels, and official postal
                  products. The guide below summarizes core NIPOST mail services and practical delivery options without
                  pulling users away from the main finder flow.
                </p>
                {guidePublishedDate && (
                  <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Guide updated: {guidePublishedDate}
                  </p>
                )}
              </div>

              <aside className="lg:col-span-5">
                <div className="h-full p-5 md:p-6 bg-card/60 border border-border/50 rounded-2xl space-y-4">
                  <h3 className="text-base md:text-lg font-semibold text-foreground">
                    Quick Steps After You Find Your Postal Code
                  </h3>
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 h-5 w-5 rounded-full bg-primary/15 text-primary text-xs font-semibold flex items-center justify-center">1</span>
                      Confirm your full address details: street, area, LGA, and state.
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 h-5 w-5 rounded-full bg-primary/15 text-primary text-xs font-semibold flex items-center justify-center">2</span>
                      Use the exact postal code in forms and checkout fields to improve delivery accuracy.
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 h-5 w-5 rounded-full bg-primary/15 text-primary text-xs font-semibold flex items-center justify-center">3</span>
                      For business mail volume, choose a NIPOST option like PO Box or Private Mail Bag (PMB).
                    </li>
                  </ol>
                </div>
              </aside>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <article className="p-5 bg-card/50 border border-border/50 rounded-xl">
                <h3 className="text-sm font-semibold text-foreground mb-2">Mail Classes</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  NIPOST supports first class mail, second class mail, and registered mail. Registered mail is used for
                  sensitive items and includes special handling with additional postage fees.
                </p>
              </article>
              <article className="p-5 bg-card/50 border border-border/50 rounded-xl">
                <h3 className="text-sm font-semibold text-foreground mb-2">Delivery Channels</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Delivery options include post office boxes, private mail bags, street delivery, post restante, and caller
                  services. Your best option depends on security, volume, and access.
                </p>
              </article>
              <article className="p-5 bg-card/50 border border-border/50 rounded-xl">
                <h3 className="text-sm font-semibold text-foreground mb-2">Counter Services</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Major post office counters provide postal orders, inland money orders, postage stamps, air letter cards,
                  and post cards used for domestic and international mailing needs.
                </p>
              </article>
            </div>

            <div className="mt-8 p-5 md:p-6 bg-card/60 border border-border/50 rounded-2xl">
              <h3 className="text-lg font-semibold text-foreground mb-2">Common NIPOST Services Explained</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {homepageGuide.excerpt}
              </p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="mail-options">
                  <AccordionTrigger className="text-left text-sm">What mail options does NIPOST provide?</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    NIPOST handles first class and second class letters, registered mail, and business mail processing.
                    Registered mail is preferred when you need tracking discipline and careful handling.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="delivery-methods">
                  <AccordionTrigger className="text-left text-sm">Which delivery method should I choose in Nigeria?</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    Use a post office box for privacy and predictable collection, PMB for higher mail volume, and street
                    delivery where formal addressing is stable. Travelers can use post restante for temporary collection.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="postal-products">
                  <AccordionTrigger className="text-left text-sm">What can I do at a NIPOST counter?</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    You can buy postage stamps and air letter cards, send inland money orders, and purchase Nigerian postal
                    orders. Many counters also support agency services tied to public forms and payments.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="why-code-matters">
                  <AccordionTrigger className="text-left text-sm">Why is the right Nigeria zip postal code important?</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    The right postal code improves sorting and dispatch, reduces failed delivery attempts, and helps banks,
                    ecommerce systems, and logistics providers verify destination details correctly.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

          </div>
        </section>
      )}

      {/* Location Permission Modal */}
      <LocationPermissionModal
        open={showModal}
        onOpenChange={setShowModal}
        permissionStatus={permissionStatus}
        onRequestPermission={requestPermission}
        onSkip={markModalSeen}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <footer className="border-t border-border/50 py-8 md:py-12 bg-card/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
                <div className="p-1.5 bg-primary/20 rounded-lg">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Postminer.com.ng</h3>
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
                <Link href="/#nipost-guide" className="text-sm text-muted-foreground hover:text-primary transition-colors">NIPOST Guide</Link>
              </nav>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Resources</h4>
              <nav className="flex flex-col gap-3">
                <Link href="/#nipost-guide" className="text-sm text-muted-foreground hover:text-primary transition-colors">NIPOST Services</Link>
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
              (c) {new Date().getFullYear()} Postminer.com.ng. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
