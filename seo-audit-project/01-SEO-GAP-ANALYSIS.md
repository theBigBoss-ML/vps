# 01 - SEO GAP ANALYSIS

**Site:** postminer.com.ng
**Framework:** Next.js 16 (App Router) + React 18 + TypeScript + Tailwind CSS
**Deployment:** Vercel
**Audit Date:** 2026-02-16
**Auditor:** SEO Veteran Agent

---

## EXECUTIVE SUMMARY

| Severity   | Count | Description |
|------------|-------|-------------|
| CRITICAL   | 4     | Issues that actively harm indexing or SEO performance |
| HIGH       | 8     | Issues with significant negative SEO impact |
| MEDIUM     | 11    | Issues with moderate impact; improvements needed |
| LOW        | 6     | Minor optimizations and best-practice gaps |
| **TOTAL**  | **29**| |

### Top Critical Findings
1. **Blog listing page (`/blog`) is a client component — NO metadata, NO canonical, NO OG tags** (CRITICAL)
2. **Sitemap uses deprecated `changeFrequency` and `priority` fields** (HIGH)
3. **Sitemap missing `/postal-codes` hub page** (HIGH)
4. **State pages lack FAQ structured data despite having FAQ content** (HIGH)

---

## COMPLETE PAGE INVENTORY

| Route | Type | Rendering | Has Metadata | Has Canonical | Has OG | Has Schema |
|-------|------|-----------|-------------|---------------|--------|------------|
| `/` | Homepage | SSR (noStore) | YES | YES | YES | Organization, WebSite, SoftwareApplication, FAQ, HowTo |
| `/drop-pin` | Tool page | SSG | YES | YES | YES | NONE |
| `/state-maps` | Tool page | SSG (layout) + CSR (page) | YES | YES | YES | BreadcrumbList |
| `/postal-codes` | Hub page | SSG | YES | YES | YES | NONE |
| `/postal-codes/[state]` x37 | State pages | SSG | YES | YES | YES | NONE |
| `/blog` | Blog listing | **CSR** | **NO** | **NO** | **NO** | **NONE** |
| `/blog/[slug]` x2 | Blog posts | SSG | YES | YES | YES | NONE |
| 404 | Error page | CSR | NO (acceptable) | N/A | N/A | N/A |

**Total pages: ~44** (1 home + 1 drop-pin + 1 state-maps + 1 postal-codes + 37 state pages + 1 blog + 2 blog posts)

---

## AUDIT BY CRITERION (16 SECTIONS)

---

### 1. CORE WEB VITALS

**Current State:**
- Font loading uses `display: "optional"` — may cause invisible text flash (FOIT) on slow connections
- Framer Motion loaded on homepage with complex animations (floating elements, staggered reveals, spring animations)
- `leaflet/dist/leaflet.css` imported globally in `layout.tsx` (line 2) — loaded on ALL pages even when not needed (only `/drop-pin` uses Leaflet)
- `PostalCodeDisplay` uses dynamic import with `ssr: false` — good
- State maps page uses `<img>` HTML tag (not Next.js `<Image>`) — no automatic optimization
- Image sitemap references HTTP URLs from web.archive.org

**Issues Found:**

| # | Issue | Severity | File | Line |
|---|-------|----------|------|------|
| 1.1 | Leaflet CSS loaded globally on all pages | MEDIUM | `src/app/layout.tsx` | 2 |
| 1.2 | `font-display: optional` may cause FOIT on slow networks | LOW | `src/app/layout.tsx` | 16, 22 |
| 1.3 | State maps page uses `<img>` instead of `<Image>` | MEDIUM | `src/app/state-maps/page.tsx` | 403 |
| 1.4 | Framer Motion animations may impact INP on low-end devices | LOW | `src/app/HomeClient.tsx` | various |

**What's Implemented Correctly:**
- Dynamic imports for heavy components (PostalCodeDisplay)
- Google Fonts via `next/font` (automatic optimization)
- `productionBrowserSourceMaps: false` in next.config.mjs
- Dark/light theme CSS variables (no layout shift from theme)

---

### 2. CANONICAL TAGS

**Current State:**
- `metadataBase` set to `https://postminer.com.ng` in `layout.tsx` line 47
- All page metadata exports use relative canonicals (`/`, `/drop-pin`, etc.)
- Next.js resolves relative canonicals to absolute URLs using `metadataBase`

**Issues Found:**

| # | Issue | Severity | File | Line |
|---|-------|----------|------|------|
| 2.1 | `/blog` page (client component) cannot export metadata — NO canonical tag | CRITICAL | `src/app/blog/page.tsx` | 1 |
| 2.2 | Blog page has no `<head>` metadata at all (title, description, canonical, OG) | CRITICAL | `src/app/blog/page.tsx` | - |

**What's Implemented Correctly:**
- All other pages have self-referencing canonical tags via Next.js `alternates.canonical`
- Canonical URLs use consistent format (no trailing slash inconsistencies)
- All canonicals use `metadataBase` for absolute URL resolution
- State pages generate per-page canonicals via `generateMetadata()`
- Blog post pages generate per-post canonicals

---

### 3. SITEMAPS

**Current State:**
- Dynamic sitemap at `src/app/sitemap.ts` generates `/sitemap.xml`
- Static image sitemap at `public/sitemap-images.xml`
- Sitemap declared in robots.txt
- Includes homepage, /drop-pin, /state-maps, /blog, all state pages, all blog posts

**Issues Found:**

| # | Issue | Severity | File | Line |
|---|-------|----------|------|------|
| 3.1 | Uses `changeFrequency` field — Google ignores this completely | HIGH | `src/app/sitemap.ts` | 14,20,26,32,43,50 |
| 3.2 | Uses `priority` field — Google ignores this completely | HIGH | `src/app/sitemap.ts` | 15,21,27,33,44,51 |
| 3.3 | Missing `/postal-codes` hub page from sitemap | HIGH | `src/app/sitemap.ts` | - |
| 3.4 | `lastModified` uses `new Date().toISOString()` — changes on every build (misleading) | MEDIUM | `src/app/sitemap.ts` | 8 |
| 3.5 | Image sitemap is static XML file — not auto-generated, won't update with content changes | MEDIUM | `public/sitemap-images.xml` | - |
| 3.6 | Image sitemap has `<lastmod>` inside `<url>` AFTER `<image:image>` tags — should be before | LOW | `public/sitemap-images.xml` | 116 |
| 3.7 | No sitemap index file linking main sitemap and image sitemap | MEDIUM | - | - |
| 3.8 | Only one image sitemap URL covering `/state-maps` — no images for other pages | LOW | `public/sitemap-images.xml` | - |
| 3.9 | robots.txt only declares one sitemap URL (missing image sitemap) | MEDIUM | `public/robots.txt` | 6 |

**What's Implemented Correctly:**
- Dynamic generation using Next.js MetadataRoute.Sitemap
- Includes all statically generated pages (states, blog posts)
- Uses absolute URLs with protocol
- Blog posts use actual `publishedAt`/`updatedAt` dates

---

### 4. FAVICON IMPLEMENTATION

**Current State:**
- `favicon.ico` (32x32) at `/public/favicon.ico` — 7.9KB
- `icon.svg` with light/dark mode CSS media queries — excellent
- `apple-touch-icon.png` (180x180) — 5.3KB
- `icon-192.png` (192x192) — 5.7KB
- `icon-512.png` (512x512) — 20.5KB
- `icon-mask.png` (512x512) — 20.5KB (same as icon-512)
- `manifest.webmanifest` with proper icon references
- All favicon references in `layout.tsx` metadata export

**Issues Found:**

| # | Issue | Severity | File | Line |
|---|-------|----------|------|------|
| 4.1 | `icon-mask.png` appears to be identical to `icon-512.png` (same file size: 20451 bytes) — maskable icons need extra safe-zone padding | LOW | `public/icon-mask.png` | - |

**What's Implemented Correctly:**
- All 6 favicon files present (ico, svg, apple-touch-icon, 192, 512, mask)
- SVG with adaptive dark/light mode via CSS media queries
- manifest.webmanifest correctly references all icons with proper sizes and purpose
- All favicon `<link>` tags properly declared in layout metadata
- Not blocked by robots.txt

---

### 5. CRAWLABILITY & INDEXING

**Current State:**
- robots.txt allows all pages, blocks `/_next/static/` and `/api/`
- Sitemap declared in robots.txt
- `X-Robots-Tag: noindex, nofollow` on `/_next/static/` resources
- All page metadata has `robots: { index: true, follow: true }`

**Issues Found:**

| # | Issue | Severity | File | Line |
|---|-------|----------|------|------|
| 5.1 | `/blog` page is client-rendered — Googlebot may not see full content | CRITICAL | `src/app/blog/page.tsx` | 1 |
| 5.2 | State maps page fetches data client-side (`/api/state-maps`) — initial HTML has no state list | MEDIUM | `src/app/state-maps/page.tsx` | 31-35 |
| 5.3 | robots.txt missing image sitemap declaration | MEDIUM | `public/robots.txt` | - |

**What's Implemented Correctly:**
- robots.txt properly blocks API routes and static assets
- No orphan pages — all pages linked from navigation/footer
- All page routes return 200 status
- JavaScript/CSS not blocked in robots.txt
- Proper noindex on internal static assets via X-Robots-Tag header

---

### 6. RENDERING STRATEGY

**Current State:**

| Page | Current Rendering | Recommended | Status |
|------|------------------|-------------|--------|
| `/` | SSR (noStore) | SSR or ISR | OK — needs dynamic data (stats) |
| `/drop-pin` | SSG (page) + CSR (client) | SSG + CSR | CORRECT |
| `/state-maps` | SSG (layout metadata) + CSR (page) | SSG | NEEDS IMPROVEMENT |
| `/postal-codes` | SSG | SSG | CORRECT |
| `/postal-codes/[state]` | SSG | SSG | CORRECT |
| `/blog` | **CSR only** | **SSG** | **CRITICAL ISSUE** |
| `/blog/[slug]` | SSG | SSG | CORRECT |

**Issues Found:**

| # | Issue | Severity | File | Line |
|---|-------|----------|------|------|
| 6.1 | `/blog` page uses `"use client"` directive — no SSR/SSG, no metadata export possible | CRITICAL | `src/app/blog/page.tsx` | 1 |
| 6.2 | State maps page fetches state list client-side — empty HTML on initial load | MEDIUM | `src/app/state-maps/page.tsx` | 31 |

**What's Implemented Correctly:**
- State pages use `generateStaticParams()` for SSG
- Blog post pages use `generateStaticParams()` for SSG
- Homepage correctly uses SSR for dynamic stats data
- Heavy interactive components properly separated into client components

---

### 7. HREFLANG IMPLEMENTATION

**Current State:**
- All metadata exports include `alternates.languages` with `en-ng` and `x-default`
- This is a single-language (English) site targeting Nigeria

**Issues Found:**

| # | Issue | Severity | File | Line |
|---|-------|----------|------|------|
| 7.1 | `en-ng` is not a standard ISO combination — Nigeria's ISO 3166-1 Alpha-2 code is `NG` but standard format is lowercase `en-ng`. Google accepts this but it signals multi-regional content that doesn't exist | LOW | `src/app/layout.tsx` | 58 |
| 7.2 | No hreflang on `/blog` page (client component, no metadata) | HIGH | `src/app/blog/page.tsx` | - |

**What's Implemented Correctly:**
- Self-referencing hreflang on all pages with metadata
- x-default fallback specified
- Consistent format across all pages
- Absolute URL resolution via metadataBase

**Note:** Since this is a single-language site targeting primarily Nigeria, the hreflang implementation is functional but technically unnecessary. Hreflang is primarily for sites serving different language/region versions of the same content. The current implementation won't hurt but provides minimal benefit.

---

### 8. STRUCTURED DATA (SCHEMA MARKUP)

**Current State:**

| Page | Schema Types Present | Missing |
|------|---------------------|---------|
| All pages (layout) | Organization, WebSite (with SearchAction) | — |
| `/` (homepage) | SoftwareApplication (with AggregateRating), FAQPage, HowTo | BreadcrumbList |
| `/drop-pin` | NONE | BreadcrumbList |
| `/state-maps` | BreadcrumbList | — |
| `/postal-codes` | NONE | BreadcrumbList |
| `/postal-codes/[state]` | NONE | FAQPage, BreadcrumbList |
| `/blog` | NONE | BreadcrumbList |
| `/blog/[slug]` | NONE | Article, BreadcrumbList |

**Issues Found:**

| # | Issue | Severity | File | Line |
|---|-------|----------|------|------|
| 8.1 | 37 state pages have FAQ data but no FAQPage schema | HIGH | `src/app/postal-codes/[state]/page.tsx` | - |
| 8.2 | Blog posts missing Article schema (required for rich results) | HIGH | `src/app/blog/[slug]/page.tsx` | - |
| 8.3 | No BreadcrumbList schema on drop-pin, postal-codes hub, state pages, or blog pages | MEDIUM | Various | - |
| 8.4 | Organization schema in layout.tsx uses `name: siteTitle` (full title) instead of short brand name | LOW | `src/app/layout.tsx` | 29 |
| 8.5 | Organization schema missing `sameAs` social media links | LOW | `src/app/layout.tsx` | 26-32 |

**What's Implemented Correctly:**
- JSON-LD format used exclusively (best practice)
- WebSite schema with SearchAction
- SoftwareApplication with dynamic AggregateRating
- FAQPage on homepage with comprehensive questions
- HowTo schema with clear steps
- BreadcrumbList on state-maps page

---

### 9. IMAGE OPTIMIZATION

**Current State:**
- Site primarily uses SVG icons (Phosphor Icons) — no optimization needed
- State maps page loads external images from web.archive.org
- Public directory has favicon/icon images (already optimized)
- No content images on most pages (text-heavy site)

**Issues Found:**

| # | Issue | Severity | File | Line |
|---|-------|----------|------|------|
| 9.1 | State maps page uses `<img>` HTML element instead of Next.js `<Image>` | MEDIUM | `src/app/state-maps/page.tsx` | 403-411 |
| 9.2 | External images from web.archive.org served over HTTPS but are legacy JPG format | LOW | `public/sitemap-images.xml` | various |
| 9.3 | OG images all use `/icon-512.png` — a generic icon, not page-specific images | MEDIUM | Various page metadata | - |

**What's Implemented Correctly:**
- Width/height attributes on state map images (1200x900)
- `loading="eager"` on state map images (correct since it's LCP element when visible)
- `decoding="async"` for non-blocking decode
- SVG icons used throughout (scalable, small, performant)
- Favicon images properly sized and compressed

---

### 10. MOBILE-FIRST OPTIMIZATION

**Current State:**
- Responsive design via Tailwind CSS breakpoints
- Mobile-first utility classes throughout (sm:, md:, lg: prefixes)
- Some navigation items hidden on mobile (`hidden sm:block`, `hidden lg:block`)
- `font-size: 16px` base size (prevents iOS zoom on inputs)

**Issues Found:**

| # | Issue | Severity | File | Line |
|---|-------|----------|------|------|
| 10.1 | No explicit viewport meta tag in layout — Next.js adds it automatically but should be verified | LOW | `src/app/layout.tsx` | - |
| 10.2 | Some font sizes use `text-[10px]` which is below minimum readable size | LOW | `src/app/postal-codes/page.tsx` | 80 |

**What's Implemented Correctly:**
- Responsive grid layouts throughout
- Mobile-appropriate font sizes for body text
- Skip to main content link for accessibility
- Touch-friendly button sizes
- Sticky header with compact mobile layout
- Mobile-optimized tabs on homepage

---

### 11. INTERNAL LINKING

**Current State:**
- Homepage has comprehensive navigation: header nav, states grid, footer links
- Footer present on homepage, state-maps, with Quick Links, Top States sections
- Blog page has minimal navigation (back link + CTA)
- Drop-pin page needs verification for footer links

**Issues Found:**

| # | Issue | Severity | File | Line |
|---|-------|----------|------|------|
| 11.1 | Blog listing page has minimal footer — only copyright, no navigation links | MEDIUM | `src/app/blog/page.tsx` | 91-95 |
| 11.2 | Blog post pages (BlogPostClient) — need to verify footer navigation | MEDIUM | `src/app/blog/[slug]/BlogPostClient.tsx` | - |
| 11.3 | No breadcrumb UI navigation on most pages (only schema on state-maps) | MEDIUM | Various | - |
| 11.4 | `/postal-codes` hub page has no footer section | LOW | `src/app/postal-codes/page.tsx` | - |

**What's Implemented Correctly:**
- Homepage links to all major sections (drop-pin, state-maps, postal-codes, blog)
- Homepage has full state grid linking to all 37 state pages
- State pages link to related states
- Blog posts link to related posts
- State-maps page has comprehensive footer with Quick Links and Top States
- Homepage footer links to How NIPOST Works section

---

### 12. EXTERNAL LINKING

**Current State:**
- Minimal external links on the site
- State maps link to web.archive.org images (proxied through API)
- No external authority links in content

**Issues Found:**

| # | Issue | Severity | File | Line |
|---|-------|----------|------|------|
| 12.1 | No external authority links to back up claims (e.g., NIPOST official site) | LOW | Various content sections | - |

**What's Implemented Correctly:**
- External image loading goes through server-side proxy (not direct user links)
- No link to low-quality or spammy sites

---

### 13. HTTPS & SECURITY

**Current State:**
- Deployed on Vercel (automatic HTTPS with valid SSL)
- Comprehensive security headers in next.config.mjs

**Issues Found:**

| # | Issue | Severity | File | Line |
|---|-------|----------|------|------|
| 13.1 | CSP uses `'unsafe-inline'` for both `script-src` and `style-src` — weakens CSP | MEDIUM | `next.config.mjs` | 27-28 |
| 13.2 | CSP `connect-src` missing Supabase domain — may cause API call failures | HIGH | `next.config.mjs` | 30 |

**What's Implemented Correctly:**
- HSTS with `max-age=31536000; includeSubDomains; preload`
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(self), microphone=(), camera=()`
- `upgrade-insecure-requests` in CSP
- `object-src 'none'` and `base-uri 'self'`
- `frame-ancestors 'self'`

---

### 14. META DESCRIPTIONS

**Current State:**

| Page | Has Description | Length | Quality |
|------|----------------|--------|---------|
| `/` (layout) | YES | 154 chars | GOOD — includes action words, targets |
| `/drop-pin` | YES | 131 chars | GOOD |
| `/state-maps` (layout) | YES | 127 chars | GOOD |
| `/postal-codes` | YES | 156 chars | OK — slightly long |
| `/postal-codes/[state]` | YES (per-state) | Varies | GOOD |
| `/blog` | **NO** | — | **MISSING** |
| `/blog/[slug]` | YES (post excerpt) | Varies | GOOD |

**Issues Found:**

| # | Issue | Severity | File | Line |
|---|-------|----------|------|------|
| 14.1 | `/blog` page has NO meta description (client component) | CRITICAL | `src/app/blog/page.tsx` | - |
| 14.2 | `/postal-codes` description at 156 chars — may truncate on some devices | LOW | `src/app/postal-codes/page.tsx` | 9-10 |

**What's Implemented Correctly:**
- Unique descriptions on all pages with metadata
- Descriptions address search intent
- Include target keywords naturally
- Proper length range (120-155 chars) for most pages

---

### 15. GOOGLE TAG MANAGER (GTM)

**Current State:**
- GTM conditionally loaded based on `NEXT_PUBLIC_GTM_ID` env variable
- Consent Mode v2 implemented with all 4 consent signals defaulting to denied
- Data Layer initialized before GTM
- GTM script uses `strategy="afterInteractive"`
- Consent script uses `strategy="beforeInteractive"`
- noscript fallback in `<body>`

**Issues Found:**

| # | Issue | Severity | File | Line |
|---|-------|----------|------|------|
| 15.1 | Consent mode script in `<Script>` with `strategy="beforeInteractive"` — rendered inside `<html>` but before `<body>`, which is correct for consent but unusual placement | LOW | `src/app/layout.tsx` | 115-125 |

**What's Implemented Correctly:**
- Consent Mode v2 with all 4 signals (ad_storage, analytics_storage, ad_user_data, ad_personalization)
- Default consent set to 'denied' — GDPR/privacy compliant
- Data Layer initialized before GTM container
- GTM uses async loading via `strategy="afterInteractive"`
- noscript fallback properly placed after opening `<body>` tag
- Conditional rendering (only loads if GTM ID is set)

---

### 16. MOBILE DEVELOPER AUDIT

**Current State:**
- PWA capabilities via manifest.webmanifest
- Standalone display mode configured
- Portrait-primary orientation
- Theme color and background color set

**Issues Found:**

| # | Issue | Severity | File | Line |
|---|-------|----------|------|------|
| 16.1 | No service worker for offline functionality | LOW | - | - |
| 16.2 | No `theme-color` meta tag in HTML (only in manifest) | LOW | `src/app/layout.tsx` | - |

**What's Implemented Correctly:**
- manifest.webmanifest with proper PWA configuration
- Proper icon sizes for Android home screen
- Maskable icon for adaptive launchers
- Standalone display mode
- Portrait orientation preference
- Theme color set to Nigeria green (#008751)

---

## ISSUES SUMMARY — SORTED BY SEVERITY

### CRITICAL (4 issues — must fix immediately)

| # | Issue | Impact |
|---|-------|--------|
| 2.1 / 6.1 / 14.1 | `/blog` page is `"use client"` — has NO metadata, NO canonical, NO OG tags, NO meta description | Blog page is essentially invisible to search engines for metadata. Google may index it with auto-generated snippets. |
| 5.1 | `/blog` page is client-rendered — Googlebot may not see full content | Blog listing content may not be indexed at all. |
| 8.1 | 37 state pages have FAQ data but no FAQPage schema | Missing rich result eligibility for 37 high-value pages. |

### HIGH (8 issues)

| # | Issue | Impact |
|---|-------|--------|
| 3.1-3.2 | Sitemap uses `changeFrequency` and `priority` — Google ignores | Bloated sitemap with useless data |
| 3.3 | Missing `/postal-codes` hub page from sitemap | Google may not discover or prioritize this page |
| 3.9 | robots.txt missing image sitemap declaration | Image sitemap may not be discovered |
| 7.2 | No hreflang on `/blog` page | Missing language signal |
| 8.2 | Blog posts missing Article schema | No rich result eligibility for blog content |
| 8.3 | No BreadcrumbList schema on most pages | Missing breadcrumb rich results |
| 13.2 | CSP `connect-src` missing Supabase domain | May block Supabase API calls |

### MEDIUM (11 issues)

| # | Issue | Impact |
|---|-------|--------|
| 1.1 | Leaflet CSS loaded globally | Unnecessary CSS on 40+ pages |
| 1.3 | State maps uses `<img>` instead of `<Image>` | No automatic image optimization |
| 3.4 | `lastModified` always uses current date | Misleading to search engines |
| 3.5 | Image sitemap is static, not auto-generated | Won't update with content changes |
| 3.7 | No sitemap index file | Missing organizational structure |
| 5.2 | State maps fetches data client-side | Empty initial HTML for state list |
| 6.2 | State maps page empty on initial load | Reduced crawlability |
| 9.3 | All OG images use generic icon | Poor social sharing appearance |
| 11.1 | Blog listing has minimal footer navigation | Poor internal linking |
| 11.3 | No breadcrumb UI navigation on most pages | Reduced navigation clarity |
| 13.1 | CSP uses `'unsafe-inline'` | Weakened security headers |

### LOW (6 issues)

| # | Issue | Impact |
|---|-------|--------|
| 1.2 | `font-display: optional` may cause FOIT | Minor visual issue |
| 1.4 | Framer Motion may impact INP | Minor performance concern |
| 3.6 | Image sitemap `<lastmod>` placement | Minor formatting |
| 8.4-8.5 | Organization schema name too long, missing sameAs | Minor schema improvement |
| 10.2 | Some `text-[10px]` font sizes | Below recommended minimum |
| 16.1-16.2 | No service worker, no theme-color meta | Minor PWA improvements |
