"use client";

import { useRef, useEffect, useCallback } from "react";
import { useNavigation } from "@/hooks/useNavigation";
import { useNotes, useNote, useUpdateNote, useCreateNote, useDeleteNote } from "@/hooks/useNotes";
import type { NexusConfig } from "@/types";
import { Pane } from "./Pane";

/**
 * Props for the StackContainer component.
 */
interface StackContainerProps {
  /** Application configuration including theme, layout, and feature flags */
  config: NexusConfig;
}

/**
 * Container for horizontally stacking note panes (Andy Matuschak-style navigation).
 *
 * Manages the horizontal stack of panes, handling navigation state, scrolling behavior,
 * and coordination between multiple open notes. Each pane can be in view or edit mode
 * and supports wikilink navigation to open new panes.
 *
 * @param props - Component props
 * @param props.config - Application configuration for theming and layout
 *
 * @remarks
 * The component uses the NavigationContext to manage pane state (open panes, active pane,
 * view/edit modes). When a new pane is added, it automatically scrolls to bring it into view.
 * On mobile, snap scrolling is enabled for better touch navigation.
 *
 * @example
 * ```tsx
 * <StackContainer config={nexusConfig} />
 * ```
 */
export function StackContainer({ config }: StackContainerProps) {
  const { state, pushPane, closePane, setActive } = useNavigation();
  const { data: allNotes = [] } = useNotes();
  const containerRef = useRef<HTMLDivElement>(null);
  const createNoteMutation = useCreateNote();

  // Scroll to new pane when added
  useEffect(() => {
    if (containerRef.current && state.panes.length > 0) {
      const container = containerRef.current;
      // Smooth scroll to the rightmost pane
      container.scrollTo({
        left: container.scrollWidth,
        behavior: "smooth",
      });
    }
  }, [state.panes.length]);

  const handleLinkClick = useCallback(
    (slug: string, paneIndex: number) => {
      pushPane(slug, paneIndex);
    },
    [pushPane]
  );

  const handleClose = useCallback(
    (index: number) => {
      closePane(index);
    },
    [closePane]
  );

  const handleCreateNote = useCallback(
    async (title: string) => {
      const slug = title.toLowerCase().replace(/\s+/g, "-");
      await createNoteMutation.mutateAsync({ title, slug, content: "" });
    },
    [createNoteMutation]
  );

  const handleDeleteNote = useCallback(
    (deletedSlug: string) => {
      // Close all panes that have this slug (there could be multiple)
      // We iterate in reverse to avoid index shifting issues
      const indicesToClose = state.panes
        .map((pane, index) => (pane.slug === deletedSlug ? index : -1))
        .filter((i) => i !== -1)
        .reverse();

      for (const index of indicesToClose) {
        closePane(index);
      }
    },
    [state.panes, closePane]
  );

  if (state.panes.length === 0) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ backgroundColor: config.theme.colors?.background }}
      >
        <p style={{ color: config.theme.colors?.text_muted }}>
          Select a note to get started
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="stack-container flex-1 flex overflow-x-auto scroll-smooth snap-x snap-mandatory md:snap-none"
      style={{ backgroundColor: config.theme.colors?.background }}
    >
      {state.panes.map((pane, index) => (
        <PaneWrapper
          key={pane.id}
          slug={pane.slug}
          index={index}
          isActive={index === state.activePaneIndex}
          config={config}
          allNotes={allNotes}
          onLinkClick={(slug) => handleLinkClick(slug, index)}
          onClose={() => handleClose(index)}
          onSetActive={() => setActive(index)}
          onCreateNote={handleCreateNote}
          onDeleteNote={handleDeleteNote}
        />
      ))}
    </div>
  );
}

/**
 * Props for the PaneWrapper component.
 */
interface PaneWrapperProps {
  /** Slug identifier for the note to display */
  slug: string;
  /** Position index of this pane in the stack */
  index: number;
  /** Whether this pane is currently active/focused */
  isActive: boolean;
  /** Application configuration for theming and layout */
  config: NexusConfig;
  /** List of all notes for autocomplete in edit mode */
  allNotes: ReturnType<typeof useNotes>["data"];
  /** Callback when a wikilink is clicked, receives the target slug */
  onLinkClick: (slug: string) => void;
  /** Callback to close this pane */
  onClose: () => void;
  /** Callback to set this pane as active */
  onSetActive: () => void;
  /** Optional callback when creating a new note from autocomplete */
  onCreateNote?: (title: string) => void;
  /** Optional callback when renaming a note's title */
  onTitleChange?: (newTitle: string) => void;
  /** Optional callback when deleting this note */
  onDeleteNote?: (slug: string) => void;
}

/**
 * Wrapper component that handles data fetching and mutations for a single pane.
 *
 * Fetches the note data for the given slug and provides save functionality.
 * Displays loading and error states while the note is being fetched.
 *
 * @param props - Component props
 */
function PaneWrapper({
  slug,
  index,
  isActive,
  config,
  allNotes = [],
  onLinkClick,
  onClose,
  onSetActive,
  onCreateNote,
  onTitleChange,
  onDeleteNote,
}: PaneWrapperProps) {
  const { data: note, isLoading, error } = useNote(slug);
  const updateNoteMutation = useUpdateNote(slug);
  const deleteNoteMutation = useDeleteNote();

  const handleSave = useCallback(
    async (content: string) => {
      await updateNoteMutation.mutateAsync({ content });
    },
    [updateNoteMutation]
  );

  const handleTitleChange = useCallback(
    async (newTitle: string) => {
      await updateNoteMutation.mutateAsync({ title: newTitle });
      onTitleChange?.(newTitle);
    },
    [updateNoteMutation, onTitleChange]
  );

  const handleDelete = useCallback(async () => {
    if (!note) return;

    const confirmed = window.confirm(
      `Delete "${note.title}"?\n\nThis will also remove links to this note from other notes. This action cannot be undone.`
    );

    if (confirmed) {
      await deleteNoteMutation.mutateAsync(slug);
      onDeleteNote?.(slug);
    }
  }, [note, slug, deleteNoteMutation, onDeleteNote]);

  if (isLoading) {
    return (
      <div
        className="pane-enter flex-shrink-0 flex items-center justify-center snap-center md:snap-align-none"
        style={{
          width: config.layout.pane.width,
          minWidth: config.layout.pane.min_width || 400,
          backgroundColor: config.theme.colors?.surface,
        }}
        onClick={onSetActive}
      >
        <div
          className="animate-pulse"
          style={{ color: config.theme.colors?.text_muted }}
        >
          Loading...
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div
        className="pane-enter flex-shrink-0 flex items-center justify-center snap-center md:snap-align-none"
        style={{
          width: config.layout.pane.width,
          minWidth: config.layout.pane.min_width || 400,
          backgroundColor: config.theme.colors?.surface,
        }}
        onClick={onSetActive}
      >
        <p style={{ color: config.theme.colors?.text_muted }}>
          Note not found: {slug}
        </p>
      </div>
    );
  }

  return (
    <div
      className="pane-enter snap-center md:snap-align-none"
      onClick={onSetActive}
    >
      <Pane
        note={note}
        index={index}
        isActive={isActive}
        config={config}
        allNotes={allNotes}
        onLinkClick={onLinkClick}
        onClose={onClose}
        onSave={handleSave}
        onTitleChange={handleTitleChange}
        onCreateNote={onCreateNote}
        onDelete={handleDelete}
      />
    </div>
  );
}
