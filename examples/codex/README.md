# Codex - API Documentation Example

A professional API documentation site demonstrating NEXUS configured for technical documentation with linear navigation. This example showcases the "documentation" mode with a light theme optimized for readability.

## Features

- **Documentation Mode**: Structured navigation with prev/next buttons
- **Light Theme**: Professional blue/gray color palette (codex.css)
- **12 Documentation Pages**: Organized into 4 sections with wikilinks
- **Linear Navigation**: Sequential reading through ordered pages
- **MCP Server**: AI agent integration for querying documentation
- **Public Access**: No authentication required for reading

## Prerequisites

1. A Supabase project with the NEXUS schema applied
2. Node.js 18+ installed
3. Environment variables configured

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Run the schema setup in SQL Editor:
   ```sql
   -- Copy contents from scripts/setup-supabase.sql
   ```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Note: No `NEXUS_PASSWORD` needed since auth mode is "none".

### 3. Copy Configuration

```bash
cp examples/codex/nexus.config.yaml ./nexus.config.yaml
```

### 4. Seed the Database

```bash
npm run seed -- codex
```

### 5. Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Documentation Structure

| Section         | Pages                                     | Description              |
| --------------- | ----------------------------------------- | ------------------------ |
| Getting Started | Introduction, Installation, Quick Start   | Onboarding for new users |
| Authentication  | Auth Overview, OAuth 2.0, API Keys        | Security and credentials |
| API Reference   | Users API, Posts API, Comments API        | Endpoint documentation   |
| Guides          | Pagination, Error Handling, Rate Limiting | Best practices           |

## Navigation

The documentation uses linear navigation, allowing readers to progress sequentially:

```
Introduction → Installation → Quick Start → Auth Overview → ...
```

Each page displays prev/next buttons based on the navigation order defined in `nexus.config.yaml`.

## MCP Server Integration

The Codex example includes MCP server support for AI agent integration:

```bash
# List all documentation pages
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"tool": "list_pages", "input": {}}'

# Get a specific page
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"tool": "get_page", "input": {"title": "Users API"}}'

# Search documentation
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"tool": "search", "input": {"query": "authentication"}}'
```

## Deployment to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Customization

To create your own documentation site based on Codex:

1. Copy this directory:

   ```bash
   cp -r examples/codex examples/my-docs
   ```

2. Edit `nexus.config.yaml`:

   - Update `site.title` and `site.description`
   - Modify `navigation.sections` with your page structure
   - Adjust theme colors if desired

3. Replace `seed-data.sql` with your content:

   - Follow the INSERT pattern with `section` and `order` fields
   - Include wikilinks using `[[Page Title]]` syntax
   - Add corresponding link records

4. Update this README

5. Seed your database:
   ```bash
   npm run seed -- my-docs
   ```

## Key Differences from Arcana

| Feature    | Codex         | Arcana         |
| ---------- | ------------- | -------------- |
| Mode       | documentation | personal       |
| Theme      | light         | dark           |
| Linear Nav | enabled       | disabled       |
| Graph      | hidden        | visible        |
| Auth       | none          | password       |
| Use Case   | API docs      | Knowledge base |

This demonstrates how the same NEXUS skeleton can power vastly different applications through configuration alone.
