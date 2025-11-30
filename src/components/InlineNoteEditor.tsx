"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Note, NexusConfig } from "@/types";
import { LinkAutocomplete } from "./LinkAutocomplete";
import { renderMarkdown } from "@/lib/markdown";

interface InlineNoteEditorProps {
  content: string;
  html: string;
  config: NexusConfig;
  notes: Note[];
  onSave: (content: string) => void;
  onLinkClick: (slug: string) => void;
  onCreateNote?: (title: string) => void;
}

interface AutocompleteState {
  isOpen: boolean;
  query: string;
  triggerIndex: number;
  position: { top: number; left: number };
}

export function InlineNoteEditor({
  content: initialContent,
  html: initialHtml,
  config,
  notes,
  onSave,
  onLinkClick,
  onCreateNote,
}: InlineNoteEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [html, setHtml] = useState(initialHtml);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasChangesRef = useRef(false);

  const [autocomplete, setAutocomplete] = useState<AutocompleteState>({
    isOpen: false,
    query: "",
    triggerIndex: -1,
    position: { top: 0, left: 0 },
  });

  // Sync content when prop changes (e.g., when note is reloaded)
  useEffect(() => {
    if (!isEditing) {
      setContent(initialContent);
      setHtml(initialHtml);
    }
  }, [initialContent, initialHtml, isEditing]);

  // Auto-save with debounce
  const scheduleAutoSave = useCallback(
    (newContent: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      hasChangesRef.current = true;
      saveTimeoutRef.current = setTimeout(() => {
        onSave(newContent);
        hasChangesRef.current = false;
      }, 1000); // 1 second debounce
    },
    [onSave]
  );

  // Update preview HTML when content changes
  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(async () => {
        try {
          const newHtml = await renderMarkdown(content);
          setHtml(newHtml);
        } catch (error) {
          console.error("Failed to render markdown:", error);
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [content, isEditing]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && isEditing) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content, isEditing]);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  // Handle click on rendered content (start editing or follow link)
  const handleViewClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      // If clicking a link, handle navigation
      if (anchor?.dataset.internal === "true") {
        e.preventDefault();
        const href = anchor.getAttribute("href");
        if (href) {
          const slug = href.startsWith("/") ? href.slice(1) : href;
          onLinkClick(slug);
        }
        return;
      }

      // Otherwise, enter edit mode
      setIsEditing(true);
    },
    [onLinkClick]
  );

  // Handle blur - save and exit edit mode
  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      // Don't blur if clicking autocomplete
      if (
        autocomplete.isOpen &&
        e.relatedTarget &&
        (e.relatedTarget as HTMLElement).closest(".link-autocomplete")
      ) {
        return;
      }

      // Save any pending changes immediately
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (hasChangesRef.current || content !== initialContent) {
        onSave(content);
        hasChangesRef.current = false;
      }

      setIsEditing(false);
      setAutocomplete((prev) => ({ ...prev, isOpen: false }));
    },
    [autocomplete.isOpen, content, initialContent, onSave]
  );

  // Calculate cursor position for popup placement
  const calculateCursorPosition = useCallback(() => {
    const textarea = textareaRef.current;
    const mirror = mirrorRef.current;
    if (!textarea || !mirror) return { top: 0, left: 0 };

    const style = window.getComputedStyle(textarea);
    mirror.style.cssText = `
      position: absolute;
      visibility: hidden;
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow-wrap: break-word;
      width: ${textarea.clientWidth}px;
      font-family: ${style.fontFamily};
      font-size: ${style.fontSize};
      line-height: ${style.lineHeight};
      padding: ${style.padding};
      border: ${style.border};
    `;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = content.slice(0, cursorPos);
    mirror.textContent = textBeforeCursor;

    const marker = document.createElement("span");
    marker.textContent = "|";
    mirror.appendChild(marker);

    const textareaRect = textarea.getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();

    return {
      top:
        textareaRect.top +
        (markerRect.top - mirror.getBoundingClientRect().top) +
        20,
      left:
        textareaRect.left +
        (markerRect.left - mirror.getBoundingClientRect().left),
    };
  }, [content]);

  // Detect [[ trigger
  const detectTrigger = useCallback(
    (value: string, cursorPos: number) => {
      const textBeforeCursor = value.slice(0, cursorPos);
      const triggerMatch = textBeforeCursor.match(/\[\[([^\]|\[]*)$/);

      if (triggerMatch) {
        const triggerIndex = textBeforeCursor.lastIndexOf("[[");
        const query = triggerMatch[1];
        const position = calculateCursorPosition();

        setAutocomplete({
          isOpen: true,
          query,
          triggerIndex,
          position,
        });
      } else {
        setAutocomplete((prev) => ({ ...prev, isOpen: false }));
      }
    },
    [calculateCursorPosition]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const cursorPos = e.target.selectionStart;
      setContent(newValue);
      detectTrigger(newValue, cursorPos);
      scheduleAutoSave(newValue);
    },
    [detectTrigger, scheduleAutoSave]
  );

  // Insert wikilink
  const insertLink = useCallback(
    (slug: string, title: string) => {
      const { triggerIndex } = autocomplete;
      const textarea = textareaRef.current;
      if (triggerIndex === -1 || !textarea) return;

      const cursorPos = textarea.selectionStart;
      const before = content.slice(0, triggerIndex);
      const after = content.slice(cursorPos);

      const slugFromTitle = title.toLowerCase().replace(/\s+/g, "-");
      const link =
        slug === slugFromTitle ? `[[${slug}]]` : `[[${slug}|${title}]]`;

      const newContent = before + link + after;
      setContent(newContent);
      scheduleAutoSave(newContent);

      const newCursorPos = triggerIndex + link.length;
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);

      setAutocomplete((prev) => ({ ...prev, isOpen: false }));
    },
    [autocomplete, content, scheduleAutoSave]
  );

  // Handle create new note
  const handleCreateNew = useCallback(
    (title: string) => {
      const slug = title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      insertLink(slug, title);
      onCreateNote?.(title);
    },
    [insertLink, onCreateNote]
  );

  const closeAutocomplete = useCallback(() => {
    setAutocomplete((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Escape to exit edit mode (when autocomplete is closed)
      if (e.key === "Escape" && !autocomplete.isOpen) {
        e.preventDefault();
        // Save and exit
        if (hasChangesRef.current || content !== initialContent) {
          onSave(content);
          hasChangesRef.current = false;
        }
        setIsEditing(false);
      }
    },
    [autocomplete.isOpen, content, initialContent, onSave]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-full">
      {/* Hidden mirror for cursor position */}
      <div ref={mirrorRef} aria-hidden="true" />

      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full h-full px-6 py-4 resize-none focus:outline-none bg-transparent"
          style={{
            fontFamily: config.theme.fonts?.body || "Inter, sans-serif",
            color: config.theme.colors?.text,
            minHeight: "200px",
            fontSize: "1rem",
            lineHeight: "1.75",
          }}
          placeholder="Write your note in markdown..."
          spellCheck
        />
      ) : (
        <div
          className="prose prose-invert max-w-none px-6 py-4 cursor-text min-h-[200px]"
          style={{
            color: config.theme.colors?.text,
            fontFamily: config.theme.fonts?.body,
          }}
          onClick={handleViewClick}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}

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
