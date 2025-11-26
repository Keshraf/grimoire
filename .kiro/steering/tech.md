# Tech Stack & Build System

## Core Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Query (@tanstack/react-query)
- **Markdown**: remark + remark-gfm + remark-html
- **Config Parsing**: yaml package for `nexus.config.yaml`

## Common Commands

```bash
# Development
npm run dev          # Start dev server at localhost:3000

# Build & Production
npm run build        # Production build
npm start            # Start production server

# Code Quality
npm run lint         # ESLint
npm run test         # Run tests with Vitest (single run)

# Deployment
vercel               # Deploy to Vercel
```

## Testing

- **Framework**: Vitest
- **Config**: `vitest.config.ts` with path aliases
- **Test files**: Co-located in `__tests__` folders (e.g., `src/hooks/__tests__/`)

## Environment Variables

Required in `.env`:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - For server-side admin operations (optional)
- `OPENAI_API_KEY` - For AI search (optional)
- `NEXUS_PASSWORD` - Simple auth password (optional)

## Path Aliases

`@/*` maps to `./src/*` (configured in tsconfig.json)
