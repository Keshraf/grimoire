"use client";

import type { NexusConfig } from "@/types";

interface LinearNavProps {
  currentTitle: string;
  config: NexusConfig;
  onNavigate: (title: string) => void;
}

export function LinearNav({ currentTitle, config, onNavigate }: LinearNavProps) {
  const sections = config.navigation?.sections || [];

  // Build flat list of all pages in order
  const allPages: string[] = [];
  sections.forEach((section) => {
    section.pages.forEach((page) => allPages.push(page));
  });

  const currentIndex = allPages.indexOf(currentTitle);
  if (currentIndex === -1) return null;

  const prevTitle = currentIndex > 0 ? allPages[currentIndex - 1] : null;
  const nextTitle =
    currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;

  if (!prevTitle && !nextTitle) return null;

  return (
    <nav
      className="flex items-center justify-between px-4 py-3 border-t border-white/10"
      style={{ backgroundColor: config.theme.colors?.surface }}
    >
      {prevTitle ? (
        <button
          onClick={() => onNavigate(prevTitle)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded hover:bg-white/10 transition-colors"
          style={{ color: config.theme.colors?.text_muted }}
        >
          <ChevronLeftIcon />
          <span className="truncate max-w-[120px]">{prevTitle}</span>
        </button>
      ) : (
        <div />
      )}

      {nextTitle ? (
        <button
          onClick={() => onNavigate(nextTitle)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded hover:bg-white/10 transition-colors"
          style={{ color: config.theme.colors?.text_muted }}
        >
          <span className="truncate max-w-[120px]">{nextTitle}</span>
          <ChevronRightIcon />
        </button>
      ) : (
        <div />
      )}
    </nav>
  );
}

function ChevronLeftIcon() {
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
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
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
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
