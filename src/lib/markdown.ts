import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

export interface ParsedLink {
  title: string;
  display: string;
}

/**
 * Parse wiki-style links from markdown content
 * Finds [[title]] and [[title|display]] patterns
 */
export function parseLinks(markdown: string): ParsedLink[] {
  const linkPattern = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  const links: ParsedLink[] = [];
  let match;

  while ((match = linkPattern.exec(markdown)) !== null) {
    const title = match[1].trim();
    const display = match[2] ? match[2].trim() : title;
    links.push({
      title,
      display,
    });
  }

  return links;
}

/**
 * Extract unique outgoing link titles from markdown content
 */
export function extractOutlinks(markdown: string): string[] {
  const links = parseLinks(markdown);
  const uniqueTitles = Array.from(new Set(links.map((link) => link.title)));
  return uniqueTitles;
}

/**
 * Transform wiki-style links to clickable anchor tags
 * Replaces [[title]] and [[title|display]] with <a> tags
 */
export function transformLinks(markdown: string): string {
  const linkPattern = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

  return markdown.replace(linkPattern, (_, rawTitle, display) => {
    const title = rawTitle.trim();
    const text = display ? display.trim() : title;
    return `<a href="/${encodeURIComponent(title)}" data-internal="true" class="internal-link">${text}</a>`;
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
