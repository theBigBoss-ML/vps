# SKILL: Version Standards for Striker CMS

## PURPOSE
Enforce usage of latest stable versions for all dependencies. NO outdated packages.

## CORE PRINCIPLE
**"Latest Stable, Not Legacy"**
- Use current major versions
- Check npm/official docs before suggesting versions
- Prefer latest over compatibility (unless breaking)

## MANDATORY VERSIONS (As of December 2025)

### JavaScript Runtime
- **Node.js:** 22.x LTS minimum (or 23.x current)
- Check: `node --version` should be ≥22.0.0

### Core Framework
- **Next.js:** 15.x (NOT 14.x, NOT 13.x)
- **React:** 19.x (with React Compiler enabled)
- **React DOM:** 19.x

### Language
- **TypeScript:** 5.7.x minimum
- Strict mode enabled
- All `any` types forbidden (use `unknown`)

### Styling
- **TailwindCSS:** 3.4.x minimum
- **PostCSS:** 8.x
- **Autoprefixer:** 10.x

### CMS & Database
- **Payload CMS:** 3.x (NOT v2)
- **PostgreSQL client:** Latest compatible with Payload 3
- **@payloadcms/db-postgres:** Latest

### Build Tools
- **Turbo:** Latest (if using monorepo)
- **ESLint:** 9.x
- **Prettier:** 3.x

### Storage & Media
- **Cloudflare R2:** Latest SDK
- **Sharp:** Latest (image optimization)

### Email
- **Resend:** Latest SDK
- **Brevo (Sendinblue):** Latest SDK

## VERSION CHECK WORKFLOW

Before suggesting ANY package:

1. **Check npm registry:**
```bash
   npm view <package> version
```

2. **Verify compatibility:**
   - Check package's Next.js 15 compatibility
   - Check React 19 compatibility
   - Read CHANGELOG for breaking changes

3. **If latest has issues:**
   - Use latest stable minor version
   - Document why (comment in package.json)
   - Plan upgrade path

## FORBIDDEN PRACTICES

❌ **NEVER suggest:**
- Next.js 14 or lower
- React 18 or lower
- TypeScript 4.x
- TailwindCSS 2.x
- Payload CMS v2
- Any package with "deprecated" badge

❌ **NEVER use:**
- `npm install <package>` without version check
- Outdated tutorials as reference
- Stack Overflow answers from 2023 or earlier

## PACKAGE.JSON TEMPLATE
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "payload": "^3.0.0",
    "@payloadcms/next": "^3.0.0",
    "@payloadcms/richtext-lexical": "^3.0.0",
    "@payloadcms/db-postgres": "^3.0.0",
    "postgres": "^3.4.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "tailwindcss": "^3.4.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0"
  },
  "engines": {
    "node": ">=22.0.0",
    "npm": ">=10.0.0"
  }
}
```

## UPGRADE STRATEGY

If a package requires older versions:
1. Check if there's a compatible alternative
2. Check if issue is actually real (test it)
3. If truly incompatible: Use latest working version + document
4. Set calendar reminder to upgrade in 3 months

## VERIFICATION

Before Phase A completion:
```bash
# Check all versions
npm list --depth=0

# Should see:
# next@15.x.x
# react@19.x.x
# typescript@5.7.x
# payload@3.x.x
```

## NEXT.JS 15 SPECIFIC REQUIREMENTS

Enable new features:
- React Compiler (automatic optimization)
- Turbopack (faster builds)
- Partial Prerendering (PPR)
- Server Actions improvements
```javascript
// next.config.js
module.exports = {
  experimental: {
    reactCompiler: true, // React 19 compiler
    ppr: 'incremental', // Partial Prerendering
  },
  turbopack: true, // Use Turbopack instead of Webpack
}
```

## RESOURCES

Official docs to check:
- https://nextjs.org/docs (Next.js 15)
- https://react.dev (React 19)
- https://payloadcms.com/docs (Payload 3)
- https://tailwindcss.com/docs
- https://www.typescriptlang.org/docs

## EXCEPTIONS

Only use older versions if:
1. Payload CMS explicitly requires it (check their docs)
2. Critical security patch not yet in latest
3. Documented in skill as temporary measure
