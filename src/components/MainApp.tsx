"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { NexusConfig } from "@/types";
import { DEFAULT_CONFIG } from "@/lib/config.defaults";
import {
  useNavigation,
  useNotes,
  useCreateNote,
  useURLSync,
  useAuth,
  useKeyboardShortcuts,
} from "@/hooks";
import { Layout } from "./Layout";
import { StackContainer } from "./StackContainer";
import { SearchModal } from "./SearchModal";

/**
 * Main application component that orchestrates state and renders the UI.
 * Handles config loading, keyboard shortcuts, and coordinates between
 * Layout, StackContainer, and SearchModal components.
 */
export function MainApp() {
  const [config, setConfig] = useState<NexusConfig>(DEFAULT_CONFIG);
  const [configLoading, setConfigLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const initializedRef = useRef(false);

  const { state, pushPane, replaceAll, closePane } = useNavigation();
  const {
    data: notes = [],
    isLoading: notesLoading,
    error: notesError,
  } = useNotes();
  const { isLoading: authLoading } = useAuth();
  const createNoteMutation = useCreateNote();

  // Sync navigation state with URL
  useURLSync();

  // Fetch config on mount
  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/config");
        if (res.ok) {
          const data = await res.json();
          // Merge with defaults to ensure all fields exist
          setConfig({ ...DEFAULT_CONFIG, ...data });
        }
      } catch (error) {
        console.warn("Failed to fetch config, using defaults:", error);
      } finally {
        setConfigLoading(false);
      }
    }
    fetchConfig();
  }, []);

  // Initialize with home/index note or first note when notes load
  useEffect(() => {
    if (initializedRef.current) return;
    if (notesLoading || configLoading) return;
    if (state.panes.length > 0) {
      initializedRef.current = true;
      return;
    }
    if (notes.length === 0) {
      initializedRef.current = true;
      return;
    }

    // Find home or index note, otherwise use first note
    const homeNote = notes.find((n) => n.title.toLowerCase() === "home" || n.title.toLowerCase() === "index");
    const initialTitle = homeNote?.title || notes[0]?.title;

    if (initialTitle) {
      pushPane(initialTitle);
    }
    initializedRef.current = true;
  }, [notes, notesLoading, configLoading, state.panes.length, pushPane]);

  // Handle page click from sidebar - replaces entire stack with just this note
  const handlePageClick = useCallback(
    (title: string) => {
      replaceAll(title);
    },
    [replaceAll]
  );

  // Handle new note creation
  const handleNewNote = useCallback(async () => {
    const timestamp = Date.now();
    const title = `Untitled ${timestamp}`;

    try {
      await createNoteMutation.mutateAsync({
        title,
        content: "",
      });
      pushPane(title);
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  }, [createNoteMutation, pushPane]);

  // Handle search result selection - replaces entire stack with selected note
  const handleSearchSelect = useCallback(
    (title: string) => {
      replaceAll(title);
      setSearchOpen(false);
    },
    [replaceAll]
  );

  // Handle escape key - close modal or rightmost pane
  const handleEscape = useCallback(() => {
    if (searchOpen) {
      setSearchOpen(false);
    } else if (state.panes.length > 1) {
      closePane(state.panes.length - 1);
    }
  }, [searchOpen, state.panes.length, closePane]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSearch: () => setSearchOpen(true),
    onNewNote: handleNewNote,
    onEscape: handleEscape,
  });

  // Loading state
  if (configLoading || authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--color-background,#0a0a0f)]">
        <div className="text-[var(--color-text-muted,#a8a6a3)] animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  // Error state for notes
  if (notesError) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--color-background,#0a0a0f)]">
        <div className="text-red-400">
          Failed to load notes. Please refresh the page.
        </div>
      </div>
    );
  }

  return (
    <>
      <Layout
        config={config}
        notes={notes}
        onPageClick={handlePageClick}
        onNewNote={handleNewNote}
      >
        <StackContainer config={config} />
      </Layout>

      {/* Search Modal */}
      {config.features.search && (
        <SearchModal
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
          onSelect={handleSearchSelect}
          config={config}
        />
      )}
    </>
  );
}
