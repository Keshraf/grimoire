import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "../route";
import { NextRequest } from "next/server";

// Mock dependencies
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [
            { slug: "note-1", title: "Note 1" },
            { slug: "note-2", title: "Note 2" },
          ],
          error: null,
        })),
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              slug: "note-1",
              title: "Note 1",
              content: "Content with [[note-2]] link",
            },
            error: null,
          })),
        })),
        or: vi.fn(() => ({
          limit: vi.fn(() => ({
            data: [
              { slug: "note-1", title: "Note 1", content: "Test content" },
            ],
            error: null,
          })),
        })),
      })),
    })),
  },
}));

vi.mock("@/lib/config", () => ({
  getConfig: vi.fn(() => ({
    features: { ai_search: false },
    search: { ai: { enabled: false } },
  })),
}));

vi.mock("@/lib/ai-search", () => ({
  aiSearch: vi.fn(),
}));

vi.mock("@/lib/links", () => ({
  parseWikilinks: vi.fn((content: string) => {
    const matches = content.match(/\[\[([^\]]+)\]\]/g) || [];
    return matches.map((m) => m.slice(2, -2));
  }),
}));

vi.mock("@/lib/graph", () => ({
  getLocalGraph: vi.fn(() => ({
    nodes: [{ id: "note-1", title: "Note 1", connections: 1 }],
    edges: [{ source: "note-1", target: "note-2" }],
  })),
}));

function createRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/mcp", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("MCP API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/mcp (manifest)", () => {
    it("returns manifest with correct structure", async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe("nexus-mcp");
      expect(data.version).toBe("1.0.0");
      expect(data.tools).toBeInstanceOf(Array);
    });

    it("includes all 5 tools in manifest", async () => {
      const response = await GET();
      const data = await response.json();

      const toolNames = data.tools.map((t: { name: string }) => t.name);
      expect(toolNames).toContain("list_pages");
      expect(toolNames).toContain("get_page");
      expect(toolNames).toContain("search");
      expect(toolNames).toContain("ask");
      expect(toolNames).toContain("get_connections");
    });

    it("each tool has required schema fields", async () => {
      const response = await GET();
      const data = await response.json();

      for (const tool of data.tools) {
        expect(tool).toHaveProperty("name");
        expect(tool).toHaveProperty("description");
        expect(tool).toHaveProperty("inputSchema");
        expect(tool.inputSchema).toHaveProperty("type", "object");
        expect(tool.inputSchema).toHaveProperty("properties");
        expect(tool.inputSchema).toHaveProperty("required");
      }
    });
  });

  describe("POST /api/mcp (tool invocation)", () => {
    describe("error handling", () => {
      it("returns 400 for invalid JSON", async () => {
        const request = new NextRequest("http://localhost/api/mcp", {
          method: "POST",
          body: "invalid json",
          headers: { "Content-Type": "application/json" },
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe("Invalid JSON body");
      });

      it("returns 400 for missing tool field", async () => {
        const request = createRequest({ input: {} });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe("Missing 'tool' field");
      });

      it("returns 400 for unknown tool", async () => {
        const request = createRequest({ tool: "unknown_tool", input: {} });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain("Unknown tool");
      });

      it("returns 400 for missing required parameter", async () => {
        const request = createRequest({ tool: "get_page", input: {} });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain("Missing required parameter");
      });
    });

    describe("list_pages tool", () => {
      it("returns list of pages", async () => {
        const request = createRequest({ tool: "list_pages", input: {} });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.result).toHaveProperty("pages");
        expect(data.result.pages).toBeInstanceOf(Array);
      });
    });

    describe("search tool", () => {
      it("returns search results", async () => {
        const request = createRequest({
          tool: "search",
          input: { query: "test" },
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.result).toHaveProperty("results");
        expect(data.result.results).toBeInstanceOf(Array);
      });

      it("returns 400 for missing query", async () => {
        const request = createRequest({ tool: "search", input: {} });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain("Missing required parameter: query");
      });
    });

    describe("ask tool", () => {
      it("returns 503 when AI search is not available", async () => {
        const request = createRequest({
          tool: "ask",
          input: { question: "What is this about?" },
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(503);
        expect(data.error).toBe("AI search is not available");
      });
    });
  });
});
