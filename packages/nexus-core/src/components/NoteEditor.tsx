"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Note, NexusConfig } from "@/types";
import { WysiwygEditor, WysiwygEditorRef } from "./WysiwygEditor";

// Minimal theme config for standalone editor usage
interface EditorThemeConfig {
  colors?: {
    text?: string;
    background?: string;
    primary?: string;
    accent?: string;
  };
  fonts?: {
    body?: string;
    heading?: string;
  };
}

interface NoteEditorProps {
  /** Initial markdown content */
  content: string;
  /** Called on every content change */
  onChange: (content: string) => void;
  /** Called when user saves (Cmd+S) */
  onSave: () => void;
  /** Called when user cancels (Escape outside autocomplete) */
  onCancel: () => void;
  /** List of existing notes for autocomplete */
  notes: Note[];
  /** Optional: callback when user wants to create a new note from autocomplete */
  onCreateNote?: (title: string) => void;
  /** Config for theming - accepts full NexusConfig or minimal theme config */
  config?: NexusConfig | { theme: EditorThemeConfig };
}

const defaultThemeConfig = {
  theme: {
    colors: {
      text: "#e8e6e3",
      background: "#0a0a0f",
      primary: "#7b2cbf",
      accent: "#c77dff",
    },
    fonts: {
      body: "Inter, sans-serif",
      heading: "Cinzel, serif",
    },
  },
};

export function NoteEditor({
  content,
  onChange,
  onSave,
  onCancel,
  notes,
  onCreateNote,
  config = defaultThemeConfig,
}: NoteEditorProps) {
  const editorRef = useRef<WysiwygEditorRef>(null);

  // Handle save with debounce tracking
  const handleContentChange = useCallback(
    (newContent: string) => {
      onChange(newContent);
    },
    [onChange]
  );

  // Keyboard shortcuts: Cmd+S to save, Escape to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        onSave();
        return;
      }

      // Escape to cancel (handled at document level for modal)
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSave, onCancel]);

  // Placeholder link click handler (in modal editor, might want different behavior)
  const handleLinkClick = useCallback((slug: string) => {
    // In modal mode, we might want to just insert the link or ignore
    console.log("Link clicked in modal editor:", slug);
  }, []);

  return (
    <div className="relative flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/20">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/50">Editing</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            className="px-3 py-1 text-xs rounded bg-purple-600 hover:bg-purple-500 text-white transition-colors"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1 text-xs rounded bg-white/10 hover:bg-white/20 text-white/70 transition-colors"
          >
            Cancel
          </button>
          <span className="text-xs text-white/30 ml-2">Cmd+S to save, Esc to cancel</span>
        </div>
      </div>

      {/* WYSIWYG Editor */}
      <div className="flex-1 overflow-y-auto">
        <WysiwygEditor
          ref={editorRef}
          content={content}
          config={config}
          notes={notes}
          onSave={handleContentChange}
          onLinkClick={handleLinkClick}
          onCreateNote={onCreateNote}
          autoFocus={true}
        />
      </div>
    </div>
  );
}
