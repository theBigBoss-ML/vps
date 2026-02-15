import { useMemo } from 'react';

interface BlogContentProps {
  content: string;
}

export function BlogContent({ content }: BlogContentProps) {
  const htmlContent = useMemo(() => {
    let html = content;

    // Convert headings with IDs for TOC linking
    html = html.replace(/^### (.+)$/gm, (_, title) => {
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return `<h3 id="${id}" class="text-lg font-semibold mt-8 mb-3 text-foreground text-center scroll-mt-24">${title}</h3>`;
    });

    html = html.replace(/^## (.+)$/gm, (_, title) => {
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return `<h2 id="${id}" class="text-xl font-bold mt-10 mb-4 text-foreground text-center border-b border-border/50 pb-2 scroll-mt-24">${title}</h2>`;
    });

    // Convert bold text
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');

    // Convert paragraphs
    html = html
      .split('\n\n')
      .map((para) => {
        if (para.startsWith('<h') || para.trim() === '') return para;
        return `<p class="text-muted-foreground leading-relaxed text-center mb-4">${para}</p>`;
      })
      .join('\n');

    return html;
  }, [content]);

  return (
    <article 
      className="prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
