"use client";

import dynamic from 'next/dynamic';
import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, MagnifyingGlass, Globe, BookOpen, Calendar, Timer, CaretDown } from '@phosphor-icons/react';
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
        <Timer weight="fill" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
    showModal,
    modalOpenReason,
    markModalSeen,
    checkPermission,
    requestPermission,
    showModalForGpsAttempt,
    handleModalOpenChange,
  } = useLocationPermission();
  const homepageGuide = getAllBlogPosts()[0];
  const guidePublishedDate = homepageGuide
    ? new Date(homepageGuide.publishedAt).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const performGpsLookup = useCallback(async () => {
    setError(null);
    setResult(null);
    setStatus('detecting');

    const coords = await getCurrentPosition();
    if (!coords) {
      const latestPermission = await checkPermission();
      const deniedPermissionMessage =
        'Location access denied. Please enable location permissions in your browser settings, then try again.';
      const genericPermissionMessage =
        'Could not detect location. Please enable location services and try again.';
      const shouldShowDeniedGuidance = latestPermission === 'denied';

      setStatus('error');
      setError(geoError || (shouldShowDeniedGuidance ? deniedPermissionMessage : genericPermissionMessage));
      if (shouldShowDeniedGuidance) {
        showModalForGpsAttempt();
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
  }, [getCurrentPosition, checkPermission, geoError, addRecentLocation, trackStat, showModalForGpsAttempt]);

  const handleDetectLocation = useCallback(async () => {
    setError(null);
    setResult(null);

    const latestPermission = await checkPermission();

    if (latestPermission === 'granted') {
      return performGpsLookup();
    }

    if (latestPermission === 'prompt' || latestPermission === 'denied') {
      showModalForGpsAttempt();
      return;
    }

    // unavailable or unknown
    setStatus('error');
    setError('Geolocation is not supported by your browser. Please use manual search.');
  }, [checkPermission, performGpsLookup, showModalForGpsAttempt]);

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
      {
        '@type': 'Question',
        name: 'What is the zip code for Nigeria?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nigeria does not have a single zip code. The country uses a 6-digit postal code system managed by NIPOST, where each area has its own unique code. For example, Lagos starts at 100001 and Abuja at 900001. Use the GPS tool on Postminer.com.ng to find your exact postal code.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the zip code for Lagos, Nigeria?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Lagos postal codes range from 100001 to 112005 across its local government areas. There is no single zip code for all of Lagos. The code depends on your specific area — Ikeja is different from Victoria Island, Surulere, or Ikorodu. Use GPS detection to find the exact code for your location.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the zip code for Abuja, Nigeria?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Abuja (FCT) postal codes start at 900001. Each area council has its own code — Garki, Wuse, Maitama, and Kubwa all use different postal codes. The quickest way to get your exact Abuja postal code is to use GPS detection on this page.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does Nigeria have zip codes?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, but they are officially called postal codes or postcodes. The term zip code is American. Nigeria uses a 6-digit postal code system created by NIPOST. Every area in Nigeria has a unique postal code, and you can find yours instantly using GPS on Postminer.com.ng.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between a zip code and a postal code?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'They mean the same thing. Zip code is the term used in the United States, while postal code or postcode is what most other countries use, including Nigeria. When a form asks for your zip code, enter your Nigerian postal code — it works the same way.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is 23401 or 23402 Nigeria\'s zip code?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. 23401 and 23402 are not valid Nigerian postal codes. This is a common misconception that spread from PayPal and similar platforms. Nigerian postal codes are 6 digits long (like 100001 for Lagos or 900001 for Abuja), not 5 digits. Every location has its own specific code.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I find my zip code in Nigeria?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The fastest way is to use GPS detection on Postminer.com.ng — tap the GPS button and your postal code appears instantly based on your current location. You can also type your address into the smart search, or use the drop-pin map tool to click on any location in Nigeria.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is Nigeria\'s international postal code?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nigeria does not have one international postal code. Each area uses its own 6-digit code. When filling international forms, enter the specific postal code for your address, not a generic country code. Use Postminer.com.ng to find the correct one for your location.',
        },
      },
      {
        '@type': 'Question',
        name: 'How many digits is a Nigerian postal code?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nigerian postal codes are exactly 6 digits. The first digit represents one of 9 NIPOST postal zones. The second and third digits indicate the dispatch district. The last three digits pinpoint the specific delivery area. Codes range from 100001 (Lagos) to 982002.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I use Nigeria zip code for Western Union?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. When Western Union asks for a zip or postal code, enter your actual 6-digit Nigerian postal code for your specific location. Do not use 23401 or any made-up number. Find your correct code using GPS detection on Postminer.com.ng to avoid transaction issues.',
        },
      },
    ],
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Find Your Nigeria Zip Postal Code',
    description: 'Get your Nigerian postal code instantly using GPS detection, smart search, or drop-pin map on Postminer.com.ng.',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Open Postminer',
        text: 'Go to Postminer.com.ng and click the "Use GPS" tab to detect your location automatically, or switch to the "Manual" tab to search by address.',
      },
      {
        '@type': 'HowToStep',
        name: 'Detect your location',
        text: 'Tap the "Detect My Location" button. Your browser will ask for location permission. Once granted, your GPS coordinates are used to find your exact postal code.',
      },
      {
        '@type': 'HowToStep',
        name: 'Get your postal code',
        text: 'Your 6-digit Nigerian postal code appears instantly along with your LGA, area, and full address details. Copy it and use it on any form, checkout, or application.',
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
              <span className="text-lg font-bold text-foreground">Postminer.com.ng</span>
              <p className="text-xs text-muted-foreground hidden sm:block">AI-based, free & fast Nigeria zip postal code lookup</p>
            </div>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-4">
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
              href="/postal-codes/lagos"
              className="text-sm text-muted-foreground hover:text-primary transition-colors hidden lg:block"
            >
              States
            </Link>
            <Link
              href="/blog/history-of-nigerian-postal-services"
              className="text-sm text-muted-foreground hover:text-primary transition-colors hidden lg:block"
            >
              Blog
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
                      <Globe className="h-3.5 w-3.5" />
                      AI-assisted GPS + Smart Search
                    </div>
                  </motion.div>

                  {/* Headline */}
                  <motion.h1
                    variants={fadeUp}
                    className="font-bold tracking-tight text-foreground"
                  >
                    <span className="block text-4xl sm:text-5xl lg:text-6xl leading-tight">
                      Find Your Nigeria Zip Postal Code
                    </span>
                    <span className="block mt-3 text-2xl sm:text-3xl lg:text-4xl leading-[1.1]">
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.65, duration: 0.3 }}
                      >
                        in a{" "}
                      </motion.span>
                      <SplitSecondEffect />
                    </span>
                  </motion.h1>

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

      {/* ── What Is a Nigeria Zip Postal Code? ─────────────── */}
      <section className="border-t border-border/30 bg-gradient-to-b from-background to-card/10">
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl text-center">
          <AnimatedSection className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              What Is a Nigeria Zip Postal Code?
            </h2>
            <div className="space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed text-left max-w-3xl mx-auto">
              <p>
                So here is the deal. Nigeria uses a 6-digit postal code system. Not 5 digits like the US, not 4. Six digits.
                And it is officially called a postal code or postcode — the term &ldquo;zip code&rdquo; is actually an American thing.
                But they mean the same thing, so when any form asks you for a zip code, just enter your Nigerian postal code.
              </p>
              <p>
                NIPOST (Nigerian Postal Service) divided the country into 9 postal zones. The first digit of your postal code tells you which zone you are in.
                The second and third digits represent the dispatch district — basically the sorting hub for outgoing mail.
                And the last three digits narrow it down to your specific delivery area, whether that is a rural community, an urban neighbourhood, or a post office facility.
              </p>
              <p>
                The range goes from 100001 (Lagos, the very first zone) all the way to 982002. Every local government area in every state has its own unique postal code.
              </p>
              <p>
                Now, one thing that confuses a lot of people: <strong>23401 is NOT a valid Nigerian postal code.</strong> This number spread
                from PayPal and similar platforms years ago, and people have been using it ever since. But Nigeria does not have a single national
                zip code. Every area has its own code, and you need the one for YOUR specific location. That is exactly what the GPS tool above does for you — instantly.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Extended FAQ Section ────────────────────────────── */}
      <section className="border-t border-border/30">
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl text-center">
          <AnimatedSection className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Frequently Asked Questions About Nigeria Zip Postal Codes
            </h2>
            <Accordion type="single" collapsible className="w-full space-y-2 text-left">
              <AccordionItem value="what-is-zip-code" className="border border-border/40 rounded-xl px-4">
                <AccordionTrigger className="text-left text-sm font-medium">What is the zip code for Nigeria?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  Nigeria does not have one single zip code for the entire country. Each area has its own unique 6-digit postal code managed by NIPOST.
                  For instance, central Lagos uses 100001, while Abuja starts at 900001. The exact code depends on your specific street and neighbourhood.
                  Use the <a href="#main-content" className="text-primary hover:underline">GPS tool above</a> to get the right one for your location.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="lagos-zip-code" className="border border-border/40 rounded-xl px-4">
                <AccordionTrigger className="text-left text-sm font-medium">What is the zip code for Lagos, Nigeria?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  Lagos postal codes range from 100001 to 112005. There is no single code for all of Lagos because the state covers a massive area with
                  20 local government areas. Ikeja uses a different code from Victoria Island, and Surulere is different from Ikorodu.
                  The fastest way to get your exact Lagos postal code is to tap the GPS button — it picks up your location and returns the right code in seconds.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="abuja-zip-code" className="border border-border/40 rounded-xl px-4">
                <AccordionTrigger className="text-left text-sm font-medium">What is the zip code for Abuja?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  Abuja (FCT) postal codes start at 900001. Each area council — Garki, Wuse, Maitama, Kubwa, Gwagwalada — has its own code.
                  If you need your specific Abuja postal code, the quickest route is GPS detection right here on this page. It works across all FCT area councils.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="does-nigeria-have-zip" className="border border-border/40 rounded-xl px-4">
                <AccordionTrigger className="text-left text-sm font-medium">Does Nigeria have zip codes?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  Yes, but they are officially called postal codes or postcodes. The term &ldquo;zip code&rdquo; is American — Nigeria uses the term postal code.
                  The system is managed by NIPOST, covers all 36 states plus FCT, and uses a 6-digit format. So when a form asks for your zip code,
                  just enter your Nigerian postal code.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="zip-vs-postal" className="border border-border/40 rounded-xl px-4">
                <AccordionTrigger className="text-left text-sm font-medium">What is the difference between a zip code and a postal code?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  They are the same thing, just different names. The United States calls theirs zip codes. Nigeria, the UK, and most other countries
                  call them postal codes or postcodes. If you see a form field labelled &ldquo;zip/postal code,&rdquo; your Nigerian postal code works just fine.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="23401-myth" className="border border-border/40 rounded-xl px-4">
                <AccordionTrigger className="text-left text-sm font-medium">Is 23401 or 23402 Nigeria&apos;s zip code?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  No. This is one of the most common misconceptions. 23401 and 23402 are not valid Nigerian postal codes — they are only 5 digits,
                  while Nigerian postal codes are 6 digits. This myth spread from PayPal and similar platforms. Your actual postal code is specific to your
                  area, and you can find it instantly using the tool on this page.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-to-find" className="border border-border/40 rounded-xl px-4">
                <AccordionTrigger className="text-left text-sm font-medium">How do I find my zip code in Nigeria?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  Three ways, all on this page. First, tap the GPS button and your postal code appears based on your current location. Second, type your
                  address into the smart search field and select the match. Third, use the{' '}
                  <Link href="/drop-pin" className="text-primary hover:underline">drop-pin map</Link> to click on any location in Nigeria.
                  The whole process takes seconds.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="international-code" className="border border-border/40 rounded-xl px-4">
                <AccordionTrigger className="text-left text-sm font-medium">What is Nigeria&apos;s international postal code?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  There is no single &ldquo;international postal code&rdquo; for Nigeria. When filling out international forms or shipping labels,
                  you need to enter the specific postal code for your address. Each area in Nigeria has its own code. Use GPS detection here to
                  get the right one, and use that on any form — domestic or international.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-many-digits" className="border border-border/40 rounded-xl px-4">
                <AccordionTrigger className="text-left text-sm font-medium">How many digits is a Nigerian postal code?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  Exactly 6 digits. The first digit represents your NIPOST postal zone (1 through 9). The second and third digits identify
                  the dispatch district. And the last three digits pinpoint your specific delivery area. The full range is 100001 (Lagos) to 982002.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="western-union" className="border border-border/40 rounded-xl px-4">
                <AccordionTrigger className="text-left text-sm font-medium">Can I use Nigeria zip code for Western Union?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  Yes. When Western Union asks for a zip or postal code, enter your actual 6-digit Nigerian postal code — the one for your specific location.
                  Do not use 23401 or any made-up number. An incorrect code can cause issues with your transaction. Find your correct code using the GPS tool above.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Nigeria Zip Postal Codes by State ──────────────── */}
      <section className="border-t border-border/30 bg-gradient-to-b from-card/10 to-background">
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl text-center">
          <AnimatedSection className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Nigeria Zip Postal Codes by State
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Nigeria has 36 states plus the Federal Capital Territory (Abuja), each with their own postal code ranges.
              Below is a quick reference — or you can skip the reading and just{' '}
              <a href="#main-content" className="text-primary hover:underline">use the GPS tool above</a> to get your code instantly.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { state: 'Abia', slug: 'abia', capital: 'Umuahia', range: '440001–449999', zone: 4 },
                { state: 'Adamawa', slug: 'adamawa', capital: 'Yola', range: '640001–649999', zone: 6 },
                { state: 'Akwa Ibom', slug: 'akwa-ibom', capital: 'Uyo', range: '520001–529999', zone: 5 },
                { state: 'Anambra', slug: 'anambra', capital: 'Awka', range: '420001–434999', zone: 4 },
                { state: 'Bauchi', slug: 'bauchi', capital: 'Bauchi', range: '740001–749999', zone: 7 },
                { state: 'Bayelsa', slug: 'bayelsa', capital: 'Yenagoa', range: '560001–569999', zone: 5 },
                { state: 'Benue', slug: 'benue', capital: 'Makurdi', range: '970001–979999', zone: 9 },
                { state: 'Borno', slug: 'borno', capital: 'Maiduguri', range: '600001–609999', zone: 6 },
                { state: 'Cross River', slug: 'cross-river', capital: 'Calabar', range: '540001–549999', zone: 5 },
                { state: 'Delta', slug: 'delta', capital: 'Asaba', range: '320001–334999', zone: 3 },
                { state: 'Ebonyi', slug: 'ebonyi', capital: 'Abakaliki', range: '480001–489999', zone: 4 },
                { state: 'Edo', slug: 'edo', capital: 'Benin City', range: '300001–312999', zone: 3 },
                { state: 'Ekiti', slug: 'ekiti', capital: 'Ado-Ekiti', range: '360001–369999', zone: 3 },
                { state: 'Enugu', slug: 'enugu', capital: 'Enugu', range: '400001–419999', zone: 4 },
                { state: 'FCT Abuja', slug: 'fct-abuja', capital: 'Abuja', range: '900001–909999', zone: 9 },
                { state: 'Gombe', slug: 'gombe', capital: 'Gombe', range: '760001–769999', zone: 7 },
                { state: 'Imo', slug: 'imo', capital: 'Owerri', range: '460001–474999', zone: 4 },
                { state: 'Jigawa', slug: 'jigawa', capital: 'Dutse', range: '720001–729999', zone: 7 },
                { state: 'Kaduna', slug: 'kaduna', capital: 'Kaduna', range: '800001–819999', zone: 8 },
                { state: 'Kano', slug: 'kano', capital: 'Kano', range: '700001–714999', zone: 7 },
                { state: 'Katsina', slug: 'katsina', capital: 'Katsina', range: '820001–829999', zone: 8 },
                { state: 'Kebbi', slug: 'kebbi', capital: 'Birnin Kebbi', range: '860001–869999', zone: 8 },
                { state: 'Kogi', slug: 'kogi', capital: 'Lokoja', range: '260001–269999', zone: 2 },
                { state: 'Kwara', slug: 'kwara', capital: 'Ilorin', range: '240001–254999', zone: 2 },
                { state: 'Lagos', slug: 'lagos', capital: 'Ikeja', range: '100001–112005', zone: 1 },
                { state: 'Nasarawa', slug: 'nasarawa', capital: 'Lafia', range: '950001–959999', zone: 9 },
                { state: 'Niger', slug: 'niger', capital: 'Minna', range: '910001–923999', zone: 9 },
                { state: 'Ogun', slug: 'ogun', capital: 'Abeokuta', range: '110001–119999', zone: 1 },
                { state: 'Ondo', slug: 'ondo', capital: 'Akure', range: '340001–354999', zone: 3 },
                { state: 'Osun', slug: 'osun', capital: 'Osogbo', range: '230001–234999', zone: 2 },
                { state: 'Oyo', slug: 'oyo', capital: 'Ibadan', range: '200001–219999', zone: 2 },
                { state: 'Plateau', slug: 'plateau', capital: 'Jos', range: '930001–939999', zone: 9 },
                { state: 'Rivers', slug: 'rivers', capital: 'Port Harcourt', range: '500001–511999', zone: 5 },
                { state: 'Sokoto', slug: 'sokoto', capital: 'Sokoto', range: '840001–849999', zone: 8 },
                { state: 'Taraba', slug: 'taraba', capital: 'Jalingo', range: '660001–669999', zone: 6 },
                { state: 'Yobe', slug: 'yobe', capital: 'Damaturu', range: '620001–629999', zone: 6 },
                { state: 'Zamfara', slug: 'zamfara', capital: 'Gusau', range: '880001–889999', zone: 8 },
              ].map((item) => (
                <Link key={item.state} href={`/postal-codes/${item.slug}`} className="p-3 bg-card/50 border border-border/40 rounded-lg card-hover block">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-foreground">{item.state}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-medium">Zone {item.zone}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.capital} &middot; {item.range}</p>
                </Link>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Brief History of Nigerian Postal Services ────── */}
      <section className="border-t border-border/30">
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl text-center">
          <AnimatedSection className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              A Brief History of Nigerian Postal Services
            </h2>
            <div className="space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed text-left max-w-3xl mx-auto">
              <p>
                The history of postal services in Nigeria goes way back — 1852, to be exact. That is when the British Colonial Administration
                established the first post office. At the time, it was basically a branch of London&apos;s General Post Office, and it stayed that way until 1874.
              </p>
              <p>
                By 1862, the Post Office became a full department. Around the same time, the Royal Niger Company (RNC) set up its own postal
                system with offices at Akassa (1887), Calabar (1891), Burutu (1897), and Lokoja (1899). Mail moved between these trading stations
                and Lagos by weekly mail boat.
              </p>
              <p>
                Things picked up from there. By 1906, Nigeria had 27 post offices. By independence in 1960, that number had grown to 176 post offices,
                10 sub-offices, and about 1,000 postal agencies across the country.
              </p>
              <p>
                The modern NIPOST (Nigerian Postal Service) came into being in 1985, and by 1992 it became a full government parastatal through Decree 41.
                But the bigger challenge was always addressing. You cannot deliver mail properly without a proper addressing system, and Nigeria did not have a
                unified one for a long time.
              </p>
              <p>
                It took until 2013 for the Federal Executive Council to approve a National Addressing Policy, and 2014 for the National Economic Council
                to adopt it. That policy is the backbone of the 6-digit postal code system that NIPOST uses today — and the system that Postminer.com.ng
                helps you navigate instantly.
              </p>
            </div>
            <Link
              href="/blog/history-of-nigerian-postal-services"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
            >
              <BookOpen className="h-4 w-4" />
              Read the full history of Nigerian postal services and addressing
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* ── NIPOST Guide Section ───────────────────────────── */}
      {homepageGuide && (
        <section id="nipost-guide" className="border-t border-border/30 bg-gradient-to-b from-card/10 to-background">
          <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl text-center">
            <AnimatedSection className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/15">
                <BookOpen className="h-3 w-3" />
                Postal Services Guide
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                How Nigeria&apos;s Postal System Works
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                NIPOST (Nigerian Postal Service) handles letters, parcels, and official postal products. Here is what you need to know about
                mail classes, delivery options, and counter services.
              </p>
            </AnimatedSection>

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
                  <article className="p-5 bg-card/50 border border-border/40 rounded-xl card-hover h-full text-left">
                    <h3 className="text-sm font-semibold text-foreground mb-2">{card.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{card.text}</p>
                  </article>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Location Permission Modal ──────────────────────── */}
      <LocationPermissionModal
        open={showModal}
        onOpenChange={handleModalOpenChange}
        permissionStatus={permissionStatus}
        modalOpenReason={modalOpenReason}
        onRequestPermission={requestPermission}
        onMarkSeen={markModalSeen}
        onPermissionGranted={performGpsLookup}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
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
              <h4 className="text-sm font-semibold text-foreground mb-4">Top States</h4>
              <nav className="flex flex-col gap-3">
                <Link href="/postal-codes/lagos" className="text-sm text-muted-foreground hover:text-primary transition-colors">Lagos Postal Code</Link>
                <Link href="/postal-codes/fct-abuja" className="text-sm text-muted-foreground hover:text-primary transition-colors">Abuja Postal Code</Link>
                <Link href="/postal-codes/rivers" className="text-sm text-muted-foreground hover:text-primary transition-colors">Rivers Postal Code</Link>
                <Link href="/postal-codes/kano" className="text-sm text-muted-foreground hover:text-primary transition-colors">Kano Postal Code</Link>
                <Link href="/blog/history-of-nigerian-postal-services" className="text-sm text-muted-foreground hover:text-primary transition-colors">Postal History</Link>
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
