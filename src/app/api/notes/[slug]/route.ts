import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncLinks } from "@/lib/links";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: note, error } = await supabase
    .from("notes")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  // Get backlinks (notes that link to this note)
  const { data: links } = await supabase
    .from("links")
    .select("source_slug")
    .eq("target_slug", slug);

  const backlinks = links?.map((link) => link.source_slug) || [];

  return NextResponse.json({ data: { ...note, backlinks } });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const supabase = await createClient();

  // Check if note exists
  const { data: existing, error: fetchError } = await supabase
    .from("notes")
    .select("*")
    .eq("slug", slug)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { title, content, tags, section, order } = body;
  const updates: Record<string, unknown> = {};

  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.content = content;
  if (tags !== undefined) updates.tags = tags;
  if (section !== undefined) updates.section = section;
  if (order !== undefined) updates.order = order;

  const { data: note, error: updateError } = await supabase
    .from("notes")
    .update(updates)
    .eq("slug", slug)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }

  // Re-sync links if content was updated
  if (content !== undefined) {
    try {
      await syncLinks(slug, content);
    } catch (err) {
      console.error("Failed to sync links:", err);
    }
  }

  return NextResponse.json({ data: note });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const supabase = await createClient();

  // Check if note exists
  const { data: existing, error: fetchError } = await supabase
    .from("notes")
    .select("slug, title")
    .eq("slug", slug)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  // Find all notes that link TO this note (backlinks)
  // The links table stores target_slug as either "slug" or "slug|display text"
  // So we need to match both patterns
  const { data: backlinksExact } = await supabase
    .from("links")
    .select("source_slug")
    .eq("target_slug", slug);

  const { data: backlinksWithDisplay } = await supabase
    .from("links")
    .select("source_slug")
    .like("target_slug", `${slug}|%`);

  // Combine and deduplicate backlinks
  const allBacklinks = [
    ...(backlinksExact || []),
    ...(backlinksWithDisplay || []),
  ];
  const uniqueSourceSlugs = Array.from(new Set(allBacklinks.map((b) => b.source_slug)));

  // Update each backlinking note to convert [[slug]] to plain text
  if (uniqueSourceSlugs.length > 0) {
    // Escape special regex characters in slug
    const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    for (const sourceSlug of uniqueSourceSlugs) {
      const { data: sourceNote } = await supabase
        .from("notes")
        .select("content")
        .eq("slug", sourceSlug)
        .single();

      if (sourceNote?.content) {
        // Replace [[slug]] or [[slug|display text]] with plain text
        // Use the display text if present, otherwise use the original title
        const updatedContent = sourceNote.content.replace(
          new RegExp(`\\[\\[${escapedSlug}(?:\\|([^\\]]+))?\\]\\]`, "g"),
          (_match: string, displayText: string) => displayText || existing.title
        );

        if (updatedContent !== sourceNote.content) {
          // Update the note's content
          const { error: updateError } = await supabase
            .from("notes")
            .update({ content: updatedContent })
            .eq("slug", sourceSlug);

          if (updateError) {
            console.error(`Failed to update note ${sourceSlug}:`, updateError);
            continue;
          }

          // Re-sync links for this note
          try {
            await syncLinks(sourceSlug, updatedContent);
          } catch (err) {
            console.error(`Failed to sync links for ${sourceSlug}:`, err);
          }
        }
      }
    }
  }

  // Delete the note (CASCADE will handle links FROM this note)
  const { error: deleteError } = await supabase
    .from("notes")
    .delete()
    .eq("slug", slug);

  if (deleteError) {
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Note deleted successfully" });
}
