import { NextRequest, NextResponse } from "next/server";
import matter from "gray-matter";
import { createClient } from "@/lib/supabase/server";
import { generateSlug, syncLinks } from "@/lib/links";

interface ImportError {
  filename: string;
  error: string;
}

interface ImportResponse {
  imported: number;
  errors: ImportError[];
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ImportResponse>> {
  const errors: ImportError[] = [];
  let imported = 0;

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { imported: 0, errors: [{ filename: "", error: "No files provided" }] },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    for (const file of files) {
      // Skip non-markdown files
      if (!file.name.endsWith(".md")) {
        errors.push({ filename: file.name, error: "Not a markdown file" });
        continue;
      }

      try {
        const content = await file.text();
        const { data: frontmatter, content: body } = matter(content);

        // Extract title from frontmatter or filename
        const title = frontmatter.title || file.name.replace(/\.md$/, "");

        // Extract tags from frontmatter
        const tags: string[] = Array.isArray(frontmatter.tags)
          ? frontmatter.tags
          : [];

        // Generate slug
        const slug = generateSlug(title);

        if (!slug) {
          errors.push({
            filename: file.name,
            error: "Could not generate valid slug",
          });
          continue;
        }

        // Check for existing note with same slug
        const { data: existing } = await supabase
          .from("notes")
          .select("slug")
          .eq("slug", slug)
          .single();

        if (existing) {
          errors.push({
            filename: file.name,
            error: `Note with slug "${slug}" already exists`,
          });
          continue;
        }

        // Insert note
        const { error: insertError } = await supabase.from("notes").insert({
          title,
          content: body,
          slug,
          tags,
          section: frontmatter.section,
          order: frontmatter.order,
        });

        if (insertError) {
          errors.push({ filename: file.name, error: insertError.message });
          continue;
        }

        // Sync wikilinks
        try {
          await syncLinks(slug, body);
        } catch (linkError) {
          console.error(`Failed to sync links for ${slug}:`, linkError);
        }

        imported++;
      } catch (fileError) {
        errors.push({
          filename: file.name,
          error:
            fileError instanceof Error
              ? fileError.message
              : "Failed to process file",
        });
      }
    }

    return NextResponse.json({ imported, errors });
  } catch (error) {
    return NextResponse.json(
      {
        imported: 0,
        errors: [
          {
            filename: "",
            error: error instanceof Error ? error.message : "Import failed",
          },
        ],
      },
      { status: 500 }
    );
  }
}
