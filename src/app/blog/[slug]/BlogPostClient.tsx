"use client";

import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, User, Tag, ShareNetwork, CaretRight } from '@phosphor-icons/react';
import { BlogPost } from '@/types/blog';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { BlogContent } from '@/components/blog/BlogContent';
import { ThemeToggle } from '@/components/finder/ThemeToggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTheme } from '@/hooks/useTheme';

interface BlogPostClientProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

export default function BlogPostClient({ post, relatedPosts }: BlogPostClientProps) {
  const { theme, toggleTheme } = useTheme();

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="font-semibold hidden sm:inline">Nigeria Zip Code</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
              Blog
            </Link>
          </div>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <CaretRight className="h-4 w-4" />
          <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
          <CaretRight className="h-4 w-4" />
          <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-8">
            {/* Post Header */}
            <header className="mb-8">
              <Badge variant="secondary" className="mb-4">
                {post.category}
              </Badge>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
                {post.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                {post.excerpt}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-6 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">{post.author.name}</p>
                    {post.author.role && (
                      <p className="text-xs">{post.author.role}</p>
                    )}
                  </div>
                </div>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {post.readingTime} min read
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="ml-auto"
                >
                  <ShareNetwork className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </header>

            {/* Mobile TOC */}
            <div className="lg:hidden mb-8">
              <TableOfContents items={post.tableOfContents} />
            </div>

            {/* Article Content */}
            <BlogContent content={post.content} />

            {/* Tags */}
            <div className="mt-10 pt-6 border-t border-border/50">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-10 p-6 bg-card/50 border border-border/50 rounded-xl text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Find Your Nigeria Zip Postal Code
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Use our AI-based Nigeria zip postal code finder to locate your postal code instantly.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Find Postal Code
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <TableOfContents items={post.tableOfContents} />

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="p-4 bg-card/50 border border-border/50 rounded-xl">
                  <h4 className="text-sm font-semibold text-foreground mb-4">Related Articles</h4>
                  <div className="space-y-3">
                    {relatedPosts.map((relatedPost) => (
                      <Link
                        key={relatedPost.id}
                        href={`/blog/${relatedPost.slug}`}
                        className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <h5 className="text-sm font-medium text-foreground line-clamp-2">
                          {relatedPost.title}
                        </h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          {relatedPost.readingTime} min read
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>(c) {new Date().getFullYear()} AI-based Nigeria Zip Postal Code Finder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
