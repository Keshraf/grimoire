import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { syncLinks } from "@/lib/links";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

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

  // Check if note exists
  const { data: existing, error: fetchError } = await supabase
    .from("notes")
    .select("slug")
    .eq("slug", slug)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

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
