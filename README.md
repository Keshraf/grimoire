<div align="center">

# NEXUS

### Three Ways to Explore Knowledge

**Horizontal • Linear • Graphical**

A skeleton template for building knowledge bases that humans can explore naturally and AI agents can query programmatically.

[Setup Guide](docs/SETUP_GUIDE.md) • [Project Value](docs/PROJECT_VALUE.md) • [Kiro Usage](docs/KIRO_USAGE.md)

</div>

---

## 🎃 Kiroween Hackathon 2025

**Category:** Skeleton Crew

This project demonstrates how a single skeleton codebase can power vastly different applications:

| Application               | Description                                       | Demo           |
| ------------------------- | ------------------------------------------------- | -------------- |
| **[Arcana](apps/arcana)** | Personal knowledge vault with dark mystical theme | [Live Demo](#) |
| **[Codex](apps/codex)**   | API documentation with light professional theme   | [Live Demo](#) |

---

## The Problem

Knowledge is connected. But our tools force us to explore it in disconnected ways:

| Tool                       | What It Does Well                    | What It's Missing                                             |
| -------------------------- | ------------------------------------ | ------------------------------------------------------------- |
| **Obsidian**               | Linking, graphs                      | Single-pane navigation — you lose context when clicking links |
| **GitBook/Docusaurus**     | Linear docs, sequential reading      | No linking between concepts, no exploration                   |
| **Andy Matuschak's Notes** | Stacking panes, context preservation | Not open source, no linear mode, no AI integration            |
| **Traditional Wikis**      | Linking                              | Ugly, no graphs, poor UX                                      |

**NEXUS combines all three ways humans naturally explore knowledge:**

1. **Horizontal** — "Let me see this related thing, but keep my current context"
2. **Linear** — "Walk me through this step by step"
3. **Graphical** — "Show me how everything connects"

And it's **AI-native** — point Claude at your docs and ask questions.

---

## Features

- 🔗 **Obsidian-style `[[wikilinks]]`** with automatic backlinks
- 📚 **Stacking panes** for context-preserving exploration
- 📖 **Linear navigation** for sequential documentation
- 🕸️ **Interactive graph** showing note connections
- 🤖 **MCP Server** for AI agent integration
- 🔍 **AI-powered search** with natural language queries
- ✏️ **In-browser editing** with real-time saves
- 🎨 **Configurable themes** via YAML
- 🔐 **Flexible auth** (none, password, or Supabase)

---

## Project Structure

```
nexus/
├── apps/
│   ├── arcana/              # Personal knowledge base app
│   │   ├── nexus.config.yaml
│   │   ├── vercel.json
│   │   └── src/
│   └── codex/               # API documentation app
│       ├── nexus.config.yaml
│       ├── vercel.json
│       └── src/
├── packages/
│   └── nexus-core/          # Shared skeleton code
│       └── src/
│           ├── components/
│           ├── hooks/
│           ├── lib/
│           └── types/
├── docs/
│   ├── SETUP_GUIDE.md       # User-friendly setup instructions
│   ├── PROJECT_VALUE.md     # Value proposition
│   └── KIRO_USAGE.md        # How Kiro was used
├── scripts/
│   ├── setup-supabase.sql   # Database schema
│   └── seed.ts              # Seeding script
└── .kiro/                   # Kiro specs, hooks, and steering
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/yourname/nexus.git
cd nexus
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `scripts/setup-supabase.sql` in the SQL Editor
3. Get your project URL and anon key from Settings → API

### 3. Configure Environment

```bash
# For Arcana
cp apps/arcana/.env.example apps/arcana/.env

# For Codex
cp apps/codex/.env.example apps/codex/.env
```

Edit the `.env` files with your Supabase credentials.

### 4. Seed Sample Data

```bash
npm run seed:arcana   # Personal knowledge example
npm run seed:codex    # Documentation example
```

### 5. Run

```bash
npm run dev:arcana    # http://localhost:3001
npm run dev:codex     # http://localhost:3002
```

---

## Configuration

Each app is configured via `nexus.config.yaml`:

```yaml
site:
  title: "My Knowledge Base"
  description: "Personal notes and documentation"

mode: "personal" # or "documentation"

theme:
  preset: "dark" # or "light"
  colors:
    primary: "#9333ea"

features:
  local_graph: true
  linear_nav: false
  ai_search: false
  mcp_server: true

auth:
  mode: "password" # "none", "password", or "supabase"
```

See the [full configuration reference](docs/SETUP_GUIDE.md#customizing-your-nexus) for all options.

---

## Deployment

### Deploy to Vercel

Each app includes a `vercel.json` for one-click deployment:

1. Push to GitHub
2. Import to Vercel
3. Set **Root Directory** to `apps/arcana` or `apps/codex`
4. Add environment variables
5. Deploy

See the [detailed deployment guide](docs/SETUP_GUIDE.md#step-5-deploy-to-vercel).

---

## MCP Integration

When `mcp.enabled: true`, your deployment exposes `/api/mcp`:

```json
{
  "mcpServers": {
    "my-docs": {
      "url": "https://your-app.vercel.app/api/mcp"
    }
  }
}
```

**Available Tools:**

- `list_pages` — Get all page titles
- `get_page` — Get content, outlinks, backlinks
- `search` — Search by keyword
- `ask` — Natural language questions (if AI enabled)

---

## Development

```bash
npm run dev:arcana     # Run Arcana dev server
npm run dev:codex      # Run Codex dev server
npm run build:all      # Build all packages and apps
npm run lint           # Lint all apps
npm run test           # Run tests
```

---

## Documentation

- **[Setup Guide](docs/SETUP_GUIDE.md)** — Step-by-step instructions for non-developers
- **[Project Value](docs/PROJECT_VALUE.md)** — Why NEXUS exists and what makes it unique
- **[Kiro Usage](docs/KIRO_USAGE.md)** — How Kiro was used to build this project

---

## Tech Stack

| Layer      | Technology              |
| ---------- | ----------------------- |
| Framework  | Next.js 14 (App Router) |
| Language   | TypeScript              |
| Styling    | Tailwind CSS            |
| Database   | Supabase (PostgreSQL)   |
| Editor     | TipTap                  |
| State      | React Query v5          |
| Deployment | Vercel                  |

---

## License

MIT License — use it for anything.

---

## Acknowledgments

- **Kiro** — for making AI-assisted development a joy
- **Andy Matuschak** — for pioneering the stacking notes pattern
- **Obsidian** — for proving that `[[linking]]` works

---

<div align="center">

**Built for the Kiroween Hackathon 2025**

_Skeleton Crew Category_

Three ways to explore. One template to build.

🎃 👻 🦇

</div>
