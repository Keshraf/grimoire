# Design Document: MCP Server Endpoint

## Overview

This document describes the technical design for implementing a Model Context Protocol (MCP) server endpoint in NEXUS. The MCP server exposes knowledge base functionality through a standardized API at `/api/mcp`, enabling AI agents to interact with notes, search content, and explore connections.

## Architecture

The MCP server follows a simple request-response pattern using Next.js API routes:

```mermaid
flowchart LR
    Client[AI Agent/MCP Client] -->|HTTP Request| API[/api/mcp/route.ts]
    API -->|GET| Manifest[Return Tool Manifest]
    API -->|POST| Router[Tool Router]
    Router --> ListPages[list_pages]
    Router --> GetPage[get_page]
    Router --> Search[search]
    Router --> Ask[ask]
    Router --> GetConnections[get_connections]

    ListPages --> Supabase[(Supabase)]
    GetPage --> Supabase
    Search --> Supabase
    Ask --> AISearch[AI Search Service]
    GetConnections --> Graph[Graph Utils]

    AISearch --> Supabase
    Graph --> Supabase
```

### Request Flow

1. Client sends HTTP request to `/api/mcp`
2. GET requests return the tool manifest
3. POST requests are routed to the appropriate tool handler based on `tool` field
4. Tool handlers interact with Supabase and utility functions
5. Results are formatted and returned as JSON

## Components and Interfaces

### API Route: `/api/mcp/route.ts`

The main entry point handling both GET (manifest) and POST (tool invocation) requests.

```typescript
// GET handler - returns manifest
export async function GET(): Promise<NextResponse<MCPManifest>>;

// POST handler - invokes tools
export async function POST(
  request: NextRequest
): Promise<NextResponse<MCPResponse>>;
```

### Type Definitions

New types to be added to `src/types/index.ts`:

```typescript
// MCP Tool Definition
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
}

// MCP Manifest (GET response)
export interface MCPManifest {
  name: string;
  version: string;
  description: string;
  tools: MCPTool[];
}

// MCP Tool Request (POST body)
export interface MCPToolRequest {
  tool: string;
  input: Record<string, unknown>;
}

// MCP Success Response
export interface MCPSuccessResponse<T = unknown> {
  result: T;
}

// MCP Error Response
export interface MCPErrorResponse {
  error: string;
}

// Union type for responses
export type MCPResponse<T = unknown> = MCPSuccessResponse<T> | MCPErrorResponse;

// Tool-specific result types
export interface ListPagesResult {
  pages: Array<{ slug: string; title: string }>;
}

export interface GetPageResult {
  slug: string;
  title: string;
  content: string;
  outlinks: string[];
  backlinks: string[];
}

export interface SearchResultItem {
  slug: string;
  title: string;
  excerpt: string;
}

export interface SearchToolResult {
  results: SearchResultItem[];
}

export interface AskResult {
  answer: string;
  sources: Array<{ slug: string; title: string }>;
}

export interface GetConnectionsResult {
  slug: string;
  outlinks: string[];
  backlinks: string[];
  localGraph: {
    nodes: Array<{ id: string; title: string; connections: number }>;
    edges: Array<{ source: string; target: string }>;
  };
}
```

### Tool Handlers

Each tool is implemented as a separate async function:

```typescript
// Tool handler signatures
async function handleListPages(): Promise<ListPagesResult>;
async function handleGetPage(input: { slug: string }): Promise<GetPageResult>;
async function handleSearch(input: {
  query: string;
}): Promise<SearchToolResult>;
async function handleAsk(input: { question: string }): Promise<AskResult>;
async function handleGetConnections(input: {
  slug: string;
}): Promise<GetConnectionsResult>;
```

## Data Models

### MCP Manifest Structure

```json
{
  "name": "nexus-mcp",
  "version": "1.0.0",
  "description": "MCP server for NEXUS knowledge base",
  "tools": [
    {
      "name": "list_pages",
      "description": "List all pages in the knowledge base with their slugs and titles",
      "inputSchema": {
        "type": "object",
        "properties": {},
        "required": []
      }
    },
    {
      "name": "get_page",
      "description": "Get the full content of a specific page including outlinks and backlinks",
      "inputSchema": {
        "type": "object",
        "properties": {
          "slug": {
            "type": "string",
            "description": "The URL slug of the page to retrieve"
          }
        },
        "required": ["slug"]
      }
    },
    {
      "name": "search",
      "description": "Search the knowledge base for pages matching a query",
      "inputSchema": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "Search query to find matching pages"
          }
        },
        "required": ["query"]
      }
    },
    {
      "name": "ask",
      "description": "Ask a natural language question and get an AI-generated answer based on the knowledge base",
      "inputSchema": {
        "type": "object",
        "properties": {
          "question": {
            "type": "string",
            "description": "Natural language question to answer"
          }
        },
        "required": ["question"]
      }
    },
    {
      "name": "get_connections",
      "description": "Get the connections (outlinks, backlinks, local graph) for a specific page",
      "inputSchema": {
        "type": "object",
        "properties": {
          "slug": {
            "type": "string",
            "description": "The URL slug of the page"
          }
        },
        "required": ["slug"]
      }
    }
  ]
}
```

### Database Queries

The implementation reuses existing Supabase queries:

| Tool            | Query                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------- |
| list_pages      | `supabase.from("notes").select("slug, title").order("created_at", { ascending: false })` |
| get_page        | `supabase.from("notes").select("*").eq("slug", slug).single()` + links query             |
| search          | `supabase.from("notes").select("slug, title, content").or(...)`                          |
| ask             | Reuses `aiSearch()` from `src/lib/ai-search.ts`                                          |
| get_connections | `supabase.from("links").select(...)` + `getLocalGraph()` from `src/lib/graph.ts`         |

## Error Handling

### Error Response Format

All errors return a consistent JSON structure:

```typescript
{
  error: string; // Human-readable error message
}
```

### HTTP Status Codes

| Scenario                   | Status Code |
| -------------------------- | ----------- |
| Success                    | 200         |
| Invalid JSON body          | 400         |
| Missing tool name          | 400         |
| Unknown tool               | 400         |
| Missing required parameter | 400         |
| Page not found             | 404         |
| AI search unavailable      | 503         |
| Internal server error      | 500         |

### Error Handling Strategy

```typescript
// Validation errors
if (!body.tool) {
  return NextResponse.json({ error: "Missing 'tool' field" }, { status: 400 });
}

// Not found errors
if (!note) {
  return NextResponse.json(
    { error: `Page '${slug}' not found` },
    { status: 404 }
  );
}

// Service unavailable
if (!aiEnabled) {
  return NextResponse.json(
    { error: "AI search is not available" },
    { status: 503 }
  );
}

// Internal errors (catch block)
return NextResponse.json({ error: "Internal server error" }, { status: 500 });
```

## Testing Strategy

### Unit Tests

Test file: `src/app/api/mcp/__tests__/route.test.ts`

1. **Manifest Tests**

   - GET returns valid manifest structure
   - Manifest contains all 5 tools
   - Each tool has correct schema

2. **Tool Handler Tests**

   - list_pages returns array of pages
   - get_page returns full note with links
   - search returns matching results
   - ask returns AI answer with sources
   - get_connections returns graph data

3. **Error Handling Tests**
   - Invalid JSON returns 400
   - Missing tool returns 400
   - Unknown tool returns 400
   - Missing required params returns 400
   - Non-existent slug returns 404

### Integration Considerations

- Tests should mock Supabase client
- AI search tests should mock OpenAI/Anthropic APIs
- Use existing test patterns from `src/hooks/__tests__/`

## File Structure

```
src/
├── app/
│   └── api/
│       └── mcp/
│           └── route.ts          # Main MCP endpoint
└── types/
    └── index.ts                  # Add MCP types
```

## Dependencies

No new dependencies required. The implementation uses:

- `next/server` - NextRequest, NextResponse
- `@/lib/supabase` - Database client
- `@/lib/ai-search` - AI search functionality
- `@/lib/graph` - Graph utilities
- `@/lib/markdown` - Link extraction
