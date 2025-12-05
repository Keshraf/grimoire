"use client";

import { useEffect, useRef } from "react";
import type { NexusConfig } from "../types";

/**
 * Props for the NoteViewer component.
 */
interface NoteViewerProps {
  /** Pre-rendered HTML content to display */
  html: string;
  /** NEXUS configuration for theming and styling */
  config: NexusConfig;
  /** Callback fired when an internal wikilink is clicked */
  onLinkClick: (title: string) => void;
}

/**
 * Renders pre-rendered HTML note content with interactive wikilink support.
 *
 * Displays markdown-converted HTML and intercepts clicks on internal link buttons
 * (marked with `data-internal="true"`) to enable navigation between notes.
 * Automatically adapts prose styling based on the configured theme preset.
 *
 * @param props - Component props
 * @param props.html - Pre-rendered HTML string to display
 * @param props.config - NEXUS configuration object for theme colors and fonts
 * @param props.onLinkClick - Handler called with the target note title when a wikilink is clicked
 *
 * @remarks
 * Internal links must be rendered as `<button data-internal="true" data-title="Note Title">` elements
 * for click interception to work. The component uses event delegation on the container.
 *
 * @example
 * ```tsx
 * <NoteViewer
 *   html="<p>Check out [[Other Note]]</p>"
 *   config={nexusConfig}
 *   onLinkClick={(title) => openNote(title)}
 * />
 * ```
 */
export function NoteViewer({ html, config, onLinkClick }: NoteViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle clicks on internal link buttons
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button[data-internal="true"]');

      if (button) {
        e.preventDefault();
        e.stopPropagation();

        const title = button.getAttribute("data-title");
        if (title) {
          onLinkClick(title);
        }
      }
    };

    container.addEventListener("click", handleClick);

    return () => {
      container.removeEventListener("click", handleClick);
    };
  }, [onLinkClick]);

  const isLightTheme = config.theme.preset === "light";

  return (
    <div
      ref={containerRef}
      className={`tiptap prose max-w-none px-6 py-4 ${
        isLightTheme ? "prose-slate" : "prose-invert"
      }`}
      style={{
        color: config.theme.colors?.text,
        fontFamily: config.theme.fonts?.body,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
