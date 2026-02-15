import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug, getAllBlogPosts } from '@/data/blogPosts';
import BlogPostClient from './BlogPostClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://postminer.com.ng';

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) return {};

  const canonical = `/blog/${post.slug}`;

  return {
    title: `${post.title} | Postminer`,
    description: post.excerpt,
    alternates: {
      canonical,
      languages: { 'en-ng': canonical, 'x-default': canonical },
    },
    openGraph: {
      type: 'article',
      url: `${siteUrl}${canonical}`,
      title: post.title,
      description: post.excerpt,
      siteName: 'Postminer.com.ng',
      locale: 'en_NG',
      images: [{ url: '/icon-512.png', width: 512, height: 512, alt: 'Postminer.com.ng' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
    robots: { index: true, follow: true },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getAllBlogPosts()
    .filter((item) => item.slug !== slug)
    .slice(0, 2);

  return <BlogPostClient post={post} relatedPosts={relatedPosts} />;
}
