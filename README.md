# Postminer.com.ng

## Project Info

This app helps users find Nigerian postal codes using AI-assisted GPS, smart search, or manual lookup.

## Local Development

```sh
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Start the production server
npm run start

# Lint the codebase
npm run lint

# Typecheck the codebase
npm run typecheck
```

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase

## Environment Variables

Set these in `.env`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON`
- `NEXT_PUBLIC_SUPABASE_PROJECT_ID` (optional)
- `GOOGLE_MAPS_API_KEY` (required for `/api/geocode` lookups)
- `NEXT_PUBLIC_SITE_URL` (optional, defaults to `https://postminer.com.ng`)
- `NEXT_PUBLIC_GTM_ID` (optional, enables GTM when provided)
