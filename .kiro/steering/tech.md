---
inclusion: always
---

# Tech Stack & Development Guidelines

## Core Stack

- Next.js 14 (App Router) with TypeScript strict mode
- Tailwind CSS for styling
- Supabase (PostgreSQL) for database
- React Query v5 (@tanstack/react-query) for server state
- TipTap for WYSIWYG editing
- remark ecosystem for Markdown processing
- YAML config via `nexus.config.yaml`

## TypeScript Rules

- Strict mode enabled - always provide explicit types
- Use `@/*` path alias for imports from `src/` (e.g., `import { Note } from '@/types'`)
- Prefer interfaces over types for object shapes
- Use `.tsx` extension only when JSX is present

## Commands

```bash
npm run dev      # Dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
npm run test     # Vitest single run (NOT watch mode)
npm run seed     # Seed database
```

## Testing

- Framework: Vitest with node environment
- Location: `__tests__/` folders adjacent to source (e.g., `src/hooks/__tests__/`)
- Path aliases work in tests via `vitest.config.ts`
- Always use `npm run test` (runs `vitest run`) - never use watch mode

## Environment Variables

Required:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

Optional:

- `SUPABASE_SERVICE_ROLE_KEY` - Server-side admin operations
- `OPENAI_API_KEY` - AI search feature
- `NEXUS_PASSWORD` - Simple auth

## API Routes

- Use Next.js App Router conventions (`route.ts` files)
- Dynamic routes use `[param]` folder naming
- All database operations go through `src/lib/supabase.ts`

## Dependencies to Know

- `@tiptap/*` - Rich text editor components
- `gray-matter` - YAML frontmatter parsing
- `nanoid` - ID generation
- `jszip` - Import/export functionality
