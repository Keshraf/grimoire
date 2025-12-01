"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { Note } from "@/types";

/**
 * Props for the LinkAutocomplete component.
 */
export interface LinkAutocompleteProps {
  /** Current search query (text after [[) */
  query: string;
  /** List of notes to filter */
  notes: Note[];
  /** Position for the popup */
  position: { top: number; left: number };
  /** Called when a note is selected */
  onSelect: (title: string) => void;
  /** Called when popup should close */
  onClose: () => void;
  /** Called when user wants to create a new note */
  onCreateNew?: (title: string) => void;
}

/**
 * Autocomplete popup for inserting wikilinks to existing notes.
 *
 * Displays a filterable list of notes when the user types `[[` in the NoteEditor.
 * Supports keyboard navigation (arrow keys, Enter, Escape) and mouse interaction.
 * When no notes match the query, offers an option to create a new note.
 *
 * @param props - Component props
 * @param props.query - Current search query (text typed after `[[`)
 * @param props.notes - Array of notes to filter and display
 * @param props.position - Screen coordinates `{ top, left }` for popup placement
 * @param props.onSelect - Callback when a note is selected, receives the note title
 * @param props.onClose - Callback when the popup should close (Escape or click outside)
 * @param props.onCreateNew - Optional callback when user selects "Create new note"
 *
 * @remarks
 * The component manages its own keyboard event listeners and click-outside detection.
 * It automatically adjusts position to stay within the viewport bounds.
 * Selection state resets when the query changes, and the selected item scrolls into view.
 *
 * @example
 * ```tsx
 * <LinkAutocomplete
 *   query="getting"
 *   notes={allNotes}
 *   position={{ top: 200, left: 300 }}
 *   onSelect={(title) => insertLink(title)}
 *   onClose={() => setAutocompleteOpen(false)}
 *   onCreateNew={(title) => createNewNote(title)}
 * />
 * ```
 */
export function LinkAutocomplete({
  query,
  notes,
  position,
  onSelect,
  onClose,
  onCreateNew,
}: LinkAutocompleteProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Filter notes by case-insensitive match on title, limit to 10
  const filteredNotes = useMemo(() => {
    const q = query.toLowerCase();
    return notes
      .filter((note) => note.title.toLowerCase().includes(q))
      .slice(0, 10);
  }, [notes, query]);

  // Show create option when no matches and query is non-empty
  const showCreateOption = filteredNotes.length === 0 && query.length > 0;
  const totalItems = showCreateOption ? 1 : filteredNotes.length;

  // Reset selection when filtered results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    itemRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (totalItems === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % totalItems);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => (i - 1 + totalItems) % totalItems);
          break;
        case "Enter":
          e.preventDefault();
          if (showCreateOption) {
            onCreateNew?.(query);
          } else if (filteredNotes[selectedIndex]) {
            const note = filteredNotes[selectedIndex];
            onSelect(note.title);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [
      totalItems,
      showCreateOption,
      filteredNotes,
      selectedIndex,
      query,
      onSelect,
      onCreateNew,
      onClose,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleItemClick = (title: string) => {
    onSelect(title);
  };

  const handleCreateClick = () => {
    onCreateNew?.(query);
  };

  // Adjust position to stay within viewport
  const adjustedPosition = useMemo(() => {
    const maxWidth = 280;
    const maxHeight = 300;
    let { top, left } = position;

    if (typeof window !== "undefined") {
      if (left + maxWidth > window.innerWidth) {
        left = window.innerWidth - maxWidth - 16;
      }
      if (top + maxHeight > window.innerHeight) {
        top = position.top - maxHeight - 20;
      }
    }
    return { top, left };
  }, [position]);

  if (totalItems === 0 && !showCreateOption) {
    return (
      <div
        ref={containerRef}
        className="fixed z-50 w-64 rounded-lg shadow-lg border border-white/10 overflow-hidden"
        style={{
          top: adjustedPosition.top,
          left: adjustedPosition.left,
          backgroundColor: "#16213e",
        }}
      >
        <div className="px-3 py-2 text-sm text-gray-400">No notes yet</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed z-50 w-64 max-h-72 rounded-lg shadow-lg border border-white/10 overflow-y-auto"
      style={{
        top: adjustedPosition.top,
        left: adjustedPosition.left,
        backgroundColor: "#16213e",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
      }}
    >
      {showCreateOption ? (
        <button
          ref={(el) => {
            itemRefs.current[0] = el;
          }}
          onClick={handleCreateClick}
          onMouseEnter={() => setSelectedIndex(0)}
          className={`w-full text-left px-3 py-2 text-sm transition-colors ${
            selectedIndex === 0 ? "bg-purple-600/50" : "hover:bg-white/10"
          }`}
          style={{ color: "#e8e6e3" }}
        >
          <span className="text-gray-400">Create:</span> [[{query}]]
        </button>
      ) : (
        filteredNotes.map((note, index) => (
          <button
            key={note.title}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            onClick={() => handleItemClick(note.title)}
            onMouseEnter={() => setSelectedIndex(index)}
            className={`w-full text-left px-3 py-2 text-sm transition-colors ${
              selectedIndex === index ? "bg-purple-600/50" : "hover:bg-white/10"
            }`}
            style={{ color: "#e8e6e3" }}
          >
            <div className="truncate">{note.title}</div>
          </button>
        ))
      )}
    </div>
  );
}
