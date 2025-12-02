"use client";

import { useEffect, useRef } from "react";
import type { NexusConfig } from "@/types";

interface NoteViewerProps {
  html: string;
  config: NexusConfig;
  onLinkClick: (title: string) => void;
}

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

  return (
    <div
      ref={containerRef}
      className="prose prose-invert max-w-none px-6 py-4"
      style={{
        color: config.theme.colors?.text,
        fontFamily: config.theme.fonts?.body,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
