import { useState, useEffect } from 'react';
import { TableOfContentsItem } from '@/types/blog';
import { cn } from '@/lib/utils';
import { List } from '@phosphor-icons/react';

interface TableOfContentsProps {
  items: TableOfContentsItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  };

  if (items.length === 0) return null;

  return (
    <nav className="sticky top-24 p-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
        <List className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold text-foreground">Table of Contents</h4>
      </div>
      <ul className="space-y-1.5 max-h-[60vh] overflow-y-auto scrollbar-thin">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => handleClick(item.id)}
              className={cn(
                'w-full text-left text-sm py-1 px-2 rounded-md transition-all duration-200 hover:bg-muted/50',
                item.level === 3 && 'pl-4',
                activeId === item.id
                  ? 'text-primary font-medium bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
