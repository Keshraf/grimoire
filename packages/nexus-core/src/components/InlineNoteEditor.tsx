"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Note, NexusConfig } from "../types";
import { WysiwygEditor, WysiwygEditorRef } from "./WysiwygEditor";
import { NoteViewer } from "./NoteViewer";

/**
 * Props for the InlineNoteEditor component.
 */
interface InlineNoteEditorProps {
  /** Raw markdown content of the note */
  content: string;
  /** Pre-rendered HTML from the markdown content */
  html: string;
  /** Application configuration for theming and features */
  config: NexusConfig;
  /** List of all notes for wikilink autocomplete */
  notes: Note[];
  /** Callback fired when content is saved */
  onSave: (content: string) => void;
  /** Callback fired when a wikilink is clicked */
  onLinkClick: (title: string) => void;
  /** Optional callback to create a new note from a wikilink */
  onCreateNote?: (title: string) => void;
}

/**
 * A dual-mode note editor that displays rendered markdown by default and
 * switches to a WYSIWYG editor on double-click.
 *
 * @remarks
 * This component implements a "click-to-edit" pattern where notes are displayed
 * as rendered HTML for optimal reading, but can be edited inline by double-clicking.
 * The editing state is managed internally, and content changes are synced via the
 * `onSave` callback. External content updates (e.g., from other panes) are detected
 * and applied to the editor.
 *
 * @param props - The component props
 * @param props.content - Raw markdown content of the note
 * @param props.html - Pre-rendered HTML from the markdown content
 * @param props.config - Application configuration for theming and features
 * @param props.notes - List of all notes for wikilink autocomplete
 * @param props.onSave - Callback fired when content is saved
 * @param props.onLinkClick - Callback fired when a wikilink is clicked
 * @param props.onCreateNote - Optional callback to create a new note from a wikilink
 *
 * @example
 * ```tsx
 * <InlineNoteEditor
 *   content={note.content}
 *   html={renderedHtml}
 *   config={nexusConfig}
 *   notes={allNotes}
 *   onSave={(newContent) => updateNote(note.id, newContent)}
 *   onLinkClick={(title) => navigateToNote(title)}
 *   onCreateNote={(title) => createNewNote(title)}
 * />
 * ```
 */
export function InlineNoteEditor({
  content: initialContent,
  html,
  config,
  notes,
  onSave,
  onLinkClick,
  onCreateNote,
}: InlineNoteEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef<WysiwygEditorRef>(null);
  const contentRef = useRef(initialContent);

  // Update content when prop changes from external source
  useEffect(() => {
    if (initialContent !== contentRef.current) {
      contentRef.current = initialContent;
      editorRef.current?.setContent(initialContent);
    }
  }, [initialContent]);

  const handleSave = useCallback(
    (newContent: string) => {
      contentRef.current = newContent;
      onSave(newContent);
    },
    [onSave]
  );

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  // If editing, show the WYSIWYG editor
  if (isEditing) {
    return (
      <div className="relative h-full">
        <WysiwygEditor
          ref={editorRef}
          content={initialContent}
          config={config}
          notes={notes}
          onSave={handleSave}
          onLinkClick={onLinkClick}
          onCreateNote={onCreateNote}
          autoFocus={true}
        />
      </div>
    );
  }

  // Default: show the pre-rendered HTML using NoteViewer (proper markdown rendering)
  return (
    <div
      className="relative h-full cursor-text"
      onDoubleClick={handleDoubleClick}
      title="Double-click to edit"
    >
      <NoteViewer html={html} config={config} onLinkClick={onLinkClick} />
    </div>
  );
}
