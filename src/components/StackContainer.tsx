"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useNavigation } from "@/hooks/useNavigation";
import {
  useNotes,
  useNote,
  useUpdateNote,
  useCreateNote,
  useDeleteNote,
} from "@/hooks/useNotes";
import type { NexusConfig } from "@/types";
import { Pane } from "./Pane";

/** Width of a collapsed pane showing only the vertical title */
const COLLAPSED_WIDTH = 40;

/**
 * Container for horizontally stacking note panes using Andy Matuschak-style navigation.
 *
 * Manages the horizontal stack of panes with sticky positioning, allowing users to
 * explore linked notes while preserving context. Panes collapse to a narrow strip
 * when scrolled past, showing only a vertical title.
 *
 * @param props - Component props
 * @param props.config - Application configuration for theming, layout dimensions, and feature flags
 *
 * @remarks
 * - Uses NavigationContext to manage pane state (open panes, active pane index)
 * - Panes use CSS sticky positioning with calculated left/right offsets
 * - Collapse state is determined by scroll position relative to pane thresholds
 * - Automatically scrolls to bring newly opened panes into view
 *
 * @example
 * ```tsx
 * <StackContainer config={nexusConfig} />
 * ```
 */
export function StackContainer({ config }: { config: NexusConfig }) {
  const {
    state,
    pushPane,
    closePane,
    closePanesByTitle,
    updatePaneTitle,
    setActive,
  } = useNavigation();
  const { data: allNotes = [] } = useNotes();
  const containerRef = useRef<HTMLDivElement>(null);
  const createNoteMutation = useCreateNote();
  const [scrollLeft, setScrollLeft] = useState(0);
  const paneWidth = config.layout.pane.width || 600;

  // Handle scroll to track position for collapsing panes
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollLeft(containerRef.current.scrollLeft);
    }
  }, []);

  // Scroll to new pane when added
  useEffect(() => {
    if (containerRef.current && state.panes.length > 0) {
      const lastPaneIndex = state.panes.length - 1;
      const lastPane = containerRef.current.children[
        lastPaneIndex
      ] as HTMLElement;
      if (lastPane) {
        lastPane.scrollIntoView({
          block: "start",
          inline: "start",
          behavior: "smooth",
        });
      }
    }
  }, [state.panes.length]);

  // Calculate the effective pane width for scroll calculations
  // This is paneWidth minus the collapsed width (like reference: 625 - 40 = 585)
  const paneWidthWithoutCollapsed = paneWidth - COLLAPSED_WIDTH;

  // Calculate collapse state based on scroll position (like reference implementation)
  // A pane collapses when scrollLeft > (index + 1) * paneWidthWithoutCollapsed - 60
  const getCollapseState = useCallback(
    (index: number) => {
      const threshold = (index + 1) * paneWidthWithoutCollapsed - 60;
      return scrollLeft > threshold;
    },
    [scrollLeft, paneWidthWithoutCollapsed]
  );

  // Calculate overlay state (shadow on left side when overlapping)
  // Shows shadow when scrollLeft > (index - 1) * paneWidthWithoutCollapsed
  const getOverlayState = useCallback(
    (index: number) => {
      const threshold = (index - 1) * paneWidthWithoutCollapsed;
      return scrollLeft > threshold;
    },
    [scrollLeft, paneWidthWithoutCollapsed]
  );

  // Scroll to a specific pane
  const scrollToPane = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;

    const pane = container.children[index] as HTMLElement;
    if (pane) {
      pane.scrollIntoView({
        block: "start",
        inline: "start",
        behavior: "smooth",
      });
    }
  }, []);

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
      closePanesByTitle(deletedTitle);
    },
    [closePanesByTitle]
  );

  const handleTitleChange = useCallback(
    (oldTitle: string, newTitle: string) => {
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
      className="stack-container flex-1 flex overflow-x-auto overflow-y-hidden"
      style={{ backgroundColor: config.theme.colors?.background }}
      onScroll={handleScroll}
    >
      {state.panes.map((pane, index) => (
        <PaneWrapper
          key={pane.id}
          title={pane.title}
          index={index}
          isActive={index === state.activePaneIndex}
          collapsed={getCollapseState(index)}
          overlay={getOverlayState(index)}
          config={config}
          allNotes={allNotes}
          paneWidth={paneWidth}
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
  /** Position index of this pane in the stack (0-based) */
  index: number;
  /** Whether this pane is currently active/focused */
  isActive: boolean;
  /** Whether this pane should display in collapsed mode (vertical title only) */
  collapsed: boolean;
  /** Whether to show left shadow overlay when overlapping other panes */
  overlay: boolean;
  /** Application configuration for theming and layout */
  config: NexusConfig;
  /** List of all notes for autocomplete suggestions in edit mode */
  allNotes: ReturnType<typeof useNotes>["data"];
  /** Width of the pane in pixels */
  paneWidth: number;
  /** Callback when a wikilink is clicked, receives the target note title */
  onLinkClick: (title: string) => void;
  /** Callback to close this pane */
  onClose: () => void;
  /** Callback to set this pane as the active/focused pane */
  onSetActive: () => void;
  /** Callback when clicking a collapsed pane to expand and scroll to it */
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
 * Fetches note data for the given title and provides save/delete functionality.
 * Uses sticky positioning to enable the overlapping pane behavior.
 *
 * @param props - Component props (see PaneWrapperProps)
 *
 * @remarks
 * - Displays loading spinner while fetching note data
 * - Shows error state if note is not found
 * - Applies sticky positioning with calculated offsets based on pane index
 * - Adds shadow overlay when panes overlap during scrolling
 */
function PaneWrapper({
  title,
  index,
  isActive,
  collapsed,
  overlay,
  config,
  allNotes = [],
  paneWidth,
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

  // Sticky positioning like reference implementation
  const stickyStyle: React.CSSProperties = {
    position: "sticky",
    left: index * COLLAPSED_WIDTH,
    right: -1 * paneWidth - COLLAPSED_WIDTH,
    width: paneWidth,
    flexShrink: 0,
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center border-r border-white/10 bg-[var(--color-surface)] overflow-y-auto"
        style={stickyStyle}
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
        className="flex items-center justify-center border-r border-white/10 bg-[var(--color-surface)] overflow-y-auto"
        style={stickyStyle}
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
      className={`flex flex-col border-r border-white/10 bg-[var(--color-background)] overflow-y-auto transition-shadow duration-300 ${
        overlay ? "shadow-[-10px_0_30px_rgba(0,0,0,0.3)]" : ""
      }`}
      style={stickyStyle}
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
