"use client";

import type { NexusConfig } from "@/types";

interface PaneHeaderProps {
  title: string;
  mode: "view" | "edit";
  config: NexusConfig;
  onModeChange: (mode: "view" | "edit") => void;
  onClose: () => void;
  showClose?: boolean;
}

export function PaneHeader({
  title,
  mode,
  config,
  onModeChange,
  onClose,
  showClose = true,
}: PaneHeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-4 py-3 border-b border-white/10"
      style={{ backgroundColor: config.theme.colors?.surface }}
    >
      <h1
        className="text-lg font-semibold truncate flex-1 mr-4"
        style={{
          color: config.theme.colors?.text,
          fontFamily: config.theme.fonts?.heading,
        }}
      >
        {title}
      </h1>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onModeChange(mode === "view" ? "edit" : "view")}
          className="p-2 rounded hover:bg-white/10 transition-colors"
          style={{ color: config.theme.colors?.text_muted }}
          aria-label={mode === "view" ? "Edit note" : "View note"}
          title={mode === "view" ? "Edit" : "View"}
        >
          {mode === "view" ? <EditIcon /> : <ViewIcon />}
        </button>

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

function EditIcon() {
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
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function ViewIcon() {
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
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
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
