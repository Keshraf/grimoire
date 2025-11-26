import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSlug, syncLinks } from "@/lib/links";

export async function GET() {
  const supabase = await createClient();

  const { data: notes, error } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: notes });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    title,
    content = "",
    slug: providedSlug,
    tags = [],
    section,
    order,
  } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const slug = providedSlug || generateSlug(title);

  // Check for slug conflict
  const { data: existing } = await supabase
    .from("notes")
    .select("slug")
    .eq("slug", slug)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "A note with this slug already exists" },
      { status: 409 }
    );
  }

  // Insert the note
  const { data: note, error: insertError } = await supabase
    .from("notes")
    .insert({ title, content, slug, tags, section, order })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }

  // Sync wikilinks
  try {
    await syncLinks(slug, content);
  } catch (err) {
    console.error("Failed to sync links:", err);
  }

  return NextResponse.json({ data: note }, { status: 201 });
}
