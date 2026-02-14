import type { MetadataRoute } from 'next';
import { statePageData } from '@/data/statePageData';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://postminer.com.ng';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  // Core pages
  const corePages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/drop-pin`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/state-maps`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blog/history-of-nigerian-postal-services`,
      lastModified: '2026-02-14',
      changeFrequency: 'yearly',
      priority: 0.7,
    },
  ];

  // State pages
  const statePages: MetadataRoute.Sitemap = statePageData.map((state) => ({
    url: `${siteUrl}/postal-codes/${state.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...corePages, ...statePages];
}
