"use client";

import dynamic from 'next/dynamic';
import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, MagnifyingGlass, Crosshair, BookOpen, Calendar, Lightning, CaretDown } from '@phosphor-icons/react';
import { motion, useInView } from 'framer-motion';
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

// ─── Animation Variants ─────────────────────────────────────
const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as const } },
};

// ─── Floating Background Elements ────────────────────────────
const floatingCodes = [
  { id: 1, code: '100001', x: '7%', y: '15%', opacity: 0.05, size: 'text-lg', dur: 7 },
  { id: 2, code: '200272', x: '89%', y: '10%', opacity: 0.04, size: 'text-sm', dur: 9 },
  { id: 3, code: '110001', x: '93%', y: '62%', opacity: 0.035, size: 'text-xs', dur: 6 },
  { id: 4, code: '900001', x: '4%', y: '70%', opacity: 0.04, size: 'text-base', dur: 8 },
  { id: 5, code: '400001', x: '78%', y: '38%', opacity: 0.03, size: 'text-xs', dur: 10 },
  { id: 6, code: '500001', x: '15%', y: '48%', opacity: 0.03, size: 'text-sm', dur: 7.5 },
];

function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent" />

      {/* Dot grid pattern */}
      <motion.div
        className="absolute inset-0 hero-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />

      {/* Radial spotlight */}
      <motion.div
        className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full bg-primary/[0.04] blur-3xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />

      {/* Floating postal code numbers */}
      {floatingCodes.map((item) => (
        <motion.div
          key={item.id}
          className={`absolute font-mono ${item.size} text-primary font-bold select-none`}
          style={{ left: item.x, top: item.y, opacity: item.opacity }}
          animate={{
            y: [-6, 6, -6],
            rotate: [-1.5, 1.5, -1.5],
          }}
          transition={{
            duration: item.dur,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {item.code}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Scroll-Triggered Section Wrapper ────────────────────────
function AnimatedSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Split Second Effect Component ───────────────────────────
function SplitSecondEffect() {
  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay: 0.85,
        type: "spring",
        stiffness: 500,
        damping: 15,
      }}
      className="relative inline-flex items-center"
    >
      {/* Flash glow */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.7, 0] }}
        transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
        className="absolute inset-[-12px] rounded-full bg-primary/30 blur-2xl"
      />

      {/* Expanding ring */}
      <motion.span
        initial={{ scale: 1, opacity: 0 }}
        animate={{ scale: [1, 2.8], opacity: [0.5, 0] }}
        transition={{ delay: 0.95, duration: 0.8, ease: "easeOut" }}
        className="absolute inset-[-6px] rounded-full border-2 border-primary/30"
      />

      {/* Speed line - left */}
      <motion.span
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1], opacity: [0.7, 0] }}
        transition={{ delay: 0.9, duration: 0.45, ease: "easeOut" }}
        className="absolute right-[calc(100%+6px)] top-1/2 -translate-y-1/2 w-16 sm:w-24 h-[2px] bg-gradient-to-l from-primary/60 to-transparent origin-right"
      />

      {/* Speed line - right */}
      <motion.span
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1], opacity: [0.7, 0] }}
        transition={{ delay: 0.9, duration: 0.45, ease: "easeOut" }}
        className="absolute left-[calc(100%+6px)] top-1/2 -translate-y-1/2 w-16 sm:w-24 h-[2px] bg-gradient-to-r from-primary/60 to-transparent origin-left"
      />

      {/* The pill */}
      <span className="split-glow relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary shadow-lg shadow-primary/25 backdrop-blur-sm">
        <Lightning weight="fill" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="font-semibold">Split Second</span>
      </span>

      {/* Continuous breathing glow */}
      <motion.span
        animate={{
          opacity: [0.2, 0.45, 0.2],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-[-4px] rounded-full bg-primary/10 blur-xl -z-10"
      />
    </motion.span>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════
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
    hasSeenModal,
    showModal,
    setShowModal,
    markModalSeen,
    checkPermission,
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

    const latestPermission = await checkPermission();
    const shouldRepromptOnGpsAttempt =
      hasSeenModal && (latestPermission === 'prompt' || latestPermission === 'denied');

    if (shouldRepromptOnGpsAttempt) {
      setShowModal(true);
      setStatus('idle');
      return;
    }

    setStatus('detecting');

    const coords = await getCurrentPosition();
    if (!coords) {
      const deniedPermissionMessage =
        'Location access denied. Please enable location permissions in your browser settings, then try again.';
      const genericPermissionMessage =
        'Could not detect location. Please enable location services and try again.';
      const shouldShowDeniedGuidance = latestPermission === 'denied';

      setStatus('error');
      setError(geoError || (shouldShowDeniedGuidance ? deniedPermissionMessage : genericPermissionMessage));
      if (shouldShowDeniedGuidance) {
        setShowModal(true);
      }
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
  }, [getCurrentPosition, checkPermission, hasSeenModal, geoError, addRecentLocation, trackStat, setShowModal]);

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

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg z-50">
        Skip to main content
      </a>

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="border-b border-border/40 bg-card/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-primary/15 rounded-xl border border-primary/10">
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

      {/* ── Main Content ───────────────────────────────────── */}
      <main id="main-content" className="flex-1">
        {status === 'success' && result ? (
          <div className="container mx-auto px-4 py-8 max-w-lg">
            <PostalCodeDisplay
              result={result}
              onReset={handleReset}
              onCopy={handleCopy}
              onFeedback={handleFeedback}
            />
          </div>
        ) : isLoading ? (
          <div className="container mx-auto px-4 py-8 max-w-lg">
            <LoadingState status={status} />
          </div>
        ) : (
          /* ── Hero Section ─────────────────────────────── */
          <div className="relative">
            <div className="relative min-h-[65vh] sm:min-h-[55vh] flex items-center justify-center px-4 py-16 sm:py-20">
              <HeroBackground />

              <div className="relative z-10 w-full max-w-lg mx-auto space-y-8">
                {/* Hero Text Content */}
                <motion.div
                  className="text-center space-y-5"
                  initial="hidden"
                  animate="show"
                  variants={staggerContainer}
                >
                  {/* Badge */}
                  <motion.div variants={fadeUp}>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20 backdrop-blur-sm">
                      <Crosshair className="h-3.5 w-3.5" />
                      AI-assisted GPS + Smart Search
                    </div>
                  </motion.div>

                  {/* Headline */}
                  <motion.h2
                    variants={fadeUp}
                    className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.1] text-foreground"
                  >
                    Find Your Nigeria Zip Postal Code
                    <span className="block mt-2">
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.65, duration: 0.3 }}
                      >
                        in a{" "}
                      </motion.span>
                      <SplitSecondEffect />
                    </span>
                  </motion.h2>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.15, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                    className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-[48ch] mx-auto"
                  >
                    Get accurate Nigeria zip postal codes instantly using GPS detection or manual location search.
                  </motion.p>
                </motion.div>

                {/* Error Message */}
                {(error || geoError) && (
                  <ErrorMessage
                    message={error || geoError || ''}
                    onDismiss={() => { setError(null); clearError(); }}
                  />
                )}

                {/* Tabs */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.35, duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
                >
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
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.2, duration: 0.6 }}
                  className="flex justify-center pt-2"
                >
                  <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-muted-foreground/40"
                  >
                    <CaretDown className="h-5 w-5" />
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* Gradient fade at bottom of hero */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          </div>
        )}
      </main>

      {/* ── Stats Section ──────────────────────────────────── */}
      <div className="gradient-divider" />
      <UsageStatsDisplay
        generations={stats.generations}
        likes={stats.likes}
        copies={stats.copies}
        loading={statsLoading}
      />

      {/* ── NIPOST Guide Section ───────────────────────────── */}
      {homepageGuide && (
        <section id="nipost-guide" className="border-t border-border/30 bg-gradient-to-b from-card/10 to-background">
          <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              <AnimatedSection className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/15">
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
              </AnimatedSection>

              <AnimatedSection delay={0.15} className="lg:col-span-5">
                <aside className="h-full p-5 md:p-6 bg-card/60 border border-border/40 rounded-2xl space-y-4 card-hover">
                  <h3 className="text-base md:text-lg font-semibold text-foreground">
                    Quick Steps After You Find Your Postal Code
                  </h3>
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 h-5 w-5 rounded-full bg-primary/15 text-primary text-xs font-semibold flex items-center justify-center shrink-0">1</span>
                      Confirm your full address details: street, area, LGA, and state.
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 h-5 w-5 rounded-full bg-primary/15 text-primary text-xs font-semibold flex items-center justify-center shrink-0">2</span>
                      Use the exact postal code in forms and checkout fields to improve delivery accuracy.
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 h-5 w-5 rounded-full bg-primary/15 text-primary text-xs font-semibold flex items-center justify-center shrink-0">3</span>
                      For business mail volume, choose a NIPOST option like PO Box or Private Mail Bag (PMB).
                    </li>
                  </ol>
                </aside>
              </AnimatedSection>
            </div>

            {/* Three Info Cards */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: 'Mail Classes',
                  text: 'NIPOST supports first class mail, second class mail, and registered mail. Registered mail is used for sensitive items and includes special handling with additional postage fees.',
                },
                {
                  title: 'Delivery Channels',
                  text: 'Delivery options include post office boxes, private mail bags, street delivery, post restante, and caller services. Your best option depends on security, volume, and access.',
                },
                {
                  title: 'Counter Services',
                  text: 'Major post office counters provide postal orders, inland money orders, postage stamps, air letter cards, and post cards used for domestic and international mailing needs.',
                },
              ].map((card, i) => (
                <AnimatedSection key={card.title} delay={i * 0.1}>
                  <article className="p-5 bg-card/50 border border-border/40 rounded-xl card-hover h-full">
                    <h3 className="text-sm font-semibold text-foreground mb-2">{card.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{card.text}</p>
                  </article>
                </AnimatedSection>
              ))}
            </div>

            {/* FAQ Accordion */}
            <AnimatedSection className="mt-8">
              <div className="p-5 md:p-6 bg-card/60 border border-border/40 rounded-2xl">
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
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* ── Location Permission Modal ──────────────────────── */}
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

      {/* ── Footer ─────────────────────────────────────────── */}
      <div className="gradient-divider" />
      <footer className="py-8 md:py-12 bg-card/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
                <div className="p-1.5 bg-primary/15 rounded-lg border border-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Postminer.com.ng</h3>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-based Nigeria zip postal code lookup using GPS or smart search.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Quick Links</h4>
              <nav className="flex flex-col gap-3">
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link>
                <Link href="/drop-pin" className="text-sm text-muted-foreground hover:text-primary transition-colors">Drop Pin</Link>
                <Link href="/state-maps" className="text-sm text-muted-foreground hover:text-primary transition-colors">State Maps</Link>
                <Link href="/#nipost-guide" className="text-sm text-muted-foreground hover:text-primary transition-colors">NIPOST Guide</Link>
              </nav>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Resources</h4>
              <nav className="flex flex-col gap-3">
                <Link href="/#nipost-guide" className="text-sm text-muted-foreground hover:text-primary transition-colors">NIPOST Services</Link>
              </nav>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">About</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Helping Nigerians find accurate postal codes since 2024.
              </p>
            </div>
          </div>

          <div className="gradient-divider mt-8 mb-6" />
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            (c) {new Date().getFullYear()} Postminer.com.ng. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
