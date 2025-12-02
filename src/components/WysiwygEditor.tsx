"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Node, mergeAttributes } from "@tiptap/core";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import type { Note } from "@/types";
import { LinkAutocomplete } from "./LinkAutocomplete";

// Flexible theme config that works with full NexusConfig or minimal config
interface EditorConfig {
  theme: {
    colors?: {
      text?: string;
      background?: string;
      primary?: string;
      accent?: string;
    };
    fonts?: {
      body?: string;
      heading?: string;
    };
  };
}

// Custom WikiLink node for rendering [[links]]
const WikiLink = Node.create({
  name: "wikiLink",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      title: {
        default: null,
      },
      display: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'button[data-internal="true"]',
        getAttrs: (node) => {
          const element = node as HTMLElement;
          const title = element.getAttribute("data-title");
          return {
            title,
            display: element.textContent,
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    return [
      "button",
      mergeAttributes({
        type: "button",
        "data-internal": "true",
        "data-title": node.attrs.title,
        class: "internal-link text-purple-400 hover:text-purple-300 cursor-pointer",
      }),
      node.attrs.display || node.attrs.title,
    ];
  },
});

interface AutocompleteState {
  isOpen: boolean;
  query: string;
  position: { top: number; left: number };
  range: { from: number; to: number } | null;
}

export interface WysiwygEditorRef {
  getMarkdown: () => string;
  setContent: (markdown: string) => void;
}

interface WysiwygEditorProps {
  content: string;
  config: EditorConfig;
  notes: Note[];
  onSave: (content: string) => void;
  onLinkClick: (title: string) => void;
  onCreateNote?: (title: string) => void;
  autoFocus?: boolean;
}

// Convert markdown to HTML for TipTap
function markdownToHtml(markdown: string): string {
  // Transform wikilinks to button elements (not anchors - avoids all browser navigation)
  const withLinks = markdown.replace(
    /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
    (_, rawTitle, display) => {
      const title = rawTitle.trim();
      const text = display ? display.trim() : title;
      return `<button type="button" data-internal="true" data-title="${title}">${text}</button>`;
    }
  );

  // Basic markdown to HTML conversions
  let html = withLinks
    // Headers
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Bold and Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/___(.+?)___/g, "<strong><em>$1</em></strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    // Strikethrough
    .replace(/~~(.+?)~~/g, "<s>$1</s>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Horizontal rules
    .replace(/^---$/gm, "<hr>")
    .replace(/^\*\*\*$/gm, "<hr>")
    // Blockquotes
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    // Unordered lists
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^\* (.+)$/gm, "<li>$1</li>")
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Paragraphs - wrap remaining lines
    .split("\n")
    .map((line) => {
      if (
        line.startsWith("<h") ||
        line.startsWith("<li") ||
        line.startsWith("<blockquote") ||
        line.startsWith("<hr") ||
        line.trim() === ""
      ) {
        return line;
      }
      return `<p>${line}</p>`;
    })
    .join("\n");

  // Wrap consecutive <li> elements in <ul>
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

  return html;
}

// Convert TipTap HTML back to markdown
function htmlToMarkdown(editor: Editor): string {
  const json = editor.getJSON();
  return jsonToMarkdown(json);
}

function jsonToMarkdown(doc: Record<string, unknown>): string {
  if (!doc.content) return "";

  const content = doc.content as Array<Record<string, unknown>>;
  const lines: string[] = [];

  for (const node of content) {
    lines.push(nodeToMarkdown(node));
  }

  return lines.join("\n\n");
}

function nodeToMarkdown(node: Record<string, unknown>): string {
  const type = node.type as string;
  const content = node.content as Array<Record<string, unknown>> | undefined;
  const attrs = node.attrs as Record<string, unknown> | undefined;

  switch (type) {
    case "paragraph":
      return content ? inlineToMarkdown(content) : "";

    case "heading": {
      const level = (attrs?.level as number) || 1;
      const prefix = "#".repeat(level);
      const text = content ? inlineToMarkdown(content) : "";
      return `${prefix} ${text}`;
    }

    case "bulletList": {
      const items = content || [];
      return items.map((item) => nodeToMarkdown(item)).join("\n");
    }

    case "orderedList": {
      const items = content || [];
      return items
        .map((item, i) => {
          const itemContent = (item.content as Array<Record<string, unknown>>)?.[0];
          const text = itemContent?.content ? inlineToMarkdown(itemContent.content as Array<Record<string, unknown>>) : "";
          return `${i + 1}. ${text}`;
        })
        .join("\n");
    }

    case "listItem": {
      const itemContent = content?.[0];
      const text = itemContent?.content ? inlineToMarkdown(itemContent.content as Array<Record<string, unknown>>) : "";
      return `- ${text}`;
    }

    case "blockquote": {
      const quoteContent = content?.[0];
      const text = quoteContent?.content ? inlineToMarkdown(quoteContent.content as Array<Record<string, unknown>>) : "";
      return `> ${text}`;
    }

    case "codeBlock": {
      const code = content?.[0]?.text || "";
      const lang = (attrs?.language as string) || "";
      return `\`\`\`${lang}\n${code}\n\`\`\``;
    }

    case "horizontalRule":
      return "---";

    default:
      return content ? inlineToMarkdown(content) : "";
  }
}

function inlineToMarkdown(nodes: Array<Record<string, unknown>>): string {
  return nodes
    .map((node) => {
      const type = node.type as string;
      const text = node.text as string | undefined;
      const marks = node.marks as Array<{ type: string }> | undefined;
      const attrs = node.attrs as Record<string, unknown> | undefined;

      if (type === "wikiLink") {
        const title = attrs?.title as string;
        const display = attrs?.display as string;
        if (display && display !== title) {
          return `[[${title}|${display}]]`;
        }
        return `[[${title}]]`;
      }

      if (type === "text" && text) {
        let result = text;

        if (marks) {
          for (const mark of marks) {
            switch (mark.type) {
              case "bold":
                result = `**${result}**`;
                break;
              case "italic":
                result = `*${result}*`;
                break;
              case "strike":
                result = `~~${result}~~`;
                break;
              case "code":
                result = `\`${result}\``;
                break;
              case "link": {
                const href = (mark as unknown as { attrs: { href: string } }).attrs?.href;
                if (href) {
                  result = `[${result}](${href})`;
                }
                break;
              }
            }
          }
        }

        return result;
      }

      if (type === "hardBreak") {
        return "\n";
      }

      return "";
    })
    .join("");
}

export const WysiwygEditor = forwardRef<WysiwygEditorRef, WysiwygEditorProps>(
  function WysiwygEditor(
    { content, config, notes, onSave, onLinkClick, onCreateNote, autoFocus = false },
    ref
  ) {
    const [autocomplete, setAutocomplete] = useState<AutocompleteState>({
      isOpen: false,
      query: "",
      position: { top: 0, left: 0 },
      range: null,
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSavedContentRef = useRef(content);

    const editor = useEditor({
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "text-purple-400 hover:text-purple-300 underline",
          },
        }),
        Placeholder.configure({
          placeholder: "Write your note...",
        }),
        WikiLink,
      ],
      content: markdownToHtml(content),
      editorProps: {
        attributes: {
          class: "prose prose-invert max-w-none focus:outline-none min-h-[200px] px-6 py-4",
          style: `color: ${config.theme.colors?.text || "#e8e6e3"}; font-family: ${config.theme.fonts?.body || "Inter, sans-serif"};`,
        },
        // Handle clicks on internal link buttons
        handleDOMEvents: {
          click: (view, event) => {
            const target = event.target as HTMLElement;
            const button = target.closest('button[data-internal="true"]');

            if (button) {
              event.preventDefault();
              const title = button.getAttribute("data-title");
              if (title) {
                onLinkClick(title);
              }
              return true;
            }
            return false;
          },
        },
      },
      onUpdate: ({ editor }) => {
        // Check for [[ trigger
        detectWikiLinkTrigger(editor);

        // Schedule auto-save
        const markdown = htmlToMarkdown(editor);
        if (markdown !== lastSavedContentRef.current) {
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }
          saveTimeoutRef.current = setTimeout(() => {
            onSave(markdown);
            lastSavedContentRef.current = markdown;
          }, 1000);
        }
      },
    });

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getMarkdown: () => (editor ? htmlToMarkdown(editor) : content),
      setContent: (markdown: string) => {
        if (editor) {
          editor.commands.setContent(markdownToHtml(markdown));
          lastSavedContentRef.current = markdown;
        }
      },
    }));

    // Update editor content when prop changes
    useEffect(() => {
      if (editor && content !== lastSavedContentRef.current) {
        const currentMarkdown = htmlToMarkdown(editor);
        if (currentMarkdown !== content) {
          editor.commands.setContent(markdownToHtml(content));
          lastSavedContentRef.current = content;
        }
      }
    }, [content, editor]);

    // Auto-focus
    useEffect(() => {
      if (autoFocus && editor) {
        setTimeout(() => {
          editor.commands.focus("end");
        }, 100);
      }
    }, [autoFocus, editor]);

    // Cleanup
    useEffect(() => {
      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }, []);

    // Detect [[ trigger for wikilinks
    const detectWikiLinkTrigger = useCallback(
      (ed: Editor) => {
        const { selection } = ed.state;
        const { $from } = selection;

        // Get text before cursor on current line
        const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
        const match = textBefore.match(/\[\[([^\]|\[]*)$/);

        if (match) {
          const query = match[1];
          const triggerPos = $from.pos - query.length - 2;

          // Get cursor position for popup
          const coords = ed.view.coordsAtPos($from.pos);
          const containerRect = containerRef.current?.getBoundingClientRect();

          setAutocomplete({
            isOpen: true,
            query,
            position: {
              top: coords.bottom + 5,
              left: coords.left,
            },
            range: {
              from: triggerPos,
              to: $from.pos,
            },
          });
        } else if (autocomplete.isOpen) {
          setAutocomplete((prev) => ({ ...prev, isOpen: false }));
        }
      },
      [autocomplete.isOpen]
    );

    // Insert wikilink
    const insertLink = useCallback(
      (title: string) => {
        if (!editor || !autocomplete.range) return;

        const { from, to } = autocomplete.range;

        // Delete the trigger text and query
        editor
          .chain()
          .focus()
          .deleteRange({ from, to })
          .insertContent({
            type: "wikiLink",
            attrs: { title, display: title },
          })
          .run();

        setAutocomplete((prev) => ({ ...prev, isOpen: false }));
      },
      [editor, autocomplete.range]
    );

    // Handle create new note
    const handleCreateNew = useCallback(
      (title: string) => {
        insertLink(title);
        onCreateNote?.(title);
      },
      [insertLink, onCreateNote]
    );

    const closeAutocomplete = useCallback(() => {
      setAutocomplete((prev) => ({ ...prev, isOpen: false }));
    }, []);

    // Handle escape to close autocomplete
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && autocomplete.isOpen) {
          e.preventDefault();
          closeAutocomplete();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [autocomplete.isOpen, closeAutocomplete]);

    return (
      <div ref={containerRef} className="relative h-full">
        <EditorContent
          editor={editor}
          className="h-full"
        />

        {autocomplete.isOpen && (
          <LinkAutocomplete
            query={autocomplete.query}
            notes={notes}
            position={autocomplete.position}
            onSelect={insertLink}
            onClose={closeAutocomplete}
            onCreateNew={onCreateNote ? handleCreateNew : undefined}
          />
        )}
      </div>
    );
  }
);
