import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { createClient } from "@/lib/supabase/server";
import type { Note, Link } from "@/types";

function generateFrontmatter(note: Note, backlinks?: string[]): string {
  const lines = ["---"];
  lines.push(`title: "${note.title.replace(/"/g, '\\"')}"`);

  if (note.tags && note.tags.length > 0) {
    lines.push("tags:");
    note.tags.forEach((tag) => lines.push(`  - ${tag}`));
  }

  lines.push(`created_at: ${note.created_at}`);
  lines.push(`updated_at: ${note.updated_at}`);

  if (backlinks && backlinks.length > 0) {
    lines.push("backlinks:");
    backlinks.forEach((link) => lines.push(`  - ${link}`));
  }

  lines.push("---");
  return lines.join("\n");
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const includeBacklinks = searchParams.get("includeBacklinks") === "true";

    // Fetch all notes
    const { data: notes, error: notesError } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (notesError) {
      return NextResponse.json(
        { error: "Failed to fetch notes" },
        { status: 500 }
      );
    }

    if (!notes || notes.length === 0) {
      // Return empty zip
      const zip = new JSZip();
      const content = await zip.generateAsync({ type: "arraybuffer" });
      return new Response(content, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": 'attachment; filename="nexus-export.zip"',
        },
      });
    }

    // Fetch backlinks if requested
    let backlinkMap: Map<string, string[]> = new Map();
    if (includeBacklinks) {
      const { data: links } = (await supabase.from("links").select("*")) as {
        data: Link[] | null;
      };

      if (links) {
        links.forEach((link) => {
          const existing = backlinkMap.get(link.target_slug) || [];
          existing.push(link.source_slug);
          backlinkMap.set(link.target_slug, existing);
        });
      }
    }

    // Create zip
    const zip = new JSZip();

    for (const note of notes as Note[]) {
      const backlinks = includeBacklinks
        ? backlinkMap.get(note.slug)
        : undefined;
      const frontmatter = generateFrontmatter(note, backlinks);
      const fileContent = `${frontmatter}\n\n${note.content}`;
      zip.file(`${note.slug}.md`, fileContent);
    }

    const content = await zip.generateAsync({ type: "arraybuffer" });

    return new Response(content, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="nexus-export.zip"',
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Export failed" },
      { status: 500 }
    );
  }
}
