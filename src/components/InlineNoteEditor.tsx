"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Note, NexusConfig } from "@/types";
import { WysiwygEditor, WysiwygEditorRef } from "./WysiwygEditor";

interface InlineNoteEditorProps {
  content: string;
  html: string;
  config: NexusConfig;
  notes: Note[];
  onSave: (content: string) => void;
  onLinkClick: (title: string) => void;
  onCreateNote?: (title: string) => void;
}

export function InlineNoteEditor({
  content: initialContent,
  config,
  notes,
  onSave,
  onLinkClick,
  onCreateNote,
}: InlineNoteEditorProps) {
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
        autoFocus={false}
      />
    </div>
  );
}
