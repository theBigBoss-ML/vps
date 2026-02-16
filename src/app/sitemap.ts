import type { MetadataRoute } from 'next';
import { statePageData } from '@/data/statePageData';
import { getAllBlogPosts } from '@/data/blogPosts';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://postminer.com.ng';

export default function sitemap(): MetadataRoute.Sitemap {
  // Core pages with meaningful fixed dates (update when content changes)
  const corePages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: '2026-02-16',
    },
    {
      url: `${siteUrl}/drop-pin`,
      lastModified: '2026-02-15',
    },
    {
      url: `${siteUrl}/state-maps`,
      lastModified: '2026-02-15',
    },
    {
      url: `${siteUrl}/postal-codes`,
      lastModified: '2026-02-16',
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: '2026-02-16',
    },
  ];

  // State pages
  const statePages: MetadataRoute.Sitemap = statePageData.map((state) => ({
    url: `${siteUrl}/postal-codes/${state.slug}`,
    lastModified: '2026-02-16',
  }));

  // Blog pages with actual content dates
  const blogPages: MetadataRoute.Sitemap = getAllBlogPosts().map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt ?? post.publishedAt,
  }));

  return [...corePages, ...blogPages, ...statePages];
}
