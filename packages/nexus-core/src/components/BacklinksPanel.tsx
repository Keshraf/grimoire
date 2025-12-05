"use client";

import { useState } from "react";
import type { NexusConfig } from "@/types";

interface BacklinksPanelProps {
  backlinks: string[];
  config: NexusConfig;
  onLinkClick: (title: string) => void;
}

export function BacklinksPanel({
  backlinks,
  config,
  onLinkClick,
}: BacklinksPanelProps) {
  const [expanded, setExpanded] = useState(true);

  if (backlinks.length === 0) return null;

  return (
    <div
      className="rounded-lg border border-white/10"
      style={{ backgroundColor: config.theme.colors?.surface }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors rounded-t-lg"
      >
        <span
          className="text-sm font-medium"
          style={{ color: config.theme.colors?.text }}
        >
          Backlinks ({backlinks.length})
        </span>
        <ChevronIcon expanded={expanded} />
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-1">
          {backlinks.map((title) => (
            <button
              key={title}
              onClick={() => onLinkClick(title)}
              className="block w-full text-left px-2 py-1 text-sm rounded hover:bg-white/10 transition-colors truncate"
              style={{ color: config.theme.colors?.accent }}
            >
              {title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.2s",
      }}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
