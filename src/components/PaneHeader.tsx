"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { NexusConfig } from "@/types";
import { PaneMenu } from "./PaneMenu";

interface PaneHeaderProps {
  title: string;
  config: NexusConfig;
  onClose: () => void;
  onTitleChange?: (newTitle: string) => void;
  onDelete?: () => void;
  showClose?: boolean;
}

export function PaneHeader({
  title,
  config,
  onClose,
  onTitleChange,
  onDelete,
  showClose = true,
}: PaneHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update edited title when prop changes
  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleDoubleClick = useCallback(() => {
    if (onTitleChange) {
      setIsEditingTitle(true);
    }
  }, [onTitleChange]);

  const handleTitleSave = useCallback(() => {
    const trimmedTitle = editedTitle.trim();
    if (trimmedTitle && trimmedTitle !== title && onTitleChange) {
      onTitleChange(trimmedTitle);
    } else {
      setEditedTitle(title);
    }
    setIsEditingTitle(false);
  }, [editedTitle, title, onTitleChange]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleTitleSave();
      } else if (e.key === "Escape") {
        setEditedTitle(title);
        setIsEditingTitle(false);
      }
    },
    [handleTitleSave, title]
  );

  return (
    <header
      className="flex items-center justify-between px-4 py-3 border-b border-white/10"
      style={{ backgroundColor: config.theme.colors?.surface }}
    >
      {isEditingTitle ? (
        <input
          ref={inputRef}
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onBlur={handleTitleSave}
          onKeyDown={handleTitleKeyDown}
          className="text-lg font-semibold flex-1 mr-4 bg-transparent border-b-2 border-white/30 focus:border-white/60 outline-none"
          style={{
            color: config.theme.colors?.text,
            fontFamily: config.theme.fonts?.heading,
          }}
        />
      ) : (
        <h1
          className="text-lg font-semibold truncate flex-1 mr-4 cursor-pointer hover:opacity-80"
          style={{
            color: config.theme.colors?.text,
            fontFamily: config.theme.fonts?.heading,
          }}
          onDoubleClick={handleTitleDoubleClick}
          title={onTitleChange ? "Double-click to rename" : undefined}
        >
          {title}
        </h1>
      )}

      <div className="flex items-center gap-1">
        <PaneMenu
          onDelete={onDelete}
          textColor={config.theme.colors?.text_muted}
        />
        {showClose && (
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-white/10 transition-colors"
            style={{ color: config.theme.colors?.text_muted }}
            aria-label="Close pane"
            title="Close"
          >
            <CloseIcon />
          </button>
        )}
      </div>
    </header>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
