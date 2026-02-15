import type { MetadataRoute } from 'next';
import { statePageData } from '@/data/statePageData';
import { getAllBlogPosts } from '@/data/blogPosts';

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
      url: `${siteUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
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

  const blogPages: MetadataRoute.Sitemap = getAllBlogPosts().map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt ?? post.publishedAt,
    changeFrequency: 'yearly' as const,
    priority: 0.7,
  }));

  return [...corePages, ...blogPages, ...statePages];
}
