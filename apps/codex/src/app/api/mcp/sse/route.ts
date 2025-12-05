import { NextRequest } from "next/server";
import { createClient } from "@nexus/core/lib/supabase/server";
import { getConfig } from "@nexus/core/lib/config";
import { aiSearch } from "@nexus/core/lib/ai-search";
import { parseWikilinks } from "@nexus/core/lib/links";
import { getLocalGraph } from "@nexus/core/lib/graph";
import type { Note } from "@nexus/core/types";

// Extend timeout (requires Vercel Pro for 60s, hobby is 10s)
export const maxDuration = 60;

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Cache-Control",
};

// Tool definitions
const tools = [
  {
    name: "list_pages",
    description: "List all pages in the knowledge base with their titles",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_page",
    description:
      "Get the full content of a specific page including outlinks and backlinks",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The title of the page to retrieve",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "search",
    description: "Search the knowledge base for pages matching a query",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query to find matching pages",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "ask",
    description:
      "Ask a natural language question and get an AI-generated answer based on the knowledge base",
    inputSchema: {
      type: "object",
      properties: {
        question: {
          type: "string",
          description: "Natural language question to answer",
        },
      },
      required: ["question"],
    },
  },
  {
    name: "get_connections",
    description:
      "Get the connections (outlinks, backlinks, local graph) for a specific page",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "The title of the page" },
      },
      required: ["title"],
    },
  },
];

// Tool handlers
async function handleListPages() {
  const supabase = await createClient();
  const { data: notes, error } = await supabase
    .from("notes")
    .select("title")
    .order("created_at", { ascending: false });
  if (error) throw new Error("Failed to fetch pages");
  return { pages: notes || [] };
}

async function handleGetPage(title: string) {
  const supabase = await createClient();
  const { data: note, error } = await supabase
    .from("notes")
    .select("*")
    .eq("title", title)
    .single();
  if (error || !note) throw new Error(`Page '${title}' not found`);
  const outlinks = parseWikilinks(note.content);
  const { data: links } = await supabase
    .from("links")
    .select("source_title")
    .eq("target_title", title);
  const backlinks = links?.map((l) => l.source_title) || [];
  return { title: note.title, content: note.content, outlinks, backlinks };
}

async function handleSearch(query: string) {
  const searchQuery = query.trim();
  const supabase = await createClient();
  const { data: notes, error } = await supabase
    .from("notes")
    .select("title, content")
    .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
    .limit(20);
  if (error) throw new Error("Failed to search pages");
  const results = (notes || []).map((note) => {
    const content = note.content || "";
    const idx = content.toLowerCase().indexOf(searchQuery.toLowerCase());
    let excerpt =
      idx >= 0
        ? (idx > 50 ? "..." : "") +
          content.slice(Math.max(0, idx - 50), idx + searchQuery.length + 100) +
          "..."
        : content.slice(0, 150) + (content.length > 150 ? "..." : "");
    return { title: note.title, excerpt };
  });
  return { results };
}

async function handleAsk(question: string) {
  const config = getConfig();
  const aiEnabled = config.features.ai_search && config.search?.ai?.enabled;
  const provider = config.search?.ai?.provider || "openai";
  const apiKey =
    provider === "gemini"
      ? process.env.GEMINI_API_KEY
      : provider === "anthropic"
      ? process.env.ANTHROPIC_API_KEY
      : process.env.OPENAI_API_KEY;
  if (!aiEnabled || !apiKey)
    return { answer: "AI search is not available", sources: [] };
  const supabase = await createClient();
  const keywords = question
    .toLowerCase()
    .replace(/[?.,!]/g, "")
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 3 &&
        ![
          "what",
          "how",
          "does",
          "the",
          "this",
          "that",
          "with",
          "from",
          "have",
          "about",
        ].includes(w)
    );
  const searchTerms = keywords.length > 0 ? keywords : [question];
  const orConditions = searchTerms
    .map((t) => `title.ilike.%${t}%,content.ilike.%${t}%`)
    .join(",");
  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .or(orConditions)
    .limit(5);
  if (!notes?.length)
    return { answer: "No relevant information found.", sources: [] };
  const result = await aiSearch(question, notes as Note[], {
    provider,
    apiKey,
  });
  return {
    answer: result.answer,
    sources: result.sources.map((s) => ({ title: s.title })),
  };
}

async function handleGetConnections(title: string) {
  const supabase = await createClient();
  const { data: note, error } = await supabase
    .from("notes")
    .select("*")
    .eq("title", title)
    .single();
  if (error || !note) throw new Error(`Page '${title}' not found`);
  const outlinks = parseWikilinks(note.content);
  const { data: links } = await supabase
    .from("links")
    .select("source_title")
    .eq("target_title", title);
  const backlinks = links?.map((l) => l.source_title) || [];
  const { data: allNotes } = await supabase.from("notes").select("*");
  const localGraph = getLocalGraph(title, (allNotes as Note[]) || []);
  return {
    title,
    outlinks,
    backlinks,
    localGraph: { nodes: localGraph.nodes, edges: localGraph.edges },
  };
}

async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case "list_pages":
      return handleListPages();
    case "get_page":
      return handleGetPage(args.title as string);
    case "search":
      return handleSearch(args.query as string);
    case "ask":
      return handleAsk(args.question as string);
    case "get_connections":
      return handleGetConnections(args.title as string);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// JSON-RPC types
interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string };
}

// Handle JSON-RPC message and return response
async function handleJsonRpc(
  msg: JsonRpcRequest
): Promise<JsonRpcResponse | null> {
  const { id, method, params } = msg;
  if (id === undefined) return null; // Notifications don't need responses

  try {
    switch (method) {
      case "initialize":
        return {
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            serverInfo: { name: "codex-mcp", version: "1.0.0" },
          },
        };
      case "tools/list":
        return { jsonrpc: "2.0", id, result: { tools } };
      case "tools/call": {
        const { name, arguments: args } = params as {
          name: string;
          arguments?: Record<string, unknown>;
        };
        const result = await executeTool(name, args || {});
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          },
        };
      }
      case "ping":
        return { jsonrpc: "2.0", id, result: {} };
      default:
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `Method not found: ${method}` },
        };
    }
  } catch (err) {
    return {
      jsonrpc: "2.0",
      id,
      error: {
        code: -32000,
        message: err instanceof Error ? err.message : "Unknown error",
      },
    };
  }
}

// GET /api/mcp/sse - SSE endpoint that handles the full MCP session inline
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const url = new URL(request.url);

  // Create SSE stream
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // Send endpoint event pointing to POST handler
      const endpointUrl = `${url.origin}/api/mcp/sse`;
      controller.enqueue(
        encoder.encode(`event: endpoint\ndata: ${endpointUrl}\n\n`)
      );

      // Keep connection alive with periodic pings
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: keepalive\n\n`));
        } catch {
          clearInterval(keepAlive);
        }
      }, 15000);

      // Clean up on abort
      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      ...corsHeaders,
    },
  });
}

// POST /api/mcp/sse - Handle JSON-RPC messages and return response directly
export async function POST(request: NextRequest) {
  try {
    const message: JsonRpcRequest = await request.json();
    const response = await handleJsonRpc(message);

    if (!response) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Return JSON-RPC response directly (not via SSE)
    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("MCP error:", err);
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: "Parse error" },
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
}

// OPTIONS for CORS preflight
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
