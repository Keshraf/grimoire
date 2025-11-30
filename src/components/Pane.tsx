"use client";

import { useState, useMemo } from "react";
import type { Note, NoteWithLinks, NexusConfig } from "@/types";
import { PaneHeader } from "./PaneHeader";
import { InlineNoteEditor } from "./InlineNoteEditor";
import { BacklinksPanel } from "./BacklinksPanel";
import { LinearNav } from "./LinearNav";
import { LocalGraph } from "./LocalGraph";
import { getLocalGraph } from "@/lib/graph";

interface PaneProps {
  note: NoteWithLinks;
  index: number;
  isActive: boolean;
  config: NexusConfig;
  allNotes: Note[];
  onLinkClick: (slug: string) => void;
  onClose: () => void;
  onSave: (content: string) => void;
  onTitleChange?: (newTitle: string) => void;
  onCreateNote?: (title: string) => void;
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
  const graphHeight = config.layout.graph?.height ?? 200;

  // Compute local graph data for this note
  const localGraph = useMemo(() => {
    if (!showLocalGraph || !allNotes.length) {
      return { nodes: [], edges: [] };
    }
    return getLocalGraph(note.slug, allNotes);
  }, [showLocalGraph, note.slug, allNotes]);

  return (
    <article
      className={`flex flex-col h-full border-r border-white/10 flex-shrink-0 ${
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
      <PaneHeader
        title={note.title}
        config={config}
        onClose={onClose}
        onTitleChange={onTitleChange}
        showClose={index > 0}
      />

      <div className="flex-1 overflow-y-auto">
        <InlineNoteEditor
          content={note.content}
          html={note.html}
          config={config}
          notes={allNotes}
          onSave={onSave}
          onLinkClick={onLinkClick}
          onCreateNote={onCreateNote}
        />
      </div>

      {showBacklinks && (
        <BacklinksPanel
          backlinks={note.backlinks}
          config={config}
          onLinkClick={onLinkClick}
        />
      )}

      {showLocalGraph && localGraph.nodes.length > 0 && (
        <LocalGraph
          graph={localGraph}
          currentSlug={note.slug}
          onNodeClick={onLinkClick}
          expanded={graphExpanded}
          onToggle={() => setGraphExpanded(!graphExpanded)}
          height={graphHeight}
        />
      )}

      {showLinearNav && (
        <LinearNav
          currentSlug={note.slug}
          config={config}
          onNavigate={onLinkClick}
        />
      )}
    </article>
  );
}
