export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    role?: string;
  };
  publishedAt: string;
  updatedAt?: string;
  readingTime: number;
  category: string;
  tags: string[];
  featuredImage?: string;
  tableOfContents: TableOfContentsItem[];
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
}

export function generateTableOfContents(content: string): TableOfContentsItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const toc: TableOfContentsItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    toc.push({ id, title, level });
  }

  return toc;
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}
