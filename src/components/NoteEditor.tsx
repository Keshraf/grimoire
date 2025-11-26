"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import type { Note } from "@/types";
import { LinkAutocomplete } from "./LinkAutocomplete";

interface NoteEditorProps {
  /** Initial markdown content */
  content: string;
  /** Called on every content change */
  onChange: (content: string) => void;
  /** Called when user saves (Cmd+S) */
  onSave: () => void;
  /** Called when user cancels (Escape outside autocomplete) */
  onCancel: () => void;
  /** List of existing notes for autocomplete */
  notes: Note[];
  /** Optional: callback when user wants to create a new note from autocomplete */
  onCreateNote?: (title: string) => void;
}

interface AutocompleteState {
  isOpen: boolean;
  query: string;
  triggerIndex: number;
  position: { top: number; left: number };
}

export function NoteEditor({
  content,
  onChange,
  onSave,
  onCancel,
  notes,
  onCreateNote,
}: NoteEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);

  const [autocomplete, setAutocomplete] = useState<AutocompleteState>({
    isOpen: false,
    query: "",
    triggerIndex: -1,
    position: { top: 0, left: 0 },
  });

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

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

  // Detect [[ trigger and manage autocomplete state
  const detectTrigger = useCallback(
    (value: string, cursorPos: number) => {
      // Look backwards from cursor for [[
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
      onChange(newValue);
      detectTrigger(newValue, cursorPos);
    },
    [onChange, detectTrigger]
  );

  // Insert wikilink at trigger position
  const insertLink = useCallback(
    (slug: string, title: string) => {
      const { triggerIndex } = autocomplete;
      const textarea = textareaRef.current;
      if (triggerIndex === -1 || !textarea) return;

      const cursorPos = textarea.selectionStart;
      const before = content.slice(0, triggerIndex);
      const after = content.slice(cursorPos);

      // Use [[slug]] if title matches slug pattern, otherwise [[slug|title]]
      const slugFromTitle = title.toLowerCase().replace(/\s+/g, "-");
      const link =
        slug === slugFromTitle ? `[[${slug}]]` : `[[${slug}|${title}]]`;

      const newContent = before + link + after;
      onChange(newContent);

      // Position cursor after the closing ]]
      const newCursorPos = triggerIndex + link.length;
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);

      setAutocomplete((prev) => ({ ...prev, isOpen: false }));
    },
    [autocomplete, content, onChange]
  );

  // Handle create new note from autocomplete
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

  // Close autocomplete
  const closeAutocomplete = useCallback(() => {
    setAutocomplete((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Keyboard shortcuts: Cmd+S to save, Escape to cancel (when autocomplete closed)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        onSave();
        return;
      }

      // Escape to cancel (only when autocomplete is closed)
      if (e.key === "Escape" && !autocomplete.isOpen) {
        e.preventDefault();
        onCancel();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSave, onCancel, autocomplete.isOpen]);

  return (
    <div className="relative flex flex-col h-full">
      {/* Hidden mirror div for cursor position calculation */}
      <div ref={mirrorRef} aria-hidden="true" />

      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        className="flex-1 w-full px-6 py-4 resize-none focus:outline-none bg-transparent"
        style={{
          fontFamily: "JetBrains Mono, monospace",
          color: "#e8e6e3",
          minHeight: "200px",
        }}
        placeholder="Write your note in markdown..."
        spellCheck
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
