import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getConfig } from "@/lib/config";
import { aiSearch } from "@/lib/ai-search";
import type { SearchResult, AISearchResult } from "@/types";

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { query, includeAI } = body;

  if (!query || typeof query !== "string" || query.trim() === "") {
    return NextResponse.json(
      { error: "Query is required and must be a non-empty string" },
      { status: 400 }
    );
  }

  const searchQuery = query.trim();

  try {
    // Use Supabase full-text search
    const { data: notes, error } = await supabase
      .from("notes")
      .select("slug, title, content")
      .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
      .limit(20);

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json(
        { error: "Failed to search notes" },
        { status: 500 }
      );
    }

    // Transform to SearchResult format with excerpts and scores
    const results: SearchResult[] = (notes || []).map((note, index) => {
      // Generate excerpt around the match
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

      // Simple relevance scoring: title match > content match
      const titleMatch = note.title.toLowerCase().includes(lowerQuery);
      const score = titleMatch ? 1 - index * 0.01 : 0.5 - index * 0.01;

      return {
        slug: note.slug,
        title: note.title,
        excerpt,
        score,
      };
    });

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    // AI search integration
    let aiAnswer: AISearchResult | undefined = undefined;

    if (includeAI) {
      const config = getConfig();
      const aiEnabled = config.features.ai_search && config.search?.ai?.enabled;
      const apiKey = process.env.OPENAI_API_KEY;

      if (aiEnabled && apiKey && results.length > 0) {
        try {
          // Fetch full notes for AI context
          const slugs = results.slice(0, 5).map((r) => r.slug);
          const { data: fullNotes } = await supabase
            .from("notes")
            .select("*")
            .in("slug", slugs);

          if (fullNotes && fullNotes.length > 0) {
            const provider = config.search?.ai?.provider || "openai";
            aiAnswer = await aiSearch(searchQuery, fullNotes, {
              provider,
              apiKey,
            });
          }
        } catch (err) {
          console.error("AI search failed:", err);
          // Continue without AI answer
        }
      }
    }

    return NextResponse.json({ results, aiAnswer });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
