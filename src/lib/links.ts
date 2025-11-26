/**
 * Parse wikilinks from content using [[target-slug]] syntax
 * Returns unique array of target slugs
 */
export function parseWikilinks(content: string): string[] {
  if (!content) return [];

  const regex = /\[\[([^\]]+)\]\]/g;
  const matches: string[] = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    matches.push(match[1]);
  }

  // Return unique slugs
  return [...new Set(matches)];
}

/**
 * Generate URL-friendly slug from title
 * - Converts to lowercase
 * - Replaces spaces with hyphens
 * - Removes special characters
 * - Trims leading/trailing hyphens
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Synchronize wikilinks for a note
 * - Parses outlinks from content
 * - Deletes old links for this source
 * - Inserts new links
 */
export async function syncLinks(slug: string, content: string): Promise<void> {
  // Dynamic import to avoid loading supabase at module level (for testing)
  const { supabase } = await import("./supabase");

  const targets = parseWikilinks(content);

  // Delete existing links for this source
  const { error: deleteError } = await supabase
    .from("links")
    .delete()
    .eq("source_slug", slug);

  if (deleteError) {
    throw new Error(`Failed to delete old links: ${deleteError.message}`);
  }

  // Insert new links if any targets found
  if (targets.length > 0) {
    const linkRecords = targets.map((target) => ({
      source_slug: slug,
      target_slug: target,
    }));

    const { error: insertError } = await supabase
      .from("links")
      .insert(linkRecords);

    if (insertError) {
      throw new Error(`Failed to insert links: ${insertError.message}`);
    }
  }
}
