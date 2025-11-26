<div align="center">

# NEXUS

### Three Ways to Explore Knowledge

**Horizontal • Linear • Graphical**

A skeleton template for building knowledge bases that humans can explore naturally and AI agents can query programmatically.

[Documentation](#getting-started)

</div>

---

## The Problem

Knowledge is connected. But our tools force us to explore it in disconnected ways:

| Tool                       | What It Does Well                    | What It's Missing                                             |
| -------------------------- | ------------------------------------ | ------------------------------------------------------------- |
| **Obsidian**               | Linking, graphs                      | Single-pane navigation — you lose context when clicking links |
| **GitBook/Docusaurus**     | Linear docs, sequential reading      | No linking between concepts, no exploration                   |
| **Andy Matuschak's Notes** | Stacking panes, context preservation | Not open source, no linear mode, no AI integration            |
| **Traditional Wikis**      | Linking                              | Ugly, no graphs, poor UX                                      |

**None of them combine all three ways humans naturally explore knowledge:**

1. **Horizontal** — "Let me see this related thing, but keep my current context"
2. **Linear** — "Walk me through this step by step"
3. **Graphical** — "Show me how everything connects"

And none of them are **AI-native** — you can't point Claude at your docs and ask questions.

---

## The Solution

NEXUS is a single template that gives you:

```
┌─────────────────────────────────────────────────────────────────────┐
│  NEXUS                                                    [🔍 Ask]  │
├──────────────┬──────────────────────────────────────────────────────┤
│              │                                                      │
│  📚 Notes    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│              │  │ Note A      │  │ Note B      │  │ Note C      │  │
│  • Conscious-│  │             │  │             │  │             │  │
│    ness      │  │ Clicked     │  │ Clicked     │  │ Currently   │  │
│  • Qualia    │  │ [[Note B]]  │◀─│ [[Note C]]  │◀─│ viewing     │  │
│  • Free Will │  │             │  │             │  │             │  │
│              │  │             │  │ Has backlink│  │ ┌─────────┐ │  │
│  ──────────  │  │             │  │ to Note A   │  │ │ Graph   │ │  │
│              │  │             │  │             │  │ │  ○──●   │ │  │
│  🏷️ Tags     │  │             │  │             │  │ │   \│    │ │  │
│  #philosophy │  │             │  │             │  │ │    ○    │ │  │
│              │  │             │  │ [← Prev]    │  │ └─────────┘ │  │
│              │  │             │  │ [Next →]    │  │ [← Prev]    │  │
│              │  │             │  │             │  │ [Next →]    │  │
│              │  └─────────────┘  └─────────────┘  └─────────────┘  │
│              │                                                      │
│              │  ← Horizontal scroll when more panes →               │
└──────────────┴──────────────────────────────────────────────────────┘
```

---

## Features

### Three Navigation Modes

| Mode           | How It Works                                                           | Best For                                          |
| -------------- | ---------------------------------------------------------------------- | ------------------------------------------------- |
| **Horizontal** | Click `[[link]]` → new pane opens to the right, previous stays visible | Exploring connections while keeping context       |
| **Linear**     | Previous/Next buttons navigate through ordered sequence                | Reading documentation step-by-step                |
| **Graphical**  | Interactive node graph shows connections, click to navigate            | Discovering relationships, seeing the big picture |

### Obsidian-Style Linking

```markdown
This relates to [[Consciousness]] and [[Qualia|the hard problem]].
```

- **Forward links**: You create them by typing `[[slug]]`
- **Backlinks**: Automatically detected — every note knows what links to it
- **Autocomplete**: Type `[[` and get suggestions from existing notes

### In-Browser Editing

- Create and edit notes directly in the app
- No markdown files to manage
- `[[link]]` autocomplete as you type
- Changes saved to database instantly

### AI-Powered Search

```
┌─────────────────────────────────────────┐
│ 🔍 How do I refresh an OAuth token?    │
├─────────────────────────────────────────┤
│ 🤖 AI Answer                            │
│                                         │
│ To refresh an OAuth token, POST to      │
│ /oauth/token with grant_type=refresh... │
│                                         │
│ Sources: OAuth 2.0, Token Management    │
├─────────────────────────────────────────┤
│ 📄 Related Pages                        │
│ • OAuth 2.0                             │
│ • Token Management                      │
└─────────────────────────────────────────┘
```

- **Keyword search**: Fast, works offline
- **Natural language**: AI synthesizes answers from your content

### MCP Server (AI-Native)

Your deployed NEXUS becomes an MCP server that any AI can query:

```json
{
  "mcpServers": {
    "my-docs": {
      "url": "https://docs.mycompany.com/api/mcp"
    }
  }
}
```

Now Claude can:

- List all your pages
- Read specific pages with full content
- Search your documentation
- Answer questions using your content as context

### Two Modes

| Personal Mode             | Documentation Mode               |
| ------------------------- | -------------------------------- |
| Flat list of all notes    | Hierarchical TOC with sections   |
| No linear navigation      | Prev/Next buttons enabled        |
| Optimized for exploration | Optimized for sequential reading |
| Great for personal wikis  | Great for company docs           |

---

## Quick Start

### Prerequisites

- Node.js 18+
- A Supabase account (free tier works)

### 1. Clone

```bash
git clone https://github.com/yourname/nexus.git
cd nexus
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `/scripts/setup-supabase.sql`
3. Get your project URL and anon key from Settings → API

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
NEXUS_PASSWORD=your-secret-password  # Optional: for simple auth
OPENAI_API_KEY=sk-...                 # Optional: for AI search
```

### 4. Customize Config

Edit `nexus.config.yaml`:

```yaml
site:
  title: "My Knowledge Base"

mode: "personal" # or "documentation"

theme:
  preset: "dark" # or "light"
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Deploy

```bash
vercel
```

Add environment variables in Vercel dashboard.

---

## Configuration Reference

### `nexus.config.yaml`

```yaml
# ═══════════════════════════════════════════════════════════════════
# SITE
# ═══════════════════════════════════════════════════════════════════
site:
  title: "My Knowledge Base"
  description: "Personal notes and documentation"
  logo: "/logo.svg"
  favicon: "/favicon.ico"

# ═══════════════════════════════════════════════════════════════════
# MODE
# ═══════════════════════════════════════════════════════════════════
# "personal" - All notes in sidebar, no linear nav, exploration-focused
# "documentation" - Structured TOC, linear nav, sequential reading
mode: "personal"

# ═══════════════════════════════════════════════════════════════════
# THEME
# ═══════════════════════════════════════════════════════════════════
theme:
  preset: "dark" # "dark", "light", "system", or path to custom CSS

  # Override specific colors
  colors:
    primary: "#7b2cbf"
    background: "#0a0a0f"
    text: "#e8e6e3"

  # Custom fonts
  fonts:
    heading: "Cinzel, serif"
    body: "Inter, sans-serif"
    code: "JetBrains Mono, monospace"

  # Full custom CSS
  custom_css: "./themes/my-theme.css"

# ═══════════════════════════════════════════════════════════════════
# LAYOUT
# ═══════════════════════════════════════════════════════════════════
layout:
  sidebar:
    position: "left" # "left", "right", "hidden"
    width: 260
    collapsible: true

  pane:
    width: 600
    min_width: 400
    max_width: 800

  graph:
    position: "bottom" # "bottom", "sidebar", "hidden"
    height: 200
    default_expanded: true

# ═══════════════════════════════════════════════════════════════════
# FEATURES
# ═══════════════════════════════════════════════════════════════════
features:
  local_graph: true # Show connection graph in each pane
  backlinks_panel: true # Show "N notes link here" panel
  linear_nav: false # Prev/Next buttons (auto-enabled in docs mode)
  tags: true # Enable tags
  search: true # Enable search
  ai_search: false # Natural language search (requires API key)
  import_export: true # Import/export markdown files
  mcp_server: true # Expose MCP endpoint for AI agents

# ═══════════════════════════════════════════════════════════════════
# NAVIGATION (Documentation mode only)
# ═══════════════════════════════════════════════════════════════════
navigation:
  sections:
    - title: "Getting Started"
      pages:
        - intro
        - installation
        - quick-start

    - title: "API Reference"
      pages:
        - authentication
        - endpoints
        - errors

# ═══════════════════════════════════════════════════════════════════
# AUTHENTICATION
# ═══════════════════════════════════════════════════════════════════
auth:
  mode: "password" # "none", "password", "supabase"

  permissions:
    read: "public" # "public" or "authenticated"
    write: "authenticated"

# ═══════════════════════════════════════════════════════════════════
# SEARCH
# ═══════════════════════════════════════════════════════════════════
search:
  ai:
    enabled: false
    provider: "openai" # "openai" or "anthropic"

# ═══════════════════════════════════════════════════════════════════
# MCP SERVER
# ═══════════════════════════════════════════════════════════════════
mcp:
  enabled: true
```

---

## Keyboard Shortcuts

| Shortcut       | Action                                            |
| -------------- | ------------------------------------------------- |
| `Cmd/Ctrl + K` | Open search                                       |
| `Cmd/Ctrl + N` | Create new note                                   |
| `Cmd/Ctrl + S` | Save note (in edit mode)                          |
| `Escape`       | Close search / Close rightmost pane / Cancel edit |
| `Cmd/Ctrl + [` | Previous note (linear)                            |
| `Cmd/Ctrl + ]` | Next note (linear)                                |
| `←` `→`        | Navigate between panes                            |
| `Cmd/Ctrl + \` | Toggle sidebar                                    |

---

## URL Structure

NEXUS uses URL state to make stacks shareable:

| State               | URL                                     |
| ------------------- | --------------------------------------- |
| Single note         | `/consciousness`                        |
| Stacked notes       | `/consciousness?stack=qualia,free-will` |
| With section anchor | `/consciousness?stack=qualia#section-1` |
| Search              | `/?q=what+is+consciousness`             |

**Share a stack**: Copy the URL → friend sees the exact same panes open.

---

## MCP Integration

When `mcp.enabled: true`, your deployment exposes `/api/mcp` with these tools:

### Available Tools

| Tool              | Description                                      |
| ----------------- | ------------------------------------------------ |
| `list_pages`      | Get all page slugs and titles                    |
| `get_page`        | Get full content, outlinks, backlinks for a page |
| `search`          | Search pages by keyword                          |
| `ask`             | Ask a natural language question (if AI enabled)  |
| `get_connections` | Get graph data for a page                        |

### Claude Desktop Setup

```json
{
  "mcpServers": {
    "my-knowledge-base": {
      "url": "https://your-site.vercel.app/api/mcp"
    }
  }
}
```

### Example Queries

Once connected, ask Claude:

- "What pages are in my knowledge base?"
- "Summarize the OAuth documentation"
- "What links to the Authentication page?"
- "How do I handle token refresh based on my docs?"

---

## Import & Export

### Importing Markdown Files

1. Click the import button in sidebar
2. Drag and drop `.md` files
3. NEXUS parses:
   - Frontmatter (title, tags)
   - `[[links]]` in content
4. Files are added to database

**Supported frontmatter:**

```yaml
---
title: "My Note Title"
tags: [philosophy, consciousness]
order: 5 # For linear navigation
section: "Basics" # For documentation grouping
---
```

### Exporting

- Click export to download all notes as a `.zip` of markdown files
- Frontmatter is preserved
- Use for backups or migrating to Obsidian

---

## Database Schema

NEXUS uses Supabase (PostgreSQL) with this schema:

```sql
-- Notes
CREATE TABLE notes (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  section TEXT,
  "order" INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Links (for fast backlink queries)
CREATE TABLE links (
  source_slug TEXT REFERENCES notes(slug),
  target_slug TEXT,
  UNIQUE(source_slug, target_slug)
);

-- Full-text search
ALTER TABLE notes ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || content)) STORED;
```

---

## Customization

### Custom Theme

Create `/themes/my-theme.css`:

```css
:root {
  --nexus-primary: #7b2cbf;
  --nexus-background: #0a0a0f;
  --nexus-surface: #16213e;
  --nexus-text: #e8e6e3;
  --nexus-text-muted: #a8a6a3;
  --nexus-border: #2a2a3e;
  --nexus-accent: #c77dff;
}

/* Custom styles */
.pane {
  border-left: 2px solid var(--nexus-accent);
}

.graph-node {
  fill: var(--nexus-primary);
}
```

Reference in config:

```yaml
theme:
  custom_css: "./themes/my-theme.css"
```

### Custom Fonts

```yaml
theme:
  fonts:
    heading: "'Playfair Display', serif"
    body: "'Source Sans Pro', sans-serif"
    code: "'Fira Code', monospace"
```

Add font imports to `custom_css` or include via Google Fonts.

---

## Examples

### Arcana — Personal Knowledge Vault

A dark, mystical theme for personal notes on philosophy and creativity.

**Config highlights:**

```yaml
mode: "personal"
theme:
  preset: "dark"
  colors:
    primary: "#9d4edd"
    background: "#0a0a0f"
features:
  local_graph: true
  linear_nav: false
```

### Codex — API Documentation

A clean, professional theme for technical documentation.

**Config highlights:**

```yaml
mode: "documentation"
theme:
  preset: "light"
  colors:
    primary: "#0366d6"
features:
  linear_nav: true
  mcp_server: true
navigation:
  sections:
    - title: "Getting Started"
      pages: [intro, installation, quick-start]
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         BROWSER                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Sidebar  │  Pane 1  │  Pane 2  │  Pane 3  │ ...       │  │
│  │           │  (view)  │  (view)  │  (edit)  │           │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                     NEXT.js API                              │
│  /api/notes • /api/search • /api/mcp • /api/auth             │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                       SUPABASE                               │
│  PostgreSQL • Full-text search • Auth • Real-time            │
└──────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer      | Technology                               |
| ---------- | ---------------------------------------- |
| Framework  | Next.js 14 (App Router)                  |
| Language   | TypeScript                               |
| Styling    | Tailwind CSS                             |
| Database   | Supabase (PostgreSQL)                    |
| Auth       | Supabase Auth or simple password         |
| Search     | PostgreSQL full-text + OpenAI (optional) |
| Deployment | Vercel                                   |

---

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint

# Build for production
npm run build

# Seed example data
npm run seed:arcana   # Personal knowledge example
npm run seed:codex    # Documentation example
```

---

## Project Structure

```
/nexus
├── nexus.config.yaml        # Main configuration
├── /src
│   ├── /app                 # Next.js App Router
│   │   ├── /api             # API routes
│   │   │   ├── /notes       # CRUD for notes
│   │   │   ├── /search      # Search endpoint
│   │   │   ├── /mcp         # MCP server
│   │   │   └── /auth        # Authentication
│   │   └── page.tsx         # Main app
│   ├── /components          # React components
│   ├── /hooks               # Custom hooks
│   ├── /lib                 # Utilities
│   └── /types               # TypeScript types
├── /themes                  # Custom themes
├── /examples                # Example configurations
└── /scripts                 # Setup and seed scripts
```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

---

## License

MIT License — use it for anything.

---

## Acknowledgments

- **Andy Matuschak** — for pioneering the stacking notes pattern
- **Obsidian** — for proving that `[[linking]]` works
- **Reflect** — for open-sourcing the [Beginning of Infinity](https://github.com/team-reflect/beginning-of-infinity) implementation

---

<div align="center">

**Built for the Kiroween Hackathon 2025**

_Skeleton Crew Category_

Three ways to explore. One template to build.

</div>
