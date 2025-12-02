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
    // Use button instead of anchor to completely avoid browser navigation behavior
    return `<button type="button" data-internal="true" data-title="${title}" class="internal-link">${text}</button>`;
  });
}

/**
 * Render markdown to HTML with wiki-link transformation
 * Converts to HTML using remark, then transforms [[links]]
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  // First process markdown to HTML
  const result = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(markdown);

  // Then transform wiki-links in the HTML output
  // This ensures data-internal attribute is preserved (not processed by remark)
  const html = String(result);
  return transformLinks(html);
}
