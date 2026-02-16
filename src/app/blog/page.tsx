import type { Metadata } from 'next';
import { getAllBlogPosts } from '@/data/blogPosts';
import BlogPageClient from './BlogPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://postminer.com.ng';

const pageTitle = 'Nigeria Zip Postal Code Blog — Guides, Tips & NIPOST Resources';
const pageDescription =
  'Read expert guides on Nigeria zip postal codes, NIPOST services, mail delivery options, and postal history. Everything about the Nigerian postal system.';

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: '/blog',
    languages: { 'en-ng': '/blog', 'x-default': '/blog' },
  },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/blog`,
    title: pageTitle,
    description: pageDescription,
    siteName: 'Postminer.com.ng',
    locale: 'en_NG',
    images: [{ url: '/icon-512.png', width: 512, height: 512, alt: 'Postminer.com.ng' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
  },
  robots: { index: true, follow: true },
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BlogPageClient posts={posts} />
    </>
  );
}
