# How Kiro Was Used to Build NEXUS

This document details how Kiro, the AI-powered IDE, was leveraged throughout the development of NEXUS. We utilized the full spectrum of Kiro's capabilities: vibe coding, spec-driven development, agent hooks, steering documents, and MCP integrations.

---

## Overview

NEXUS was built using a hybrid approach that combined:

1. **Spec-Driven Development** for core architecture and complex features
2. **Vibe Coding** for rapid prototyping and iterative refinement
3. **Agent Hooks** for automated code quality and documentation
4. **Steering Documents** for consistent AI behavior across sessions
5. **MCP Integrations** for accessing up-to-date documentation and best practices

---

## Spec-Driven Development

### How We Structured Specs

Kiro's spec system was instrumental in planning and implementing major features. Each spec followed a three-phase approach:

1. **Requirements Phase**: Defined user stories and acceptance criteria using EARS patterns
2. **Design Phase**: Created architecture diagrams, component interfaces, and correctness properties
3. **Tasks Phase**: Generated actionable implementation tasks with clear dependencies

### Specs Created for NEXUS

We created **16 specs** covering every major feature:

| Spec                          | Purpose                                       |
| ----------------------------- | --------------------------------------------- |
| `nexus-project-setup`         | Initial project scaffolding and configuration |
| `navigation-state-management` | Multi-pane horizontal navigation system       |
| `notes-crud-api`              | API routes for note operations                |
| `authentication-system`       | Password and Supabase auth modes              |
| `search-modal`                | Keyword and AI-powered search                 |
| `mcp-server`                  | Model Context Protocol endpoint               |
| `theme-system`                | YAML-driven theming                           |
| `import-export`               | Markdown file import/export                   |
| `note-editor-autocomplete`    | Wikilink autocomplete in editor               |
| `arcana-example`              | Personal knowledge base configuration         |
| `codex-example`               | API documentation configuration               |
| `hackathon-submission`        | Monorepo restructuring for Skeleton Crew      |

### Example: Multi-Pane Navigation System

The horizontal stacking navigation (inspired by Andy Matuschak's notes) was one of our most complex features. Here's how we approached it:

**Requirements Document Excerpt:**

```markdown
### Requirement 1: Horizontal Pane Navigation

**User Story:** As a knowledge explorer, I want to click wikilinks and have new
panes open to the right while keeping previous context visible.

#### Acceptance Criteria

1. WHEN a user clicks a [[wikilink]] THEN the System SHALL open a new pane
   to the right of the current pane
2. WHILE multiple panes are open THEN the System SHALL allow horizontal
   scrolling to navigate between them
3. WHEN a user closes a pane THEN the System SHALL remove it and shift
   remaining panes appropriately
```

### Benefits of Spec-Driven Approach

1. **Clarity**: Complex features were broken down into manageable pieces
2. **Traceability**: Every implementation task linked back to requirements
3. **Consistency**: The AI maintained context across multiple sessions
4. **Quality**: Correctness properties caught edge cases early

---

## Vibe Coding

### Conversational Development

For rapid iteration and smaller features, we used Kiro's vibe coding capabilities. This allowed natural conversation to drive development.

### Most Impressive Code Generation Examples

#### 1. Wikilink Parser with Autocomplete

**Prompt:**

> "Create a wikilink parser that extracts [[links]] from markdown content,
> handles aliased links like [[Title|display text]], and provides autocomplete
> suggestions as the user types."

**Result:** Kiro generated a complete `links.ts` module with:

- Regex-based link extraction
- Alias parsing and rendering
- Real-time autocomplete with fuzzy matching
- Database sync for backlink tracking

#### 2. MCP Server Implementation

**Prompt:**

> "Implement an MCP server endpoint that exposes our notes as tools for AI
> agents. Include list_pages, get_page, search, and ask tools."

**Result:** A fully functional MCP server with:

- Tool manifest generation
- Input validation
- Error handling
- Integration with existing search and AI features

#### 3. Graph Visualization

**Prompt:**

> "Build a local graph component that shows the current note and its direct
> connections. Use SVG for rendering and make nodes clickable for navigation."

**Result:** An interactive graph component with:

- Force-directed layout simulation
- Animated transitions
- Click-to-navigate functionality
- Responsive sizing

---

## Agent Hooks

We configured three agent hooks to automate repetitive tasks. These are located in `.kiro/hooks/`:

### 1. Code Quality Check (`code-quality-check.kiro.hook`)

**Trigger:** When any `.ts` or `.tsx` file in `src/` is edited

**What it does:**

- Runs TypeScript compiler to catch type errors
- Adds missing imports automatically
- Scans for exposed secrets (API keys, passwords)
- Ensures file follows project conventions

```json
{
  "name": "Code Quality Check",
  "when": {
    "type": "fileEdited",
    "patterns": ["src/**/*.ts", "src/**/*.tsx"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Code quality check: fix TypeScript errors, add missing imports, check for secrets..."
  }
}
```

**Impact:** Eliminated manual linting and caught type errors immediately after saving.

### 2. Component Docs Generator (`component-docs-generator.kiro.hook`)

**Trigger:** When any component file in `components/` is edited

**What it does:**

- Adds JSDoc comment blocks above components
- Documents all props with `@param` tags
- Includes `@example` usage snippets
- Adds `@remarks` for complex behavior

```json
{
  "name": "Component Docs Generator",
  "when": {
    "type": "fileEdited",
    "patterns": ["**/components/**/*.tsx", "**/components/**/*.jsx"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Add comprehensive JSDoc documentation to this React component..."
  }
}
```

**Impact:** Every component automatically received documentation, making the codebase self-documenting.

### 3. Secrets Scanner (`secrets-scanner.kiro.hook`)

**Trigger:** When any code, config, or documentation file is edited

**What it does:**

- Scans for API keys (patterns like `sk-`, `AKIA`, `pk_`)
- Detects generic secrets (`api_key=`, `password=`, `token=`)
- Checks for base64-encoded strings
- Blocks commits if secrets are found

```json
{
  "name": "Secrets Scanner",
  "when": {
    "type": "fileEdited",
    "patterns": ["**/*.ts", "**/*.tsx", "**/*.json", "**/*.yaml", "**/*.md"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Scan for potential secrets and block if found..."
  }
}
```

**Impact:** Prevented accidental exposure of credentials in the repository.

### How Hooks Improved Development

1. **Reduced Context Switching**: No need to manually run formatters or linters
2. **Consistent Quality**: Every file met the same standards automatically
3. **Security**: Secrets scanning prevented credential leaks
4. **Documentation**: Components were always documented

---

## Steering Documents

Steering documents ensured Kiro maintained consistent behavior and project knowledge across sessions. Located in `.kiro/steering/`:

### 1. Tech Stack (`tech.md`)

Defines the core technologies and development guidelines:

```markdown
# Tech Stack & Development Guidelines

## Core Stack

- Next.js 14 (App Router) with TypeScript strict mode
- Tailwind CSS for styling
- Supabase (PostgreSQL) for database
- React Query v5 (@tanstack/react-query) for server state
- TipTap for WYSIWYG editing

## TypeScript Rules

- Strict mode enabled - always provide explicit types
- Use `@/*` path alias for imports from `src/`
- Prefer interfaces over types for object shapes

## Commands

npm run dev # Dev server
npm run build # Production build
npm run test # Vitest single run (NOT watch mode)
```

**Impact:** Generated code always used the correct libraries, patterns, and commands.

### 2. Project Structure (`structure.md`)

Documents the codebase organization:

```markdown
# Project Structure

## Architecture Patterns

- State Management: Navigation uses Context + useReducer; data fetching uses React Query
- API Routes: Next.js App Router conventions with route.ts files
- Database: All operations go through src/lib/supabase.ts

## Code Conventions

- Barrel Exports: Use index.ts files in hooks/, components/, and types/
- Path Alias: Import from @/_ which maps to src/_
- Tests: Co-locate in **tests**/ folders
- Wikilinks: [[Title]] syntax parsed by src/lib/links.ts
```

**Impact:** Kiro consistently followed project conventions without repeated reminders.

### 3. Product Context (`product.md`)

Explains what NEXUS is and its key features:

```markdown
# NEXUS - Product Overview

NEXUS supports three navigation modes:

1. Horizontal - Stacking panes (Andy Matuschak-style)
2. Linear - Sequential prev/next navigation
3. Graphical - Interactive node graph

Key Features:

- Obsidian-style [[wikilinks]] with automatic backlinks
- In-browser note editing
- AI-powered search
- MCP server for AI agents
```

**Impact:** Feature suggestions aligned with product vision and existing capabilities.

### Key Strategies That Made a Difference

1. **Always-Included Context**: Tech and structure files use `inclusion: always` frontmatter
2. **Examples Over Rules**: Showing code patterns was more effective than describing them
3. **Living Documents**: Updated steering as the project evolved

---

## MCP Integrations

MCP (Model Context Protocol) integrations solved a critical problem: AI models can hallucinate documentation or lack knowledge of recent library updates.

### Integrations Used

Our `.kiro/settings/mcp.json` configured these servers:

1. **Context7 MCP**: Fetched up-to-date documentation for Next.js, React Query, and Supabase
2. **TailwindCSS MCP**: Provided accurate utility class references and configuration guides
3. **21st.dev MCP**: Sourced UI component inspiration and patterns

### Benefits Realized

#### 1. Accurate Documentation

**Before MCP:**

> "Use `useQuery` from react-query with the `queryKey` option..."

**With MCP:**

> "Use `useQuery` from @tanstack/react-query v5 with the `queryKey` array as the first argument..."

The difference: MCP provided the correct v5 API instead of outdated v3 patterns.

#### 2. Current Best Practices

When implementing the Supabase client, MCP fetched the latest SSR patterns:

```typescript
// MCP-informed implementation using @supabase/ssr
import { createServerClient } from "@supabase/ssr";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(/* ... */);
}
```

### Workflow Improvements

1. **Reduced Debugging**: Fewer issues from outdated API usage
2. **Faster Implementation**: No need to manually look up documentation
3. **Confidence**: Generated code matched current library versions

---

## The Synergy of Kiro Features

The real power came from combining all these features:

```
┌─────────────────────────────────────────────────────────────────┐
│                        DEVELOPMENT FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. STEERING sets project context (tech.md, structure.md)        │
│         ↓                                                        │
│  2. SPECS define requirements and design                         │
│         ↓                                                        │
│  3. MCP provides accurate documentation                          │
│         ↓                                                        │
│  4. VIBE CODING implements features                              │
│         ↓                                                        │
│  5. HOOKS ensure quality (type check, docs, secrets scan)        │
│         ↓                                                        │
│  6. Repeat for next feature                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Conclusion

Kiro transformed our development workflow by:

- **Eliminating repetitive tasks** through hooks (code quality, docs generation, secrets scanning)
- **Maintaining consistency** through steering (tech stack, structure, product context)
- **Ensuring accuracy** through MCP integrations (Context7, TailwindCSS, 21st.dev)
- **Enabling rapid iteration** through vibe coding
- **Providing structure** through spec-driven development (16 specs created)

The combination of these tools solved the fundamental challenges developers face when working with AI assistants: context loss, hallucinated documentation, inconsistent outputs, and lack of project awareness.

NEXUS wouldn't exist in its current form without Kiro. The AI-native features (MCP server, AI search) were particularly fitting — we used AI tools to build tools for AI.

---

_Built with Kiro for the Kiroween Hackathon 2025_
