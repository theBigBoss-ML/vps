# SKILL: Code Quality Standards for Striker CMS

## TYPESCRIPT STRICTNESS

### tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Type Rules
```typescript
// ✅ GOOD
type User = {
  id: string
  email: string
  role: 'writer' | 'editor' | 'admin'
}

// ❌ BAD
const user: any = {...}
```

## FILE ORGANIZATION
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages group
│   ├── (dashboard)/       # Dashboard group
│   ├── [game]/            # Dynamic game pages
│   └── api/               # API routes
├── components/
│   ├── ui/                # Reusable UI (buttons, cards)
│   ├── layout/            # Layout components (nav, footer)
│   └── features/          # Feature-specific components
├── lib/
│   ├── utils/             # Helper functions
│   ├── hooks/             # Custom React hooks
│   └── constants/         # Constants & enums
├── payload/
│   ├── collections/       # Payload collections
│   ├── globals/           # Global settings
│   └── payload.config.ts
└── types/                 # Shared TypeScript types
```

## NAMING CONVENTIONS

### Files
- Components: `PascalCase.tsx` (UserCard.tsx)
- Utilities: `camelCase.ts` (formatDate.ts)
- Types: `PascalCase.types.ts` (User.types.ts)
- Constants: `SCREAMING_SNAKE_CASE.ts` (API_ENDPOINTS.ts)

### Variables
```typescript
// Components
const UserCard = () => {}

// Functions
const formatDate = () => {}

// Constants
const MAX_UPLOAD_SIZE = 5

// Types
type UserRole = 'writer' | 'editor'
```

## COMPONENT PATTERNS

### Server Components (Default)
```typescript
// app/news/page.tsx
export default async function NewsPage() {
  const articles = await fetchArticles()
  return <ArticleGrid articles={articles} />
}
```

### Client Components (When Needed)
```typescript
'use client'

import { useState } from 'react'

export function SearchBar() {
  const [query, setQuery] = useState('')
  // Interactive logic
}
```

## ERROR HANDLING
```typescript
// API routes
try {
  const result = await riskyOperation()
  return Response.json({ success: true, data: result })
} catch (error) {
  console.error('Operation failed:', error)
  return Response.json(
    { success: false, error: 'Operation failed' },
    { status: 500 }
  )
}
```

## COMMENTS
```typescript
// ✅ GOOD: Explain WHY, not WHAT
// Use fallback image if upload fails to maintain UX
const imageSrc = uploadedImage || DEFAULT_PLACEHOLDER

// ❌ BAD: Obvious comment
// Set the image source
const imageSrc = uploadedImage
```

## IMPORTS
```typescript
// Group imports
import { type ReactNode } from 'react' // React
import { formatDate } from '@/lib/utils' // Internal
import { Button } from '@/components/ui' // Components
```

## ESLINT RULES
```json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "no-console": ["warn", { "allow": ["error", "warn"] }],
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

## FORBIDDEN PATTERNS

❌ `any` types
❌ Non-null assertions (`!`)
❌ Hardcoded values (use constants)
❌ Nested ternaries (use if/else)
❌ console.log in production (use proper logging)
