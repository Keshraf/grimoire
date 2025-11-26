import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

export interface ParsedLink {
  slug: string;
  display: string;
}

/**
 * Normalize a slug: lowercase and replace spaces with hyphens
 */
function normalizeSlug(slug: string): string {
  return slug.toLowerCase().trim().replace(/\s+/g, "-");
}

/**
 * Parse wiki-style links from markdown content
 * Finds [[slug]] and [[slug|display]] patterns
 */
export function parseLinks(markdown: string): ParsedLink[] {
  const linkPattern = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  const links: ParsedLink[] = [];
  let match;

  while ((match = linkPattern.exec(markdown)) !== null) {
    const rawSlug = match[1];
    const display = match[2] || rawSlug;
    links.push({
      slug: normalizeSlug(rawSlug),
      display: display.trim(),
    });
  }

  return links;
}

/**
 * Extract unique outgoing link slugs from markdown content
 */
export function extractOutlinks(markdown: string): string[] {
  const links = parseLinks(markdown);
  const uniqueSlugs = [...new Set(links.map((link) => link.slug))];
  return uniqueSlugs;
}

/**
 * Transform wiki-style links to clickable anchor tags
 * Replaces [[slug]] and [[slug|display]] with <a> tags
 */
export function transformLinks(markdown: string): string {
  const linkPattern = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

  return markdown.replace(linkPattern, (_, rawSlug, display) => {
    const slug = normalizeSlug(rawSlug);
    const text = display ? display.trim() : rawSlug.trim();
    return `<a href="/${slug}" data-internal="true" class="internal-link">${text}</a>`;
  });
}

/**
 * Render markdown to HTML with wiki-link transformation
 * Transforms [[links]] and converts to HTML using remark
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  // First transform wiki-style links
  const transformed = transformLinks(markdown);

  // Then process with remark
  const result = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(transformed);

  return String(result);
}
