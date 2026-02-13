# SKILL: UI/Frontend Principles for Striker CMS

## DESIGN PHILOSOPHY

**"Gaming-First, Clean, Fast"**
- Inspired by IGN/GameSpot but cleaner
- Dark mode native (gaming aesthetic)
- Mobile-first responsive
- Performance > fancy animations

## TAILWINDCSS STANDARDS

### Color Palette
```javascript
// tailwind.config.js
theme: {
  colors: {
    // Dark theme (primary)
    bg: {
      primary: '#0a0a0a',
      secondary: '#1a1a1a',
      tertiary: '#2a2a2a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a0a0a0',
      muted: '#666666',
    },
    accent: {
      primary: '#00ff88', // Gaming green
      secondary: '#ff0066', // Hot pink
      warning: '#ffaa00',
    },
    // Game-specific
    fc26: '#0066ff', // EA Blue
    efootball: '#ff3333', // Konami Red
    fm: '#00cc66', // SI Green
  }
}
```

### Typography Scale
```javascript
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  display: ['Poppins', 'sans-serif'], // Headlines
  mono: ['JetBrains Mono', 'monospace'], // Code
},
fontSize: {
  'xs': '0.75rem',    // 12px - Meta info
  'sm': '0.875rem',   // 14px - Body small
  'base': '1rem',     // 16px - Body
  'lg': '1.125rem',   // 18px - Lead text
  'xl': '1.25rem',    // 20px - Small headings
  '2xl': '1.5rem',    // 24px - Section headings
  '3xl': '1.875rem',  // 30px - Page titles
  '4xl': '2.25rem',   // 36px - Hero headlines
  '5xl': '3rem',      // 48px - Homepage hero
}
```

### Spacing System
Use Tailwind's default (4px base) but enforce consistency:
- Sections: `py-12` or `py-16`
- Cards: `p-6` or `p-8`
- Buttons: `px-6 py-3`
- Gaps: `gap-4`, `gap-6`, `gap-8` (multiples of 4)

### Component Patterns

**Article Card:**
```jsx
<article className="group bg-bg-secondary rounded-lg overflow-hidden hover:bg-bg-tertiary transition-colors">
  <img className="aspect-video object-cover w-full" />
  <div className="p-6">
    <span className="text-xs text-accent-primary uppercase font-bold">
      {category}
    </span>
    <h3 className="text-xl font-display font-bold text-text-primary mt-2 group-hover:text-accent-primary transition-colors">
      {title}
    </h3>
    <p className="text-sm text-text-secondary mt-2 line-clamp-2">
      {excerpt}
    </p>
    <div className="flex items-center gap-4 mt-4 text-xs text-text-muted">
      <span>{author}</span>
      <span>•</span>
      <span>{date}</span>
    </div>
  </div>
</article>
```

**Button Variants:**
```jsx
// Primary
className="bg-accent-primary text-bg-primary px-6 py-3 rounded-lg font-bold hover:bg-accent-primary/90 transition-colors"

// Secondary
className="border-2 border-accent-primary text-accent-primary px-6 py-3 rounded-lg font-bold hover:bg-accent-primary hover:text-bg-primary transition-all"

// Ghost
className="text-text-primary hover:text-accent-primary px-6 py-3 transition-colors"
```

## LAYOUT PRINCIPLES

### Grid System
```jsx
// Homepage sections
<section className="container mx-auto px-4 py-12">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Cards */}
  </div>
</section>

// Article page
<article className="container mx-auto px-4 py-8 max-w-4xl">
  {/* Content */}
</article>
```

### Breakpoints
- Mobile: Default (no prefix)
- Tablet: `md:` (768px+)
- Desktop: `lg:` (1024px+)
- Wide: `xl:` (1280px+)

### Mobile-First Rules
1. Stack everything by default
2. Add `md:` for 2-column layouts
3. Add `lg:` for 3+ columns
4. Never use `sm:` (it's confusing)

## PERFORMANCE RULES

### Image Optimization
```jsx
import Image from 'next/image'

// Always use Next.js Image
<Image
  src={url}
  alt={alt}
  width={1200}
  height={675}
  className="aspect-video object-cover"
  loading="lazy"
  quality={85}
/>
```

### Lazy Loading
```jsx
// Below-fold content
<div className="lazy-load" data-threshold="0.1">
  {/* Content */}
</div>
```

### Font Loading
```javascript
// app/layout.tsx
import { Inter, Poppins } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const poppins = Poppins({
  weight: ['600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins'
})
```

## ACCESSIBILITY

### Mandatory Requirements
- All images have `alt` text
- Color contrast ≥ 4.5:1 for text
- Focus states visible (outline)
- Semantic HTML (`article`, `nav`, `main`)
- Keyboard navigation works

### Skip to Content
```jsx
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to content
</a>
```

## ANIMATION STANDARDS

### Transitions
Use Tailwind's transition utilities:
```jsx
className="transition-colors duration-200" // Hover effects
className="transition-transform duration-300" // Slides
className="transition-opacity duration-200" // Fades
```

### NO Auto-Play
- Videos: User must click play
- Carousels: User must swipe/click
- Animations: Respect `prefers-reduced-motion`

## DARK MODE (Default)

No light mode in Phase 1. Design for dark:
- Deep blacks (#0a0a0a, not #000000)
- Avoid pure white text (use #ffffff at 90% opacity)
- Use subtle gradients for depth

## ICONS

Use Lucide React (latest):
```jsx
import { Home, Search, User } from 'lucide-react'

<Home className="w-5 h-5" />
```

## FORMS
```jsx
<input
  className="w-full bg-bg-tertiary border border-text-muted/20 rounded-lg px-4 py-3 text-text-primary focus:border-accent-primary focus:outline-none transition-colors"
  placeholder="Search..."
/>
```

## FORBIDDEN PRACTICES

❌ Inline styles (use Tailwind)
❌ jQuery or other legacy libraries
❌ Auto-play videos
❌ Pop-ups / modals on page load
❌ Infinite scroll (use pagination)
❌ Layout shifts (reserve space for ads)
