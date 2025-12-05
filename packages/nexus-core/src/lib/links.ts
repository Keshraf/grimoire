/**
 * Parse wikilinks from content using [[title]] or [[title|display]] syntax
 * Returns unique array of target titles (extracts just the title part before |)
 */
export function parseWikilinks(content: string): string[] {
  if (!content) return [];

  // Match [[title]] or [[title|display text]]
  // Capture group 1 is the title (everything before | or end of brackets)
  const regex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  const matches: string[] = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    // Extract just the title part (before |), trim whitespace
    const title = match[1].trim();
    if (title) {
      matches.push(title);
    }
  }

  // Return unique titles
  return Array.from(new Set(matches));
}

/**
 * Synchronize wikilinks for a note
 * - Parses outlinks from content
 * - Deletes old links for this source
 * - Inserts new links
 *
 * @param noteTitle - The title of the source note
 * @param content - The markdown content of the note
 */
export async function syncLinks(noteTitle: string, content: string): Promise<void> {
  // Dynamic import to avoid loading supabase at module level (for testing)
  const { createClient } = await import("./supabase/server");
  const supabase = await createClient();

  const targetTitles = parseWikilinks(content);

  // Delete existing links for this source
  const { error: deleteError } = await supabase
    .from("links")
    .delete()
    .eq("source_title", noteTitle);

  if (deleteError) {
    throw new Error(`Failed to delete old links: ${deleteError.message}`);
  }

  // Insert new links if any targets found
  if (targetTitles.length > 0) {
    const linkRecords = targetTitles.map((targetTitle) => ({
      source_title: noteTitle,
      target_title: targetTitle,
    }));

    const { error: insertError } = await supabase
      .from("links")
      .insert(linkRecords);

    if (insertError) {
      throw new Error(`Failed to insert links: ${insertError.message}`);
    }
  }
}
