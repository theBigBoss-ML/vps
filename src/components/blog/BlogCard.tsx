import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from '@phosphor-icons/react';
import { BlogPost } from '@/types/blog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className="group h-full flex flex-col overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <CardHeader className="pb-3 text-center">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Badge variant="secondary" className="text-xs font-medium">
            {post.category}
          </Badge>
        </div>
        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-lg font-semibold leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>
      </CardHeader>

      <CardContent className="flex-1 pb-3 text-center">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {post.excerpt}
        </p>
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/50 flex flex-col items-center gap-3">
        <div className="flex items-center justify-center w-full text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime} min read
            </span>
          </div>
        </div>

        <Link
          href={`/blog/${post.slug}`}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors self-center"
        >
          Read article
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </CardFooter>
    </Card>
  );
}
