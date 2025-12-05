"use client";

import { useState, useMemo } from "react";
import type { Note, NoteWithLinks, NexusConfig } from "@/types";
import { PaneHeader } from "./PaneHeader";
import { InlineNoteEditor } from "./InlineNoteEditor";
import { BacklinksPanel } from "./BacklinksPanel";
import { LinearNav } from "./LinearNav";
import { FloatingGraph } from "./FloatingGraph";
import { getLocalGraph } from "@/lib/graph";

const COLLAPSED_WIDTH = 40;

interface PaneProps {
  note: NoteWithLinks;
  index: number;
  isActive: boolean;
  collapsed?: boolean;
  config: NexusConfig;
  allNotes: Note[];
  onLinkClick: (title: string) => void;
  onClose: () => void;
  onSave: (content: string) => void;
  onTitleChange?: (newTitle: string) => void;
  onCreateNote?: (title: string) => void;
  onDelete?: () => void;
  onExpandPane?: () => void;
}

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
  const [graphExpanded, setGraphExpanded] = useState(
    config.layout.graph?.default_expanded ?? true
  );

  const paneWidth = config.layout.pane.width;
  const minWidth = config.layout.pane.min_width || 400;
  const maxWidth = config.layout.pane.max_width || 800;
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

  // Use CSS to show/hide collapsed vs expanded view to avoid unmounting the editor
  return (
    <article
      className={`relative flex flex-col h-screen border-r border-white/10 flex-shrink-0 transition-all duration-300 ease-out ${
        isActive && !collapsed ? "ring-2 ring-inset" : ""
      } ${collapsed ? "cursor-pointer hover:bg-white/5" : ""}`}
      style={
        {
          width: collapsed ? COLLAPSED_WIDTH : paneWidth,
          minWidth: collapsed ? COLLAPSED_WIDTH : minWidth,
          maxWidth: collapsed ? COLLAPSED_WIDTH : maxWidth,
          backgroundColor: collapsed
            ? config.theme.colors?.surface
            : config.theme.colors?.background,
          "--tw-ring-color": isActive
            ? config.theme.colors?.primary
            : undefined,
        } as React.CSSProperties
      }
      data-pane-index={index}
      data-collapsed={collapsed ? "true" : "false"}
      aria-current={isActive ? "true" : undefined}
      onClick={collapsed ? handleCollapsedClick : undefined}
      title={collapsed ? `Click to expand: ${note.title}` : undefined}
    >
      {/* Collapsed overlay with vertical title */}
      {collapsed && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden z-10">
          <span
            className="whitespace-nowrap font-medium text-sm"
            style={{
              color: config.theme.colors?.text_muted,
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              transform: "rotate(180deg)",
              maxHeight: "calc(100vh - 40px)",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {note.title}
          </span>
        </div>
      )}

      {/* Main content - hidden when collapsed but still mounted */}
      <div className={collapsed ? "invisible" : "contents"}>
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
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full">
          <InlineNoteEditor
            content={note.content}
            html={note.html}
            config={config}
            notes={allNotes}
            onSave={onSave}
            onLinkClick={onLinkClick}
            onCreateNote={onCreateNote}
          />

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
      {showLocalGraph && localGraph.nodes.length > 0 && isActive && !collapsed && (
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
