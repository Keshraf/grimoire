# Project Structure

```
/
├── nexus.config.yaml      # Main app configuration (theme, features, layout)
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API routes
│   │   │   └── notes/     # Notes CRUD endpoints
│   │   │       ├── route.ts           # GET all, POST create
│   │   │       └── [title]/route.ts   # GET/PUT/DELETE by title
│   │   ├── layout.tsx     # Root layout with providers
│   │   └── page.tsx       # Main page
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   │   ├── index.ts       # Barrel export
│   │   ├── useNavigation.tsx   # Multi-pane navigation state (Context + Reducer)
│   │   ├── useNotes.ts         # React Query hooks for notes API
│   │   ├── useURLSync.ts       # URL state synchronization
│   │   └── __tests__/          # Hook tests
│   ├── lib/               # Utilities and services
│   │   ├── config.ts      # YAML config loader with defaults
│   │   ├── supabase.ts    # Supabase client setup
│   │   ├── links.ts       # Wikilink parsing and sync
│   │   ├── markdown.ts    # Markdown rendering
│   │   └── graph.ts       # Graph data utilities
│   ├── styles/
│   │   └── globals.css    # Global styles + Tailwind
│   └── types/
│       └── index.ts       # TypeScript type definitions
├── scripts/
│   └── setup-supabase.sql # Database schema setup
└── public/                # Static assets
```

## Conventions

- **Hooks**: Export from barrel file `src/hooks/index.ts`
- **Types**: Centralized in `src/types/index.ts`
- **API Routes**: Follow Next.js App Router conventions with `route.ts` files
- **State**: Navigation uses Context + useReducer pattern; data fetching uses React Query
- **Database**: All note operations go through Supabase client in `src/lib/supabase.ts`
- **Wikilinks**: `[[Title]]` syntax parsed by `src/lib/links.ts`
