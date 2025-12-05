"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useNavigation } from "@/hooks/useNavigation";
import { useNotes, useNote, useUpdateNote, useCreateNote, useDeleteNote } from "@/hooks/useNotes";
import type { NexusConfig } from "@/types";
import { Pane } from "./Pane";

const COLLAPSED_WIDTH = 40;

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
  const { state, pushPane, closePane, closePanesByTitle, updatePaneTitle, setActive } = useNavigation();
  const { data: allNotes = [] } = useNotes();
  const containerRef = useRef<HTMLDivElement>(null);
  const createNoteMutation = useCreateNote();
  const [scrollLeft, setScrollLeft] = useState(0);
  const paneWidth = config.layout.pane.width || 600;

  // Track scroll position for collapsing panes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollLeft(container.scrollLeft);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

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

  // Get container width for calculations
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => setContainerWidth(container.clientWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Calculate which panes should be collapsed based on scroll position
  // A pane collapses when it's been scrolled past (its right edge is out of view on the left)
  const getCollapseState = useCallback(
    (index: number) => {
      // First pane never collapses
      if (index === 0) return false;

      // Only one pane - never collapse
      if (state.panes.length === 1) return false;

      // Calculate how many full-width panes can fit in the container
      const panesInView = Math.max(1, Math.floor(containerWidth / paneWidth));

      // Calculate total width of all panes at full size
      const totalWidth = state.panes.length * paneWidth;

      // Calculate the maximum scroll position
      const maxScroll = Math.max(0, totalWidth - containerWidth);

      // If we can see all panes, don't collapse any
      if (maxScroll === 0) return false;

      // Calculate what percentage we've scrolled
      const scrollPercentage = maxScroll > 0 ? scrollLeft / maxScroll : 0;

      // Calculate which pane index should start being visible based on scroll
      const firstVisibleIndex = Math.floor(scrollPercentage * (state.panes.length - panesInView));

      // Collapse if this pane is before the first visible one
      return index < firstVisibleIndex;
    },
    [scrollLeft, paneWidth, containerWidth, state.panes.length]
  );

  // Scroll to a specific pane (used when clicking collapsed pane)
  const scrollToPane = useCallback(
    (index: number) => {
      if (!containerRef.current) return;

      // To show pane at index, we need to scroll so it's the first visible pane
      // We want firstVisibleIndex = index
      // From the formula: index = floor(scrollPercentage * (numPanes - panesInView))
      // So: scrollPercentage = index / (numPanes - panesInView)
      // And: scrollLeft = scrollPercentage * maxScroll

      const panesInView = Math.max(1, Math.floor(containerWidth / paneWidth));
      const totalWidth = state.panes.length * paneWidth;
      const maxScroll = Math.max(0, totalWidth - containerWidth);

      if (maxScroll === 0) return;

      const scrollPercentage = index / Math.max(1, state.panes.length - panesInView);
      const targetScroll = Math.min(maxScroll, scrollPercentage * maxScroll);

      containerRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    },
    [paneWidth, containerWidth, state.panes.length]
  );

  const handleLinkClick = useCallback(
    (title: string, paneIndex: number) => {
      pushPane(title, paneIndex);
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
      await createNoteMutation.mutateAsync({ title, content: "" });
    },
    [createNoteMutation]
  );

  const handleDeleteNote = useCallback(
    (deletedTitle: string) => {
      // Close all panes that have this title
      closePanesByTitle(deletedTitle);
    },
    [closePanesByTitle]
  );

  const handleTitleChange = useCallback(
    (oldTitle: string, newTitle: string) => {
      // Update the pane title in navigation state
      updatePaneTitle(oldTitle, newTitle);
    },
    [updatePaneTitle]
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
          title={pane.title}
          index={index}
          isActive={index === state.activePaneIndex}
          collapsed={getCollapseState(index)}
          config={config}
          allNotes={allNotes}
          onLinkClick={(title) => handleLinkClick(title, index)}
          onClose={() => handleClose(index)}
          onSetActive={() => setActive(index)}
          onExpandPane={() => scrollToPane(index)}
          onCreateNote={handleCreateNote}
          onTitleChange={(newTitle) => handleTitleChange(pane.title, newTitle)}
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
  /** Title identifier for the note to display */
  title: string;
  /** Position index of this pane in the stack */
  index: number;
  /** Whether this pane is currently active/focused */
  isActive: boolean;
  /** Whether this pane should display in collapsed mode */
  collapsed: boolean;
  /** Application configuration for theming and layout */
  config: NexusConfig;
  /** List of all notes for autocomplete in edit mode */
  allNotes: ReturnType<typeof useNotes>["data"];
  /** Callback when a wikilink is clicked, receives the target title */
  onLinkClick: (title: string) => void;
  /** Callback to close this pane */
  onClose: () => void;
  /** Callback to set this pane as active */
  onSetActive: () => void;
  /** Callback when clicking a collapsed pane to expand it */
  onExpandPane: () => void;
  /** Optional callback when creating a new note from autocomplete */
  onCreateNote?: (title: string) => void;
  /** Optional callback when renaming a note's title */
  onTitleChange?: (newTitle: string) => void;
  /** Optional callback when deleting this note */
  onDeleteNote?: (title: string) => void;
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
  title,
  index,
  isActive,
  collapsed,
  config,
  allNotes = [],
  onLinkClick,
  onClose,
  onSetActive,
  onExpandPane,
  onCreateNote,
  onTitleChange,
  onDeleteNote,
}: PaneWrapperProps) {
  const { data: note, isLoading, error } = useNote(title);
  const updateNoteMutation = useUpdateNote(title);
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
      await deleteNoteMutation.mutateAsync(title);
      onDeleteNote?.(title);
    }
  }, [note, title, deleteNoteMutation, onDeleteNote]);

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
          Note not found: {title}
        </p>
      </div>
    );
  }

  return (
    <div
      className="pane-enter snap-center md:snap-align-none"
      onClick={collapsed ? undefined : onSetActive}
    >
      <Pane
        note={note}
        index={index}
        isActive={isActive}
        collapsed={collapsed}
        config={config}
        allNotes={allNotes}
        onLinkClick={onLinkClick}
        onClose={onClose}
        onSave={handleSave}
        onTitleChange={handleTitleChange}
        onCreateNote={onCreateNote}
        onDelete={handleDelete}
        onExpandPane={onExpandPane}
      />
    </div>
  );
}
