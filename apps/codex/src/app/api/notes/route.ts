import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@nexus/core/lib/supabase/server";
import { syncLinks } from "@nexus/core/lib/links";

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
    tags = [],
    section,
    order,
  } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // Check for title conflict (title must be unique)
  const { data: existing } = await supabase
    .from("notes")
    .select("id")
    .eq("title", title)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "A note with this title already exists" },
      { status: 409 }
    );
  }

  // Insert the note
  const { data: note, error: insertError } = await supabase
    .from("notes")
    .insert({ title, content, tags, section, order })
    .select()
    .single();

  if (insertError) {
    console.error("Insert error:", insertError);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }

  // Sync wikilinks (use title as the identifier)
  try {
    await syncLinks(title, content);
  } catch (err) {
    console.error("Failed to sync links:", err);
  }

  return NextResponse.json({ data: note }, { status: 201 });
}
