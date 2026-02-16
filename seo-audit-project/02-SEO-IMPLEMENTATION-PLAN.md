# 02 - SEO IMPLEMENTATION PLAN

**Site:** postminer.com.ng
**Date:** 2026-02-16
**Total Issues:** 29 (4 Critical, 8 High, 11 Medium, 6 Low)
**Estimated Implementation Time:** ~3-4 hours

---

## IMPLEMENTATION ORDER (Priority-Sequenced)

### BATCH 1: CRITICAL FIXES (Must do first)

---

#### Task 1.1: Fix Blog Listing Page — Convert from CSR to SSG with Metadata
**Severity:** CRITICAL
**Files to modify:** `src/app/blog/page.tsx`
**Complexity:** Medium
**Dependencies:** None

**Problem:** The `/blog` page uses `"use client"` at the top, which means:
- Cannot export `metadata` (Next.js restriction)
- Page has NO title, NO description, NO canonical, NO OG tags
- Googlebot receives empty HTML shell without metadata
- The page is essentially invisible in SERPs

**Solution:** Split into server component (page.tsx with metadata) + client component (BlogPageClient.tsx for interactivity)

**Before:** `src/app/blog/page.tsx` — entire page is `"use client"`

**After — New file:** `src/app/blog/BlogPageClient.tsx`
- Move all existing blog page content into this new client component
- Keep `"use client"`, useState, useTheme, search functionality

**After — Modified file:** `src/app/blog/page.tsx`
- Remove `"use client"` directive
- Export `metadata` with title, description, canonical, OG, twitter, robots
- Import and render `BlogPageClient`
- Blog posts data can be passed as props from server to client

**Success Criteria:**
- [ ] `/blog` renders metadata in HTML source
- [ ] `<title>`, `<meta name="description">`, `<link rel="canonical">` all present
- [ ] OG and Twitter tags render correctly
- [ ] Search functionality still works
- [ ] Page renders identically to current version

---

#### Task 1.2: Add FAQPage Schema to All 37 State Pages
**Severity:** CRITICAL/HIGH
**Files to modify:** `src/app/postal-codes/[state]/page.tsx`
**Complexity:** Simple
**Dependencies:** None

**Problem:** Each state page has rich FAQ data (question/answer pairs in `statePageData`) but no FAQPage schema markup. This means 37 high-value pages miss FAQ rich result eligibility.

**Solution:** Generate FAQPage JSON-LD schema in the server component and inject via `<script type="application/ld+json">`.

**Implementation:**
- In `src/app/postal-codes/[state]/page.tsx`, build a FAQPage schema object from `data.faq`
- Also add BreadcrumbList schema (Home > Postal Codes > State Name)
- Pass schemas as `<script>` tags alongside `<StatePageClient>`

**Success Criteria:**
- [ ] Every state page has valid FAQPage schema
- [ ] Every state page has BreadcrumbList schema
- [ ] Validates in Google Rich Results Test
- [ ] No errors in structured data

---

### BATCH 2: HIGH-PRIORITY FIXES

---

#### Task 2.1: Clean Up Sitemap — Remove Deprecated Fields, Add Missing Pages
**Severity:** HIGH
**Files to modify:** `src/app/sitemap.ts`
**Complexity:** Simple
**Dependencies:** None

**Problem:**
- `changeFrequency` and `priority` are ignored by Google (waste of bytes)
- `/postal-codes` hub page is missing from sitemap
- `lastModified` uses `new Date().toISOString()` which changes every build

**Solution:**
- Remove all `changeFrequency` and `priority` fields
- Add `/postal-codes` to core pages
- Use fixed dates for pages that don't change frequently
- Use actual content dates for blog posts (already correct)

**Success Criteria:**
- [ ] No `changeFrequency` or `priority` in generated sitemap
- [ ] `/postal-codes` appears in sitemap
- [ ] `lastModified` uses meaningful dates

---

#### Task 2.2: Add Image Sitemap to robots.txt
**Severity:** HIGH
**File to modify:** `public/robots.txt`
**Complexity:** Simple
**Dependencies:** None

**Solution:** Add `Sitemap: https://postminer.com.ng/sitemap-images.xml`

---

#### Task 2.3: Add Article Schema to Blog Posts
**Severity:** HIGH
**Files to modify:** `src/app/blog/[slug]/page.tsx`
**Complexity:** Simple
**Dependencies:** None

**Problem:** Blog posts have no Article schema — missing rich result eligibility.

**Solution:** Build Article JSON-LD in `BlogPostPage` server component and inject as `<script>`.

**Schema will include:** headline, image, author, publisher, datePublished, dateModified, description.

---

#### Task 2.4: Add BreadcrumbList Schema to Key Pages
**Severity:** HIGH
**Files to modify:**
- `src/app/drop-pin/page.tsx`
- `src/app/postal-codes/page.tsx`
- `src/app/blog/page.tsx` (new server component)
- `src/app/blog/[slug]/page.tsx`

**Complexity:** Simple
**Dependencies:** Task 1.1 (blog page refactor)

**Solution:** Add BreadcrumbList JSON-LD to each page's server component.

---

#### Task 2.5: Fix CSP connect-src for Supabase
**Severity:** HIGH
**File to modify:** `next.config.mjs`
**Complexity:** Simple
**Dependencies:** Need to know Supabase project URL

**Problem:** CSP `connect-src` doesn't include Supabase domain, potentially blocking API calls.

**Solution:** Add Supabase domain to `connect-src` directive. Will read `.env` to determine the Supabase URL.

---

### BATCH 3: MEDIUM-PRIORITY IMPROVEMENTS

---

#### Task 3.1: Move Leaflet CSS to Drop-Pin Page Only
**Severity:** MEDIUM
**Files to modify:**
- `src/app/layout.tsx` (remove import)
- `src/app/drop-pin/DropPinClient.tsx` (add import)

**Complexity:** Simple
**Dependencies:** None

**Problem:** `leaflet/dist/leaflet.css` is imported in the root layout, loading on ALL 44+ pages. Only the `/drop-pin` page uses Leaflet.

**Solution:** Move the CSS import to the DropPinClient component where it's actually used.

---

#### Task 3.2: Improve Sitemap lastModified Dates
**Severity:** MEDIUM
**File to modify:** `src/app/sitemap.ts`
**Complexity:** Simple
**Dependencies:** Task 2.1

**Solution:** Use fixed meaningful dates for static pages instead of `new Date().toISOString()`.

---

#### Task 3.3: Add Footer Navigation to Blog Pages
**Severity:** MEDIUM
**Files to modify:**
- `src/app/blog/page.tsx` (via new BlogPageClient)
- `src/app/blog/[slug]/BlogPostClient.tsx`

**Complexity:** Simple
**Dependencies:** Task 1.1

**Solution:** Add consistent footer with Quick Links and Top States (matching homepage/state-maps footer pattern).

---

#### Task 3.4: Add Footer to Postal Codes Hub Page
**Severity:** MEDIUM
**File to modify:** `src/app/postal-codes/page.tsx`
**Complexity:** Simple
**Dependencies:** None

**Solution:** Add consistent footer matching other pages.

---

#### Task 3.5: Fix Organization Schema Name
**Severity:** LOW
**File to modify:** `src/app/layout.tsx`
**Complexity:** Simple
**Dependencies:** None

**Solution:** Change Organization schema `name` from full site title to short brand name `"Postminer.com.ng"`.

---

### BATCH 4: LOW-PRIORITY OPTIMIZATIONS (Optional)

---

#### Task 4.1: Add theme-color Meta Tag
**Severity:** LOW
**File to modify:** `src/app/layout.tsx`
**Complexity:** Simple

**Solution:** Add `themeColor` to metadata export.

---

#### Task 4.2: Review font-display Strategy
**Severity:** LOW
**Discussion:** `font-display: optional` is actually a performance-first choice (prevents FOIT/FOUT). No change needed unless visual flicker is observed.

**Recommendation:** Keep as-is. No action required.

---

## IMPLEMENTATION DEPENDENCY MAP

```
Task 1.1 (Blog page refactor) ──> Task 2.4 (BreadcrumbList on blog)
                                ──> Task 3.3 (Footer on blog pages)

All other tasks are INDEPENDENT and can be done in any order.
```

## RISK ASSESSMENT

| Task | Risk Level | What Could Go Wrong | Mitigation |
|------|-----------|-------------------|------------|
| 1.1 Blog refactor | Medium | Search functionality could break if props not passed correctly | Test search after refactor |
| 1.2 State FAQ schema | Low | Schema validation errors | Test with Rich Results Test tool |
| 2.1 Sitemap cleanup | Low | Removing fields could temporarily affect crawling | Google re-crawls quickly |
| 2.5 CSP fix | Medium | Wrong domain could break more than fix | Verify Supabase URL from .env |
| 3.1 Leaflet CSS move | Medium | Could break map styling if import path wrong | Test drop-pin page after change |

## ROLLBACK PLAN

All changes are code-level modifications in tracked files. Rollback via `git revert` for any commit.

## NO EXTERNAL TOOLS REQUIRED

All fixes are code changes within the existing Next.js project. No external APIs, services, or tools needed.
