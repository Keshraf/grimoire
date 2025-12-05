"use client";

import { useState, useMemo } from "react";
import type { Note, NoteWithLinks, NexusConfig } from "@/types";
import { useAuth } from "@/hooks";
import { PaneHeader } from "./PaneHeader";
import { WysiwygEditor } from "./WysiwygEditor";
import { NoteViewer } from "./NoteViewer";
import { BacklinksPanel } from "./BacklinksPanel";
import { LinearNav } from "./LinearNav";
import { FloatingGraph } from "./FloatingGraph";
import { getLocalGraph } from "@/lib/graph";

/** Width of the collapsed pane strip showing only the vertical title */
const COLLAPSED_WIDTH = 40;

/**
 * Props for the Pane component.
 */
interface PaneProps {
  /** The note data including content, backlinks, and rendered HTML */
  note: NoteWithLinks;
  /** Position index of this pane in the horizontal stack (0-based) */
  index: number;
  /** Whether this pane is currently active/focused */
  isActive: boolean;
  /** Whether the pane is collapsed to a narrow strip with vertical title */
  collapsed?: boolean;
  /** Application configuration for theming, layout, and feature flags */
  config: NexusConfig;
  /** List of all notes for graph computation and autocomplete */
  allNotes: Note[];
  /** Callback when a wikilink is clicked, receives the target note title */
  onLinkClick: (title: string) => void;
  /** Callback to close this pane */
  onClose: () => void;
  /** Callback to save updated note content */
  onSave: (content: string) => void;
  /** Optional callback when the note title is changed */
  onTitleChange?: (newTitle: string) => void;
  /** Optional callback to create a new note from autocomplete */
  onCreateNote?: (title: string) => void;
  /** Optional callback to delete this note */
  onDelete?: () => void;
  /** Optional callback when clicking a collapsed pane to expand it */
  onExpandPane?: () => void;
}

/**
 * A single pane in the horizontal note stack, displaying note content with
 * optional backlinks, local graph, and linear navigation.
 *
 * Supports two visual states:
 * - **Expanded**: Full note view with header, content editor, backlinks panel,
 *   and floating graph visualization
 * - **Collapsed**: Narrow strip (40px) showing only a vertical title, used when
 *   the pane is scrolled out of the primary viewport
 *
 * @param props - Component props (see PaneProps interface)
 *
 * @remarks
 * - The collapsed state is controlled by the parent StackContainer based on scroll position
 * - Local graph is computed using memoization and only shown for the active pane
 * - Backlinks panel and linear navigation visibility are controlled by config feature flags
 * - In documentation mode, linear prev/next navigation is enabled
 *
 * @example
 * ```tsx
 * <Pane
 *   note={noteWithLinks}
 *   index={0}
 *   isActive={true}
 *   collapsed={false}
 *   config={nexusConfig}
 *   allNotes={notes}
 *   onLinkClick={(title) => openNote(title)}
 *   onClose={() => closePane(0)}
 *   onSave={(content) => saveNote(content)}
 * />
 * ```
 */
export function Pane({
  note,
  index,
  isActive,
  collapsed = false,
  config,
  allNotes,
  onLinkClick,
  onClose,
  onSave,
  onTitleChange,
  onCreateNote,
  onDelete,
  onExpandPane,
}: PaneProps) {
  const { canWrite } = useAuth();
  const [graphExpanded, setGraphExpanded] = useState(
    config.layout.graph?.default_expanded ?? true
  );

  const showBacklinks = config.features.backlinks_panel;
  const showLinearNav =
    config.features.linear_nav && config.mode === "documentation";
  const showLocalGraph = config.features.local_graph;

  // Compute local graph data for this note
  const localGraph = useMemo(() => {
    if (!showLocalGraph || !allNotes.length) {
      return { nodes: [], edges: [] };
    }
    return getLocalGraph(note.title, allNotes);
  }, [showLocalGraph, note.title, allNotes]);

  // Handle click on collapsed pane
  const handleCollapsedClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onExpandPane?.();
  };

  return (
    <article
      className={`relative flex flex-col h-full ${
        isActive && !collapsed ? "ring-2 ring-inset" : ""
      } ${collapsed ? "cursor-pointer hover:bg-white/5" : ""}`}
      style={{
        backgroundColor: config.theme.colors?.background,
        // @ts-expect-error CSS custom property
        "--tw-ring-color": isActive ? config.theme.colors?.primary : undefined,
      }}
      data-pane-index={index}
      data-collapsed={collapsed ? "true" : "false"}
      aria-current={isActive ? "true" : undefined}
      onClick={collapsed ? handleCollapsedClick : undefined}
      title={collapsed ? `Click to expand: ${note.title}` : undefined}
    >
      {/* Collapsed overlay with vertical title - covers entire pane when collapsed */}
      <div
        className={`absolute inset-y-0 left-0 flex items-center justify-center overflow-hidden z-20 transition-opacity duration-300 border-r border-white/10 ${
          collapsed ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{
          backgroundColor: config.theme.colors?.surface,
          width: COLLAPSED_WIDTH,
        }}
      >
        <span
          className="whitespace-nowrap font-medium text-sm text-center"
          style={{
            color: config.theme.colors?.text,
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            transform: "rotate(180deg)",
            maxHeight: "calc(100vh - 100px)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            letterSpacing: "0.05em",
          }}
        >
          {note.title}
        </span>
      </div>

      {/* Main content - hidden when collapsed but still in DOM */}
      <div
        className={`flex-1 flex flex-col min-h-0 transition-opacity duration-300 ${
          collapsed ? "opacity-0 invisible" : "opacity-100 visible"
        }`}
      >
        {/* Fixed header */}
        <PaneHeader
          title={note.title}
          config={config}
          onClose={onClose}
          onTitleChange={onTitleChange}
          onDelete={onDelete}
          showClose={index > 0}
        />

        {/* Scrollable content area */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div>
            {config.features.inline_editing && canWrite ? (
              <WysiwygEditor
                content={note.content}
                config={config}
                notes={allNotes}
                onSave={onSave}
                onLinkClick={onLinkClick}
                onCreateNote={onCreateNote}
              />
            ) : (
              <NoteViewer
                html={note.html}
                config={config}
                onLinkClick={onLinkClick}
              />
            )}

            {/* Backlinks at bottom of content */}
            {showBacklinks && note.backlinks.length > 0 && (
              <div className="mt-8 px-6 pb-6">
                <BacklinksPanel
                  backlinks={note.backlinks}
                  config={config}
                  onLinkClick={onLinkClick}
                />
              </div>
            )}

            {/* Linear navigation for documentation mode */}
            {showLinearNav && (
              <div className="px-6 pb-6">
                <LinearNav
                  currentTitle={note.title}
                  config={config}
                  onNavigate={onLinkClick}
                />
              </div>
            )}
          </div>
        </div>

        {/* Floating graph in bottom-right corner */}
        {showLocalGraph &&
          localGraph.nodes.length > 0 &&
          isActive &&
          !collapsed && (
            <FloatingGraph
              graph={localGraph}
              currentTitle={note.title}
              onNodeClick={onLinkClick}
              expanded={graphExpanded}
              onToggle={() => setGraphExpanded(!graphExpanded)}
            />
          )}
      </div>
    </article>
  );
}
