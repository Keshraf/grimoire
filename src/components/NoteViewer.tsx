"use client";

import { useCallback } from "react";
import type { NexusConfig } from "@/types";

interface NoteViewerProps {
  html: string;
  config: NexusConfig;
  onLinkClick: (slug: string) => void;
}

export function NoteViewer({ html, config, onLinkClick }: NoteViewerProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (anchor?.dataset.internal === "true") {
        e.preventDefault();
        const href = anchor.getAttribute("href");
        if (href) {
          // Extract slug from href (removes leading /)
          const slug = href.startsWith("/") ? href.slice(1) : href;
          onLinkClick(slug);
        }
      }
    },
    [onLinkClick]
  );

  return (
    <div
      className="prose prose-invert max-w-none px-6 py-4"
      style={{
        color: config.theme.colors?.text,
        fontFamily: config.theme.fonts?.body,
      }}
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
