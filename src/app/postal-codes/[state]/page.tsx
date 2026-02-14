import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { statePageData, type StatePageData } from '@/data/statePageData';
import StatePageClient from './StatePageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://postminer.com.ng';

function getStateData(slug: string): StatePageData | undefined {
  return statePageData.find((s) => s.slug === slug);
}

export function generateStaticParams() {
  return statePageData.map((s) => ({ state: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state: slug } = await params;
  const data = getStateData(slug);
  if (!data) return {};

  const canonical = `/postal-codes/${data.slug}`;

  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: {
      canonical,
      languages: { 'en-ng': canonical, 'x-default': canonical },
    },
    openGraph: {
      type: 'article',
      url: `${siteUrl}${canonical}`,
      title: data.metaTitle,
      description: data.metaDescription,
      siteName: 'Postminer.com.ng',
      locale: 'en_NG',
      images: [{ url: '/icon-512.png', width: 512, height: 512, alt: 'Postminer.com.ng' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.metaTitle,
      description: data.metaDescription,
    },
    robots: { index: true, follow: true },
  };
}

export default async function StatePage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state: slug } = await params;
  const data = getStateData(slug);
  if (!data) notFound();

  const relatedStates = data.relatedStates
    .map((rs) => statePageData.find((s) => s.slug === rs))
    .filter(Boolean) as StatePageData[];

  return <StatePageClient data={data} relatedStates={relatedStates} />;
}
