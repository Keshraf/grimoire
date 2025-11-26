"use client";

import { useEffect } from "react";

/**
 * Options for the keyboard shortcuts hook.
 */
export interface UseKeyboardShortcutsOptions {
  /** Callback when Cmd/Ctrl+K is pressed (search) */
  onSearch?: () => void;
  /** Callback when Cmd/Ctrl+N is pressed (new note) */
  onNewNote?: () => void;
  /** Callback when Escape is pressed */
  onEscape?: () => void;
  /** Whether shortcuts are enabled (default: true) */
  enabled?: boolean;
}

/**
 * Hook to handle global keyboard shortcuts for the application.
 *
 * Supports:
 * - Cmd/Ctrl+K: Open search
 * - Cmd/Ctrl+N: Create new note
 * - Escape: Close modal or pane
 *
 * @param options - Callbacks for each shortcut
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts({
 *   onSearch: () => setSearchOpen(true),
 *   onNewNote: () => createNote(),
 *   onEscape: () => closeModal(),
 * });
 * ```
 */
export function useKeyboardShortcuts({
  onSearch,
  onNewNote,
  onEscape,
  enabled = true,
}: UseKeyboardShortcutsOptions): void {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl+K: Open search
      if (isMod && e.key === "k" && onSearch) {
        e.preventDefault();
        onSearch();
        return;
      }

      // Cmd/Ctrl+N: New note
      if (isMod && e.key === "n" && onNewNote) {
        e.preventDefault();
        onNewNote();
        return;
      }

      // Escape: Close modal or rightmost pane
      if (e.key === "Escape" && onEscape) {
        onEscape();
        return;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onSearch, onNewNote, onEscape]);
}
