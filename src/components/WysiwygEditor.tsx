"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Markdown } from "tiptap-markdown";
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

/**
 * Theme configuration for the WYSIWYG editor.
 * Supports both full NexusConfig and minimal configuration objects.
 */
interface EditorConfig {
  /** Theme settings for colors and fonts */
  theme: {
    /** Color palette for the editor */
    colors?: {
      /** Text color (default: #e8e6e3) */
      text?: string;
      /** Background color */
      background?: string;
      /** Primary accent color */
      primary?: string;
      /** Secondary accent color */
      accent?: string;
    };
    /** Font family settings */
    fonts?: {
      /** Body text font (default: Inter, sans-serif) */
      body?: string;
      /** Heading font */
      heading?: string;
    };
  };
}

/**
 * Custom TipTap node for rendering wikilinks in `[[Title]]` or `[[Title|Display]]` format.
 * Renders as clickable buttons to avoid browser navigation behavior.
 *
 * @remarks
 * - Supports both simple `[[Title]]` and aliased `[[Title|Display Text]]` formats
 * - Renders as `<button>` elements with `data-internal="true"` to enable click handling
 * - Integrates with tiptap-markdown for bidirectional markdown conversion:
 *   - Parsing: Handled by `processWikilinksForEditor()` which converts `[[...]]` to buttons
 *   - Serialization: The `addStorage().markdown.serialize()` method converts back to `[[...]]`
 * - Atomic node (cannot be partially selected or edited inline)
 */
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
        class:
          "internal-link text-purple-400 hover:text-purple-300 cursor-pointer",
      }),
      node.attrs.display || node.attrs.title,
    ];
  },

  /**
   * Provides markdown serialization support for the tiptap-markdown extension.
   * Converts WikiLink nodes back to `[[Title]]` or `[[Title|Display]]` syntax when
   * exporting editor content as markdown.
   *
   * @returns Storage object with markdown serialization configuration
   */
  addStorage() {
    return {
      markdown: {
        /**
         * Serializes a WikiLink node to markdown wikilink syntax.
         * @param state - Markdown serializer state with write method
         * @param node - The WikiLink node being serialized
         */
        serialize(
          state: { write: (text: string) => void },
          node: { attrs: { title: string; display?: string } }
        ) {
          const { title, display } = node.attrs;
          // If display text differs from title, use [[title|display]] format
          if (display && display !== title) {
            state.write(`[[${title}|${display}]]`);
          } else {
            state.write(`[[${title}]]`);
          }
        },
        parse: {
          // Parsing is handled by processWikilinksForEditor() before content reaches TipTap
        },
      },
    };
  },
});

/**
 * Internal state for the wikilink autocomplete popup.
 */
interface AutocompleteState {
  /** Whether the autocomplete dropdown is visible */
  isOpen: boolean;
  /** Current search query (text after `[[`) */
  query: string;
  /** Absolute position for the popup */
  position: { top: number; left: number };
  /** Text range to replace when a link is selected */
  range: { from: number; to: number } | null;
}

/**
 * Ref handle exposed by WysiwygEditor for imperative operations.
 */
export interface WysiwygEditorRef {
  /** Returns the current editor content as markdown */
  getMarkdown: () => string;
  /** Sets the editor content from a markdown string */
  setContent: (markdown: string) => void;
}

/**
 * Props for the WysiwygEditor component.
 */
interface WysiwygEditorProps {
  /** Initial markdown content to display in the editor */
  content: string;
  /** Theme configuration for styling the editor */
  config: EditorConfig;
  /** List of existing notes for wikilink autocomplete suggestions */
  notes: Note[];
  /** Callback fired when content changes (debounced 1s for auto-save) */
  onSave: (content: string) => void;
  /** Callback fired when a wikilink is clicked */
  onLinkClick: (title: string) => void;
  /** Optional callback to create a new note from autocomplete */
  onCreateNote?: (title: string) => void;
  /** Whether to focus the editor on mount (default: false) */
  autoFocus?: boolean;
}

/**
 * Pre-processes markdown content for the TipTap editor.
 * Converts wikilinks [[title]] to HTML button elements that TipTap can parse.
 * The tiptap-markdown extension handles all other markdown conversion.
 *
 * @param markdown - Raw markdown string with wikilinks
 * @returns Markdown with wikilinks converted to HTML buttons
 */
function processWikilinksForEditor(markdown: string): string {
  // Convert wikilinks to button elements that the WikiLink node can parse
  return markdown.replace(
    /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
    (_, rawTitle, display) => {
      const title = rawTitle.trim();
      const displayText = display ? display.trim() : title;
      return `<button type="button" data-internal="true" data-title="${title}">${displayText}</button>`;
    }
  );
}

/**
 * A rich-text WYSIWYG editor built on TipTap with wikilink support.
 *
 * Provides markdown editing with real-time preview, auto-save functionality,
 * and `[[wikilink]]` autocomplete for linking between notes. Supports tables,
 * code blocks, headers, lists, and inline formatting.
 *
 * @remarks
 * - Content is auto-saved 1 second after the last edit
 * - Wikilinks are rendered as clickable buttons to prevent browser navigation
 * - Typing `[[` triggers the autocomplete popup for linking to existing notes
 * - Use the ref to imperatively get/set markdown content
 *
 * @param props - Component props
 * @param props.content - Initial markdown content
 * @param props.config - Theme configuration for colors and fonts
 * @param props.notes - Available notes for autocomplete suggestions
 * @param props.onSave - Callback when content changes (debounced)
 * @param props.onLinkClick - Callback when a wikilink is clicked
 * @param props.onCreateNote - Optional callback to create new notes from autocomplete
 * @param props.autoFocus - Focus editor on mount (default: false)
 * @param ref - Ref exposing getMarkdown() and setContent() methods
 *
 * @example
 * ```tsx
 * const editorRef = useRef<WysiwygEditorRef>(null);
 *
 * <WysiwygEditor
 *   ref={editorRef}
 *   content="# Hello\n\nLink to [[Other Note]]"
 *   config={{ theme: { colors: { text: '#fff' } } }}
 *   notes={allNotes}
 *   onSave={(markdown) => saveNote(markdown)}
 *   onLinkClick={(title) => openNote(title)}
 *   onCreateNote={(title) => createNewNote(title)}
 *   autoFocus
 * />
 *
 * // Get current content
 * const markdown = editorRef.current?.getMarkdown();
 * ```
 */
export const WysiwygEditor = forwardRef<WysiwygEditorRef, WysiwygEditorProps>(
  function WysiwygEditor(
    {
      content,
      config,
      notes,
      onSave,
      onLinkClick,
      onCreateNote,
      autoFocus = false,
    },
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
          codeBlock: {
            HTMLAttributes: {
              class: "bg-gray-800 rounded-lg p-4 my-4 overflow-x-auto",
            },
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
        Table.configure({
          resizable: false,
          HTMLAttributes: {
            class: "border-collapse w-full my-4",
          },
        }),
        TableRow,
        TableHeader.configure({
          HTMLAttributes: {
            class:
              "border border-gray-600 bg-gray-700 px-3 py-2 text-left font-semibold",
          },
        }),
        TableCell.configure({
          HTMLAttributes: {
            class: "border border-gray-600 px-3 py-2",
          },
        }),
        Markdown.configure({
          html: true,
          tightLists: true,
          bulletListMarker: "-",
          transformPastedText: true,
          transformCopiedText: true,
        }),
        WikiLink,
      ],
      content: processWikilinksForEditor(content),
      editorProps: {
        attributes: {
          class:
            "prose prose-invert max-w-none focus:outline-none min-h-[200px] px-6 py-4",
          style: `color: ${
            config.theme.colors?.text || "#e8e6e3"
          }; font-family: ${config.theme.fonts?.body || "Inter, sans-serif"};`,
        },
        // Handle clicks on internal link buttons
        handleDOMEvents: {
          click: (_view, event) => {
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

        // Schedule auto-save - use the Markdown extension's getMarkdown()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const markdown = (editor.storage as any).markdown?.getMarkdown() || "";
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
      getMarkdown: () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        editor
          ? (editor.storage as any).markdown?.getMarkdown() || ""
          : content,
      setContent: (markdown: string) => {
        if (editor) {
          editor.commands.setContent(processWikilinksForEditor(markdown));
          lastSavedContentRef.current = markdown;
        }
      },
    }));

    // Update editor content when prop changes
    useEffect(() => {
      if (editor && content !== lastSavedContentRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currentMarkdown =
          (editor.storage as any).markdown?.getMarkdown() || "";
        if (currentMarkdown !== content) {
          editor.commands.setContent(processWikilinksForEditor(content));
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
        const textBefore = $from.parent.textContent.slice(
          0,
          $from.parentOffset
        );
        const match = textBefore.match(/\[\[([^\]|\[]*)$/);

        if (match) {
          const query = match[1];
          const triggerPos = $from.pos - query.length - 2;

          // Get cursor position for popup
          const coords = ed.view.coordsAtPos($from.pos);

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
        <EditorContent editor={editor} className="h-full" />

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
