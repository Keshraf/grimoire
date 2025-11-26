"use client";

import { useState, useCallback } from "react";
import type { Note, NoteWithLinks, NexusConfig } from "@/types";
import { PaneHeader } from "./PaneHeader";
import { NoteViewer } from "./NoteViewer";
import { NoteEditor } from "./NoteEditor";
import { BacklinksPanel } from "./BacklinksPanel";
import { LinearNav } from "./LinearNav";

interface PaneProps {
  note: NoteWithLinks;
  index: number;
  isActive: boolean;
  mode: "view" | "edit";
  config: NexusConfig;
  allNotes: Note[];
  onLinkClick: (slug: string) => void;
  onClose: () => void;
  onModeChange: (mode: "view" | "edit") => void;
  onSave: (content: string) => void;
  onCreateNote?: (title: string) => void;
}

export function Pane({
  note,
  index,
  isActive,
  mode,
  config,
  allNotes,
  onLinkClick,
  onClose,
  onModeChange,
  onSave,
  onCreateNote,
}: PaneProps) {
  const [editContent, setEditContent] = useState(note.content);

  const paneWidth = config.layout.pane.width;
  const minWidth = config.layout.pane.min_width || 400;
  const maxWidth = config.layout.pane.max_width || 800;
  const showBacklinks = config.features.backlinks_panel;
  const showLinearNav =
    config.features.linear_nav && config.mode === "documentation";

  const handleSave = useCallback(() => {
    onSave(editContent);
  }, [editContent, onSave]);

  const handleCancel = useCallback(() => {
    setEditContent(note.content);
    onModeChange("view");
  }, [note.content, onModeChange]);

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
          // @ts-expect-error ringColor is a Tailwind CSS variable
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
        mode={mode}
        config={config}
        onModeChange={onModeChange}
        onClose={onClose}
        showClose={index > 0}
      />

      <div className="flex-1 overflow-y-auto">
        {mode === "view" ? (
          <NoteViewer
            html={note.html}
            config={config}
            onLinkClick={onLinkClick}
          />
        ) : (
          <NoteEditor
            content={editContent}
            onChange={setEditContent}
            onSave={handleSave}
            onCancel={handleCancel}
            notes={allNotes}
            onCreateNote={onCreateNote}
          />
        )}
      </div>

      {showBacklinks && mode === "view" && (
        <BacklinksPanel
          backlinks={note.backlinks}
          config={config}
          onLinkClick={onLinkClick}
        />
      )}

      {showLinearNav && mode === "view" && (
        <LinearNav
          currentSlug={note.slug}
          config={config}
          onNavigate={onLinkClick}
        />
      )}
    </article>
  );
}
