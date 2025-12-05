---
inclusion: always
---

# Project Structure

```
/
├── nexus.config.yaml      # Main app configuration (theme, features, layout)
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API routes (notes, auth, config, search, mcp, import/export)
│   │   ├── auth/          # Auth page
│   │   ├── layout.tsx     # Root layout with providers
│   │   └── page.tsx       # Main page
│   ├── components/        # React components with barrel export (index.ts)
│   ├── hooks/             # Custom React hooks with barrel export (index.ts)
│   ├── lib/               # Utilities and services
│   ├── styles/            # Global styles + theme CSS
│   └── types/             # TypeScript type definitions (index.ts)
├── scripts/               # Database setup and seed scripts
├── public/                # Static assets (logos, themes)
├── themes/                # Custom theme CSS files
└── examples/              # Example configurations (arcana, codex)
```

## Architecture Patterns

- **State Management**: Navigation uses Context + useReducer (`useNavigation.tsx`); data fetching uses React Query (`useNotes.ts`)
- **API Routes**: Next.js App Router conventions with `route.ts` files; dynamic routes use `[param]` folders
- **Database**: All note operations go through Supabase client in `src/lib/supabase.ts`
- **Configuration**: YAML-based config (`nexus.config.yaml`) loaded via `src/lib/config.ts` with defaults from `config.defaults.ts`

## Code Conventions

- **Barrel Exports**: Use `index.ts` files in `hooks/`, `components/`, and `types/` for clean imports
- **Path Alias**: Import from `@/*` which maps to `src/*`
- **Tests**: Co-locate in `__tests__/` folders adjacent to source files
- **Wikilinks**: `[[Title]]` syntax parsed by `src/lib/links.ts`
- **Hooks with Context**: Use `.tsx` extension when hook provides a Context Provider (e.g., `useNavigation.tsx`, `useAuth.tsx`)

## Key Files

| File                          | Purpose                                         |
| ----------------------------- | ----------------------------------------------- |
| `src/lib/links.ts`            | Wikilink parsing, extraction, and backlink sync |
| `src/lib/markdown.ts`         | Markdown to HTML rendering                      |
| `src/lib/graph.ts`            | Graph data structure utilities                  |
| `src/hooks/useNavigation.tsx` | Multi-pane navigation state management          |
| `src/hooks/useNotes.ts`       | React Query hooks for notes CRUD                |
| `src/components/MainApp.tsx`  | Main application component                      |
