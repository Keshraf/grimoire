import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@nexus/core/lib/supabase/server";
import { syncLinks } from "@nexus/core/lib/links";

interface RouteParams {
  params: Promise<{ title: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { title: encodedTitle } = await params;
  const title = decodeURIComponent(encodedTitle);
  const supabase = await createClient();

  const { data: note, error } = await supabase
    .from("notes")
    .select("*")
    .eq("title", title)
    .single();

  if (error || !note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  // Get backlinks (notes that link to this note)
  const { data: links } = await supabase
    .from("links")
    .select("source_title")
    .eq("target_title", title);

  const backlinks = links?.map((link) => link.source_title) || [];

  return NextResponse.json({ data: { ...note, backlinks } });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { title: encodedTitle } = await params;
  const title = decodeURIComponent(encodedTitle);
  const supabase = await createClient();

  // Check if note exists
  const { data: existing, error: fetchError } = await supabase
    .from("notes")
    .select("*")
    .eq("title", title)
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

  const { title: newTitle, content, tags, section, order } = body;
  const updates: Record<string, unknown> = {};

  // Handle title change
  if (newTitle !== undefined && newTitle !== title) {
    // Check if new title already exists
    const { data: titleExists } = await supabase
      .from("notes")
      .select("id")
      .eq("title", newTitle)
      .single();

    if (titleExists) {
      return NextResponse.json(
        { error: "A note with this title already exists" },
        { status: 409 }
      );
    }

    updates.title = newTitle;

    // Update all links that reference this note
    await supabase
      .from("links")
      .update({ source_title: newTitle })
      .eq("source_title", title);

    await supabase
      .from("links")
      .update({ target_title: newTitle })
      .eq("target_title", title);

    // Update content in other notes that link to this one
    const { data: backlinks } = await supabase
      .from("links")
      .select("source_title")
      .eq("target_title", title);

    if (backlinks && backlinks.length > 0) {
      const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      for (const link of backlinks) {
        const { data: sourceNote } = await supabase
          .from("notes")
          .select("content")
          .eq("title", link.source_title)
          .single();

        if (sourceNote?.content) {
          // Replace [[old title]] with [[new title]]
          const updatedContent = sourceNote.content.replace(
            new RegExp(`\\[\\[${escapedTitle}(\\|[^\\]]+)?\\]\\]`, "g"),
            (match: string, displayPart: string) => `[[${newTitle}${displayPart || ""}]]`
          );

          if (updatedContent !== sourceNote.content) {
            await supabase
              .from("notes")
              .update({ content: updatedContent })
              .eq("title", link.source_title);
          }
        }
      }
    }
  }

  if (content !== undefined) updates.content = content;
  if (tags !== undefined) updates.tags = tags;
  if (section !== undefined) updates.section = section;
  if (order !== undefined) updates.order = order;

  const { data: note, error: updateError } = await supabase
    .from("notes")
    .update(updates)
    .eq("title", title)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }

  // Re-sync links if content was updated
  const noteTitle = newTitle || title;
  if (content !== undefined) {
    try {
      await syncLinks(noteTitle, content);
    } catch (err) {
      console.error("Failed to sync links:", err);
    }
  }

  return NextResponse.json({ data: note });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { title: encodedTitle } = await params;
  const title = decodeURIComponent(encodedTitle);
  const supabase = await createClient();

  // Check if note exists
  const { data: existing, error: fetchError } = await supabase
    .from("notes")
    .select("id, title")
    .eq("title", title)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  // Find all notes that link TO this note (backlinks)
  const { data: backlinks } = await supabase
    .from("links")
    .select("source_title")
    .eq("target_title", title);

  // Update each backlinking note to convert [[title]] to plain text
  if (backlinks && backlinks.length > 0) {
    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const uniqueSourceTitles = Array.from(new Set(backlinks.map((b) => b.source_title)));

    for (const sourceTitle of uniqueSourceTitles) {
      const { data: sourceNote } = await supabase
        .from("notes")
        .select("content")
        .eq("title", sourceTitle)
        .single();

      if (sourceNote?.content) {
        // Replace [[title]] or [[title|display text]] with plain text
        // Use the display text if present, otherwise use the title
        const updatedContent = sourceNote.content.replace(
          new RegExp(`\\[\\[${escapedTitle}(?:\\|([^\\]]+))?\\]\\]`, "g"),
          (_match: string, displayText: string) => displayText || title
        );

        if (updatedContent !== sourceNote.content) {
          // Update the note's content
          const { error: updateError } = await supabase
            .from("notes")
            .update({ content: updatedContent })
            .eq("title", sourceTitle);

          if (updateError) {
            console.error(`Failed to update note ${sourceTitle}:`, updateError);
            continue;
          }

          // Re-sync links for this note
          try {
            await syncLinks(sourceTitle, updatedContent);
          } catch (err) {
            console.error(`Failed to sync links for ${sourceTitle}:`, err);
          }
        }
      }
    }
  }

  // Delete the note
  const { error: deleteError } = await supabase
    .from("notes")
    .delete()
    .eq("title", title);

  if (deleteError) {
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Note deleted successfully" });
}
