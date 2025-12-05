import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getConfig } from "@/lib/config";
import { aiSearch } from "@/lib/ai-search";
import { parseWikilinks } from "@/lib/links";
import { getLocalGraph } from "@/lib/graph";
import type {
  MCPManifest,
  MCPToolRequest,
  MCPResponse,
  ListPagesResult,
  GetPageResult,
  SearchToolResult,
  AskToolResult,
  GetConnectionsResult,
  Note,
} from "@/types";

// MCP Manifest with tool definitions
const manifest: MCPManifest = {
  name: "nexus-mcp",
  version: "1.0.0",
  description: "MCP server for NEXUS knowledge base",
  tools: [
    {
      name: "list_pages",
      description: "List all pages in the knowledge base with their titles",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
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
  ],
};

// GET handler - returns MCP manifest
export async function GET(): Promise<NextResponse<MCPManifest>> {
  return NextResponse.json(manifest);
}

// Tool handlers
async function handleListPages(): Promise<ListPagesResult> {
  const supabase = await createClient();
  const { data: notes, error } = await supabase
    .from("notes")
    .select("title")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to fetch pages");
  }

  return { pages: notes || [] };
}

async function handleGetPage(input: { title: string }): Promise<GetPageResult> {
  const { title } = input;
  const supabase = await createClient();

  // Fetch the note
  const { data: note, error } = await supabase
    .from("notes")
    .select("*")
    .eq("title", title)
    .single();

  if (error || !note) {
    throw { status: 404, message: `Page '${title}' not found` };
  }

  // Extract outlinks from content
  const outlinks = parseWikilinks(note.content);

  // Fetch backlinks
  const { data: links } = await supabase
    .from("links")
    .select("source_title")
    .eq("target_title", title);

  const backlinks = links?.map((l) => l.source_title) || [];

  return {
    title: note.title,
    content: note.content,
    outlinks,
    backlinks,
  };
}

async function handleSearch(input: {
  query: string;
}): Promise<SearchToolResult> {
  const { query } = input;
  const searchQuery = query.trim();
  const supabase = await createClient();

  const { data: notes, error } = await supabase
    .from("notes")
    .select("title, content")
    .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
    .limit(20);

  if (error) {
    throw new Error("Failed to search pages");
  }

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

  return { results };
}

async function handleAsk(input: { question: string }): Promise<AskToolResult> {
  const { question } = input;
  const config = getConfig();
  const aiEnabled = config.features.ai_search && config.search?.ai?.enabled;
  const provider = config.search?.ai?.provider || "openai";

  // Get the appropriate API key based on provider
  const apiKey =
    provider === "gemini"
      ? process.env.GEMINI_API_KEY
      : provider === "anthropic"
      ? process.env.ANTHROPIC_API_KEY
      : process.env.OPENAI_API_KEY;

  if (!aiEnabled || !apiKey) {
    throw { status: 503, message: "AI search is not available" };
  }

  const supabase = await createClient();

  // Search for relevant notes - extract keywords from question
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

  // Build OR conditions for each keyword
  const searchTerms = keywords.length > 0 ? keywords : [question];
  const orConditions = searchTerms
    .map((term) => `title.ilike.%${term}%,content.ilike.%${term}%`)
    .join(",");

  const { data: notes, error } = await supabase
    .from("notes")
    .select("*")
    .or(orConditions)
    .limit(5);

  if (error) {
    throw new Error("Failed to search for relevant pages");
  }

  if (!notes || notes.length === 0) {
    return {
      answer: "No relevant information found in the knowledge base.",
      sources: [],
    };
  }

  const result = await aiSearch(question, notes as Note[], {
    provider,
    apiKey,
  });

  return {
    answer: result.answer,
    sources: result.sources.map((s) => ({ title: s.title })),
  };
}

async function handleGetConnections(input: {
  title: string;
}): Promise<GetConnectionsResult> {
  const { title } = input;
  const supabase = await createClient();

  // Verify note exists
  const { data: note, error } = await supabase
    .from("notes")
    .select("*")
    .eq("title", title)
    .single();

  if (error || !note) {
    throw { status: 404, message: `Page '${title}' not found` };
  }

  // Extract outlinks
  const outlinks = parseWikilinks(note.content);

  // Fetch backlinks
  const { data: links } = await supabase
    .from("links")
    .select("source_title")
    .eq("target_title", title);

  const backlinks = links?.map((l) => l.source_title) || [];

  // Get all notes for local graph
  const { data: allNotes } = await supabase.from("notes").select("*");
  const localGraph = getLocalGraph(title, (allNotes as Note[]) || []);

  return {
    title,
    outlinks,
    backlinks,
    localGraph: {
      nodes: localGraph.nodes,
      edges: localGraph.edges,
    },
  };
}

// POST handler - invokes tools
export async function POST(
  request: NextRequest
): Promise<NextResponse<MCPResponse>> {
  let body: MCPToolRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.tool || typeof body.tool !== "string") {
    return NextResponse.json(
      { error: "Missing 'tool' field" },
      { status: 400 }
    );
  }

  const toolName = body.tool;
  const input = body.input || {};

  try {
    switch (toolName) {
      case "list_pages": {
        const result = await handleListPages();
        return NextResponse.json({ result });
      }

      case "get_page": {
        if (!input.title || typeof input.title !== "string") {
          return NextResponse.json(
            { error: "Missing required parameter: title" },
            { status: 400 }
          );
        }
        const result = await handleGetPage({ title: input.title as string });
        return NextResponse.json({ result });
      }

      case "search": {
        if (!input.query || typeof input.query !== "string") {
          return NextResponse.json(
            { error: "Missing required parameter: query" },
            { status: 400 }
          );
        }
        const result = await handleSearch({ query: input.query as string });
        return NextResponse.json({ result });
      }

      case "ask": {
        if (!input.question || typeof input.question !== "string") {
          return NextResponse.json(
            { error: "Missing required parameter: question" },
            { status: 400 }
          );
        }
        const result = await handleAsk({ question: input.question as string });
        return NextResponse.json({ result });
      }

      case "get_connections": {
        if (!input.title || typeof input.title !== "string") {
          return NextResponse.json(
            { error: "Missing required parameter: title" },
            { status: 400 }
          );
        }
        const result = await handleGetConnections({
          title: input.title as string,
        });
        return NextResponse.json({ result });
      }

      default:
        return NextResponse.json(
          { error: `Unknown tool: ${toolName}` },
          { status: 400 }
        );
    }
  } catch (err: unknown) {
    if (err && typeof err === "object" && "status" in err && "message" in err) {
      const typedErr = err as { status: number; message: string };
      return NextResponse.json(
        { error: typedErr.message },
        { status: typedErr.status }
      );
    }
    console.error("MCP tool error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
