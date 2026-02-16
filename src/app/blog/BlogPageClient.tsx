"use client";

import Link from 'next/link';
import { ArrowLeft, BookOpen, MagnifyingGlass, MapPin } from '@phosphor-icons/react';
import { BlogCard } from '@/components/blog/BlogCard';
import { ThemeToggle } from '@/components/finder/ThemeToggle';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import type { BlogPost } from '@/types/blog';

interface BlogPageClientProps {
  posts: BlogPost[];
}

export default function BlogPageClient({ posts }: BlogPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, toggleTheme } = useTheme();

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-semibold">Postminer.com.ng</span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-4">
            <Link href="/postal-codes" className="text-sm text-muted-foreground hover:text-primary transition-colors hidden sm:block">
              Find by State
            </Link>
            <Link href="/drop-pin" className="text-sm text-muted-foreground hover:text-primary transition-colors hidden sm:block">
              Find on Map
            </Link>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <BookOpen className="h-4 w-4" />
            Blog & Resources
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Nigeria Zip Postal Code Blog
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Learn about Nigeria zip postal codes, NIPOST services, mail delivery, and everything
            you need to know about the Nigerian postal system.
          </p>

          <div className="relative max-w-md mx-auto">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50 border-border/50"
            />
          </div>
        </div>

        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No articles found matching your search.</p>
          </div>
        )}

        <div className="mt-16 text-center p-8 bg-card/50 border border-border/50 rounded-2xl">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Need to Find Your Nigeria Zip Postal Code?
          </h2>
          <p className="text-muted-foreground mb-4">
            Use our AI-based Nigeria zip postal code finder to get your postal code instantly.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Find Your Postal Code
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Link>
        </div>
      </main>

      {/* Footer with navigation */}
      <footer className="border-t border-border/50 py-8 md:py-12 mt-12 bg-card/30">
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
                <Link href="/drop-pin" className="text-sm text-muted-foreground hover:text-primary transition-colors">Find on Map</Link>
                <Link href="/state-maps" className="text-sm text-muted-foreground hover:text-primary transition-colors">State Maps</Link>
                <Link href="/postal-codes" className="text-sm text-muted-foreground hover:text-primary transition-colors">All States</Link>
                <Link href="/blog" className="text-sm text-primary font-medium">Blog</Link>
              </nav>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Top States</h4>
              <nav className="flex flex-col gap-3">
                <Link href="/postal-codes/lagos" className="text-sm text-muted-foreground hover:text-primary transition-colors">Lagos Postal Code</Link>
                <Link href="/postal-codes/fct-abuja" className="text-sm text-muted-foreground hover:text-primary transition-colors">Abuja Postal Code</Link>
                <Link href="/postal-codes/rivers" className="text-sm text-muted-foreground hover:text-primary transition-colors">Rivers Postal Code</Link>
              </nav>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">About</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Helping Nigerians find accurate postal codes.
              </p>
            </div>
          </div>
          <div className="border-t border-border/50 mt-8 pt-6">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              &copy; {new Date().getFullYear()} Postminer.com.ng. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
