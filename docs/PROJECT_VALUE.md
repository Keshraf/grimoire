# NEXUS: Project Value Proposition

## The Inspiration

NEXUS was born from a simple observation: **knowledge is connected, but our tools force us to explore it in disconnected ways.**

### Andy Matuschak's Notes

The primary inspiration came from [Andy Matuschak's working notes](https://notes.andymatuschak.org/), which pioneered the "stacking panes" pattern. When you click a link, a new pane opens to the right while the previous context remains visible. This mirrors how we naturally think — building understanding by layering related concepts.

> "When I'm deep in a topic, I want to see how ideas connect. I don't want to lose where I came from just to see where I'm going."

This insight drove our core design: **preserve context while exploring connections**.

### The Learning Problem

We learn by continuously diving deeper into topics we encounter. Our knowledge stacks — one concept leads to another, which leads to another. But most tools break this flow:

- **Click a link** → Previous page disappears
- **Open in new tab** → Context scattered across tabs
- **Use back button** → Lose your place in the new content

NEXUS solves this by keeping your exploration path visible, letting you see the journey alongside the destination.

---

## Three Ways to Explore Knowledge

NEXUS supports three distinct navigation modes because different content and contexts demand different approaches:

### 1. Horizontal Navigation (Stacking Panes)

**Best for:** Personal notes, research, exploration

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Note A      │  │ Note B      │  │ Note C      │
│             │  │             │  │             │
│ Clicked     │  │ Clicked     │  │ Currently   │
│ [[Note B]]  │◀─│ [[Note C]]  │◀─│ viewing     │
│             │  │             │  │             │
└─────────────┘  └─────────────┘  └─────────────┘
```

**Why it matters:** When exploring ideas, you often need to reference where you came from. Horizontal stacking keeps your mental breadcrumbs visible.

### 2. Linear Navigation (Sequential Reading)

**Best for:** Documentation, tutorials, guides

```
[← Previous: Installation]  [Next: Quick Start →]
```

**Why it matters:** Some content has a natural order. API documentation, onboarding guides, and tutorials benefit from clear "what's next" navigation.

### 3. Graphical Navigation (Connection Map)

**Best for:** Discovering relationships, seeing the big picture

```
       ○ Consciousness
      /│\
     / │ \
    ○  ○  ○
   Qualia Free Will Creativity
```

**Why it matters:** Sometimes you need to zoom out and see how everything connects. The graph view reveals patterns and relationships that linear reading misses.

---

## The Skeleton Approach

NEXUS is a **skeleton template** — lean enough to be clear, flexible enough to support vastly different use cases.

### One Codebase, Many Applications

The same core code powers:

| Application | Mode          | Theme              | Auth     | Use Case                       |
| ----------- | ------------- | ------------------ | -------- | ------------------------------ |
| **Arcana**  | Personal      | Dark/Mystical      | Password | Personal knowledge vault       |
| **Codex**   | Documentation | Light/Professional | Public   | API documentation (Enterprise) |

### Configuration-Driven Customization

Everything is controlled through a single `nexus.config.yaml`:

```yaml
# Switch from personal wiki to documentation site
mode: "documentation" # or "personal"

# Change the entire look
theme:
  preset: "light" # or "dark"

# Enable/disable features
features:
  local_graph: true
  linear_nav: true
  ai_search: true
```

### Why This Matters

1. **No Code Changes Required**: Customize entirely through configuration
2. **AI-Friendly**: A single YAML file is easy for AI to generate and modify
3. **Rapid Deployment**: Go from idea to deployed app in minutes
4. **Consistent Quality**: Same battle-tested code, different presentations

---

## AI-Native Design

In the age of AI assistants, your knowledge needs to be **portable and queryable**.

### Built-in MCP Server

Every NEXUS deployment can expose an MCP (Model Context Protocol) endpoint:

```json
{
  "mcpServers": {
    "my-docs": {
      "url": "https://docs.mycompany.com/api/mcp"
    }
  }
}
```

Now AI assistants can:

- **List** all your pages
- **Read** specific content
- **Search** your knowledge base
- **Answer questions** using your content as context

### Why This Matters

**For Individuals:**

- Carry your knowledge base everywhere
- Ask Claude about your own notes
- Get AI assistance grounded in your actual content

**For Enterprises:**

- Scale documentation to support agentic workflows
- Enable AI coding assistants to reference internal docs
- Future-proof documentation for the AI era

### AI-Powered Search

Beyond MCP, NEXUS includes optional AI search:

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
└─────────────────────────────────────────┘
```

Users get synthesized answers, not just search results.

---

## Comparison with Existing Tools

| Feature           | NEXUS | Obsidian | GitBook | Notion | Traditional Wiki |
| ----------------- | ----- | -------- | ------- | ------ | ---------------- |
| Stacking Panes    | ✅    | ❌       | ❌      | ❌     | ❌               |
| Linear Navigation | ✅    | ❌       | ✅      | ❌     | ❌               |
| Graph View        | ✅    | ✅       | ❌      | ❌     | ❌               |
| [[Linked Notes]]  | ✅    | ✅       | ❌      | ✅     | ✅               |
| MCP Server        | ✅    | ❌       | ❌      | ❌     | ❌               |
| AI Search         | ✅    | Plugin   | ❌      | ✅     | ❌               |
| Web-Based         | ✅    | ❌       | ✅      | ✅     | ✅               |
| Open Source       | ✅    | ❌       | ❌      | ❌     | Varies           |
| Self-Hosted       | ✅    | N/A      | ❌      | ❌     | ✅               |
| Config-Driven     | ✅    | ❌       | Partial | ❌     | ❌               |

### What Makes NEXUS Unique

1. **Only tool combining all three navigation modes**
2. **First-class AI integration** (MCP + AI search)
3. **True skeleton approach** — same code, different apps
4. **Modern stack** — Next.js, Supabase, Tailwind
5. **Open source and self-hostable**

---

## Flexibility and Security

### Flexible Authentication

NEXUS supports multiple auth modes:

```yaml
auth:
  mode: "none"      # Public access
  mode: "password"  # Simple password protection
  mode: "supabase"  # Full user management
```

Choose the right level for your use case:

- **Public docs**: No auth needed
- **Personal notes**: Password protection
- **Team wiki**: Supabase auth with user management

### Supabase: Minimal Learning Curve

We chose Supabase because:

- **Free tier** is generous enough for most use cases
- **PostgreSQL** is familiar and powerful
- **Built-in auth** when you need it
- **Real-time** capabilities for future features
- **Great documentation** and community

---

## The One-Shot AI Prompt Dream

Our goal: **describe what you want, get a working NEXUS**.

Because everything is configuration-driven:

```
"Create a dark-themed personal wiki for my philosophy notes
with graph visualization and password protection"
```

→ AI generates `nexus.config.yaml`
→ Deploy to Vercel
→ Done

This is the power of the skeleton approach combined with AI-friendly configuration.

---

## Target Users

### Personal Knowledge Management

- Researchers building interconnected notes
- Writers organizing ideas and references
- Students creating study materials
- Anyone who thinks in connections

### Company Documentation

- API documentation with AI querying
- Internal wikis with MCP integration
- Onboarding guides with linear navigation
- Knowledge bases that AI assistants can search

### Developers

- Those who want to self-host
- Teams needing customization
- Projects requiring AI-native documentation

---

## Conclusion

NEXUS addresses a gap in the knowledge management landscape:

**The Problem:** Existing tools force you to choose between exploration (Obsidian), structure (GitBook), or AI integration (scattered solutions).

**The Solution:** A single, flexible template that supports all three navigation modes, integrates AI natively, and adapts to different use cases through configuration alone.

**The Vision:** Knowledge tools that match how humans actually think and learn — connected, contextual, and AI-augmented.

---

_NEXUS: Three ways to explore. One template to build._

_Built for the Kiroween Hackathon 2025 — Skeleton Crew Category_
