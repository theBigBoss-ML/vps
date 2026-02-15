"use client";

import Link from 'next/link';
import { ArrowLeft, BookOpen, MagnifyingGlass } from '@phosphor-icons/react';
import { getAllBlogPosts } from '@/data/blogPosts';
import { BlogCard } from '@/components/blog/BlogCard';
import { ThemeToggle } from '@/components/finder/ThemeToggle';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, toggleTheme } = useTheme();
  const allPosts = getAllBlogPosts();

  const filteredPosts = allPosts.filter(
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
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
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

      <footer className="border-t border-border/50 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>(c) {new Date().getFullYear()} Postminer.com.ng. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
