import type { Metadata } from 'next';
import Link from 'next/link';
import { statePageData } from '@/data/statePageData';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://postminer.com.ng';

export const metadata: Metadata = {
  title: 'All Nigerian States — Find Postal Codes by State',
  description:
    'Browse all 36 Nigerian states and FCT Abuja to find postal codes. Select your state to use GPS detection or search for your exact postal code.',
  alternates: {
    canonical: '/postal-codes',
    languages: { 'en-ng': '/postal-codes', 'x-default': '/postal-codes' },
  },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/postal-codes`,
    title: 'All Nigerian States — Find Postal Codes by State',
    description:
      'Browse all 36 Nigerian states and FCT Abuja to find postal codes. Select your state to use GPS detection or search for your exact postal code.',
    siteName: 'Postminer.com.ng',
    locale: 'en_NG',
    images: [{ url: '/icon-512.png', width: 512, height: 512, alt: 'Postminer.com.ng' }],
  },
  robots: { index: true, follow: true },
};

// Group states by geopolitical zone for organized display
const statesByZone = statePageData.reduce<Record<string, typeof statePageData>>((acc, state) => {
  const zone = state.geopoliticalZone;
  if (!acc[zone]) acc[zone] = [];
  acc[zone].push(state);
  return acc;
}, {});

const zoneOrder = [
  'South West',
  'South East',
  'South South',
  'North Central',
  'North East',
  'North West',
];

export default function StatesHubPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Postal Codes by State',
        item: `${siteUrl}/postal-codes`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Nigerian States — Postal Code Lookup
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Select your state to find postal codes using GPS detection, smart search, or manual lookup.
          </p>
        </div>

        {zoneOrder.map((zone) => {
          const states = statesByZone[zone];
          if (!states || states.length === 0) return null;

          return (
            <section key={zone} className="mb-10">
              <h2 className="text-lg font-semibold text-foreground mb-4 border-b border-border/40 pb-2">
                {zone}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {states
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((state) => (
                    <Link
                      key={state.slug}
                      href={`/postal-codes/${state.slug}`}
                      className="p-4 bg-card/50 border border-border/40 rounded-lg hover:border-primary/40 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {state.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                          Zone {state.zone}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {state.capital} &middot; {state.postalCodeRange}
                      </p>
                    </Link>
                  ))}
              </div>
            </section>
          );
        })}

        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-sm text-primary hover:underline font-medium"
          >
            &larr; Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
