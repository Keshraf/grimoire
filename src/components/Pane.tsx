"use client";

import { useState, useMemo } from "react";
import type { Note, NoteWithLinks, NexusConfig } from "@/types";
import { PaneHeader } from "./PaneHeader";
import { InlineNoteEditor } from "./InlineNoteEditor";
import { BacklinksPanel } from "./BacklinksPanel";
import { LinearNav } from "./LinearNav";
import { FloatingGraph } from "./FloatingGraph";
import { getLocalGraph } from "@/lib/graph";

interface PaneProps {
  note: NoteWithLinks;
  index: number;
  isActive: boolean;
  config: NexusConfig;
  allNotes: Note[];
  onLinkClick: (title: string) => void;
  onClose: () => void;
  onSave: (content: string) => void;
  onTitleChange?: (newTitle: string) => void;
  onCreateNote?: (title: string) => void;
  onDelete?: () => void;
}

export function Pane({
  note,
  index,
  isActive,
  config,
  allNotes,
  onLinkClick,
  onClose,
  onSave,
  onTitleChange,
  onCreateNote,
  onDelete,
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

  return (
    <article
      className={`relative flex flex-col h-screen border-r border-white/10 flex-shrink-0 ${
        isActive ? "ring-2 ring-inset" : ""
      }`}
      style={
        {
          width: paneWidth,
          minWidth,
          maxWidth,
          backgroundColor: config.theme.colors?.background,
          "--tw-ring-color": isActive
            ? config.theme.colors?.primary
            : undefined,
        } as React.CSSProperties
      }
      data-pane-index={index}
      aria-current={isActive ? "true" : undefined}
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
      {showLocalGraph && localGraph.nodes.length > 0 && isActive && (
        <FloatingGraph
          graph={localGraph}
          currentTitle={note.title}
          onNodeClick={onLinkClick}
          expanded={graphExpanded}
          onToggle={() => setGraphExpanded(!graphExpanded)}
        />
      )}
    </article>
  );
}
