import { NextRequest } from "next/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createClient } from "@nexus/core/lib/supabase/server";
import { getConfig } from "@nexus/core/lib/config";
import { aiSearch } from "@nexus/core/lib/ai-search";
import { parseWikilinks } from "@nexus/core/lib/links";
import { getLocalGraph } from "@nexus/core/lib/graph";
import type { Note } from "@nexus/core/types";
import { z } from "zod";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, mcp-session-id",
};

// Create MCP server with tools
function createMcpServer() {
  const server = new McpServer(
    { name: "codex-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  // Tool: list_pages
  server.tool(
    "list_pages",
    "List all pages in the knowledge base with their titles",
    {},
    async () => {
      const supabase = await createClient();
      const { data: notes, error } = await supabase
        .from("notes")
        .select("title")
        .order("created_at", { ascending: false });
      if (error) throw new Error("Failed to fetch pages");
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ pages: notes || [] }, null, 2),
          },
        ],
      };
    }
  );

  // Tool: get_page
  server.tool(
    "get_page",
    "Get the full content of a specific page including outlinks and backlinks",
    { title: z.string().describe("The title of the page to retrieve") },
    async ({ title }) => {
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

      const result = {
        title: note.title,
        content: note.content,
        outlinks,
        backlinks,
      };
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Tool: search
  server.tool(
    "search",
    "Search the knowledge base for pages matching a query",
    { query: z.string().describe("Search query to find matching pages") },
    async ({ query }) => {
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
        const lowerContent = content.toLowerCase();
        const lowerQuery = searchQuery.toLowerCase();
        const matchIndex = lowerContent.indexOf(lowerQuery);
        let excerpt = "";
        if (matchIndex >= 0) {
          const start = Math.max(0, matchIndex - 50);
          const end = Math.min(
            content.length,
            matchIndex + searchQuery.length + 100
          );
          excerpt =
            (start > 0 ? "..." : "") +
            content.slice(start, end) +
            (end < content.length ? "..." : "");
        } else {
          excerpt = content.slice(0, 150) + (content.length > 150 ? "..." : "");
        }
        return { title: note.title, excerpt };
      });
      return {
        content: [{ type: "text", text: JSON.stringify({ results }, null, 2) }],
      };
    }
  );

  // Tool: ask
  server.tool(
    "ask",
    "Ask a natural language question and get an AI-generated answer based on the knowledge base",
    { question: z.string().describe("Natural language question to answer") },
    async ({ question }) => {
      const config = getConfig();
      const aiEnabled = config.features.ai_search && config.search?.ai?.enabled;
      const provider = config.search?.ai?.provider || "openai";
      const apiKey =
        provider === "gemini"
          ? process.env.GEMINI_API_KEY
          : provider === "anthropic"
          ? process.env.ANTHROPIC_API_KEY
          : process.env.OPENAI_API_KEY;

      if (!aiEnabled || !apiKey) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: "AI search is not available" }),
            },
          ],
        };
      }

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
        .map((term) => `title.ilike.%${term}%,content.ilike.%${term}%`)
        .join(",");

      const { data: notes, error } = await supabase
        .from("notes")
        .select("*")
        .or(orConditions)
        .limit(5);
      if (error) throw new Error("Failed to search for relevant pages");

      if (!notes || notes.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                answer: "No relevant information found.",
                sources: [],
              }),
            },
          ],
        };
      }

      const result = await aiSearch(question, notes as Note[], {
        provider,
        apiKey,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                answer: result.answer,
                sources: result.sources.map((s) => ({ title: s.title })),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // Tool: get_connections
  server.tool(
    "get_connections",
    "Get the connections (outlinks, backlinks, local graph) for a specific page",
    { title: z.string().describe("The title of the page") },
    async ({ title }) => {
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

      const result = {
        title,
        outlinks,
        backlinks,
        localGraph: { nodes: localGraph.nodes, edges: localGraph.edges },
      };
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  return server;
}

// Convert Next.js request to Node-like request for the SDK
async function handleMcpRequest(req: NextRequest): Promise<Response> {
  const server = createMcpServer();

  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // Stateless mode for serverless
    });

    await server.connect(transport);

    // Get request body
    const body = await req.json();

    // Create a mock Express-like request/response for the SDK
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Handle the request using the transport
    const responseChunks: Uint8Array[] = [];
    let responseStatus = 200;
    let responseHeaders: Record<string, string> = { ...corsHeaders };

    const mockRes = {
      statusCode: 200,
      setHeader: (name: string, value: string) => {
        responseHeaders[name] = value;
      },
      writeHead: (status: number, headers?: Record<string, string>) => {
        responseStatus = status;
        if (headers) responseHeaders = { ...responseHeaders, ...headers };
        return mockRes;
      },
      write: (chunk: string | Buffer) => {
        const data =
          typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk;
        responseChunks.push(
          data instanceof Uint8Array ? data : new Uint8Array(data)
        );
        return true;
      },
      end: (chunk?: string | Buffer) => {
        if (chunk) {
          const data =
            typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk;
          responseChunks.push(
            data instanceof Uint8Array ? data : new Uint8Array(data)
          );
        }
      },
      on: () => mockRes,
      once: () => mockRes,
      emit: () => false,
      getHeader: (name: string) => responseHeaders[name],
      headersSent: false,
    };

    const mockReq = {
      method: req.method,
      headers,
      body,
      url: req.url,
      on: () => mockReq,
      once: () => mockReq,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await transport.handleRequest(mockReq as any, mockRes as any, body);

    // Combine response chunks
    const totalLength = responseChunks.reduce(
      (acc, chunk) => acc + chunk.length,
      0
    );
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of responseChunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    await transport.close();
    await server.close();

    return new Response(combined, {
      status: responseStatus,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("MCP error:", error);
    await server.close();
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
}

// POST handler - main MCP endpoint
export async function POST(req: NextRequest): Promise<Response> {
  return handleMcpRequest(req);
}

// GET handler - not allowed for stateless mode
export async function GET(): Promise<Response> {
  return new Response(
    JSON.stringify({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed. Use POST." },
      id: null,
    }),
    {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    }
  );
}

// DELETE handler - not allowed for stateless mode
export async function DELETE(): Promise<Response> {
  return new Response(
    JSON.stringify({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed." },
      id: null,
    }),
    {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    }
  );
}

// OPTIONS handler for CORS
export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders });
}
