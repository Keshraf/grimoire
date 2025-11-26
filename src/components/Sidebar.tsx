"use client";

import { useState, useMemo } from "react";
import type { NexusConfig, Note } from "@/types";

/**
 * Props for the Sidebar component.
 */
interface SidebarProps {
  /** Application configuration including theme, layout, and feature flags */
  config: NexusConfig;
  /** Array of notes to display in the navigation */
  notes: Note[];
  /** Callback fired when a note is clicked, receives the note's slug */
  onPageClick: (slug: string) => void;
  /** Callback fired when the "New Note" button is clicked */
  onNewNote: () => void;
  /** Whether the sidebar is in collapsed state (shows only icons) */
  collapsed?: boolean;
  /** Callback to toggle the sidebar collapsed state */
  onToggleCollapse?: () => void;
}

/**
 * Collapsible sidebar navigation component for the NEXUS knowledge base.
 *
 * Renders differently based on the app mode:
 * - Documentation mode: Shows structured sections defined in config
 * - Personal mode: Groups notes by tags or displays a flat alphabetical list
 *
 * @remarks
 * The sidebar maintains its own expanded/collapsed section state internally.
 * In documentation mode, sections are defined via `config.navigation.sections`.
 * In personal mode, notes are grouped by tags when `config.features.tags` is enabled.
 *
 * @example
 * ```tsx
 * <Sidebar
 *   config={nexusConfig}
 *   notes={allNotes}
 *   onPageClick={(slug) => navigateTo(slug)}
 *   onNewNote={() => openNewNoteModal()}
 *   collapsed={false}
 *   onToggleCollapse={() => setCollapsed(!collapsed)}
 * />
 * ```
 */
export function Sidebar({
  config,
  notes,
  onPageClick,
  onNewNote,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(config.navigation?.sections?.map((s) => s.title) || [])
  );

  const isDocMode = config.mode === "documentation";
  const sidebarWidth = config.layout.sidebar.width;

  // Group notes by tags for personal mode
  const notesByTag = useMemo(() => {
    if (isDocMode || !config.features.tags) return null;

    const grouped: Record<string, Note[]> = { Untagged: [] };
    notes.forEach((note) => {
      if (note.tags.length === 0) {
        grouped.Untagged.push(note);
      } else {
        note.tags.forEach((tag) => {
          if (!grouped[tag]) grouped[tag] = [];
          grouped[tag].push(note);
        });
      }
    });
    return grouped;
  }, [notes, isDocMode, config.features.tags]);

  // Sorted notes for flat list
  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => a.title.localeCompare(b.title)),
    [notes]
  );

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  if (collapsed) {
    return (
      <aside
        className="h-full flex flex-col items-center py-4 border-r border-white/10"
        style={{ width: 48, backgroundColor: config.theme.colors?.surface }}
      >
        {config.layout.sidebar.collapsible && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded hover:bg-white/10 transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRightIcon />
          </button>
        )}
      </aside>
    );
  }

  return (
    <aside
      className="h-full flex flex-col border-r border-white/10 overflow-hidden"
      style={{
        width: sidebarWidth,
        backgroundColor: config.theme.colors?.surface,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          {config.site.logo && (
            <img
              src={config.site.logo}
              alt=""
              className="w-6 h-6 flex-shrink-0"
            />
          )}
          <span
            className="font-semibold truncate"
            style={{
              color: config.theme.colors?.text,
              fontFamily: config.theme.fonts?.heading,
            }}
          >
            {config.site.title}
          </span>
        </div>
        {config.layout.sidebar.collapsible && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label="Collapse sidebar"
          >
            <ChevronLeftIcon />
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 space-y-2 border-b border-white/10">
        {config.features.search && (
          <button
            className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm hover:bg-white/10 transition-colors"
            style={{ color: config.theme.colors?.text_muted }}
            onClick={() => {
              // Trigger Cmd+K search modal
              document.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", metaKey: true })
              );
            }}
          >
            <SearchIcon />
            <span className="flex-1 text-left">Search</span>
            <kbd className="text-xs opacity-60">⌘K</kbd>
          </button>
        )}
        <button
          onClick={onNewNote}
          className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm hover:bg-white/10 transition-colors"
          style={{ color: config.theme.colors?.text }}
        >
          <PlusIcon />
          <span>New Note</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        {isDocMode ? (
          <DocumentationNav
            config={config}
            notes={notes}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            onPageClick={onPageClick}
          />
        ) : (
          <PersonalNav
            config={config}
            notes={sortedNotes}
            notesByTag={notesByTag}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            onPageClick={onPageClick}
          />
        )}
      </nav>
    </aside>
  );
}

/**
 * Navigation component for documentation mode.
 * Renders collapsible sections with pages as defined in the config.
 */
function DocumentationNav({
  config,
  notes,
  expandedSections,
  toggleSection,
  onPageClick,
}: {
  config: NexusConfig;
  notes: Note[];
  expandedSections: Set<string>;
  toggleSection: (title: string) => void;
  onPageClick: (slug: string) => void;
}) {
  const sections = config.navigation?.sections || [];
  const noteMap = new Map(notes.map((n) => [n.slug, n]));

  return (
    <div className="space-y-1">
      {sections.map((section) => (
        <div key={section.title}>
          <button
            onClick={() => toggleSection(section.title)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm font-medium hover:bg-white/10 transition-colors"
            style={{ color: config.theme.colors?.text }}
          >
            <span
              className="transition-transform"
              style={{
                transform: expandedSections.has(section.title)
                  ? "rotate(90deg)"
                  : "rotate(0deg)",
              }}
            >
              <ChevronRightIcon size={14} />
            </span>
            {section.title}
          </button>
          {expandedSections.has(section.title) && (
            <div className="ml-4 mt-1 space-y-0.5">
              {section.pages.map((slug) => {
                const note = noteMap.get(slug);
                return (
                  <button
                    key={slug}
                    onClick={() => onPageClick(slug)}
                    className="w-full text-left px-2 py-1 rounded text-sm hover:bg-white/10 transition-colors truncate"
                    style={{ color: config.theme.colors?.text_muted }}
                  >
                    {note?.title || slug}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Navigation component for personal mode.
 * Groups notes by tags when enabled, otherwise displays a flat alphabetical list.
 */
function PersonalNav({
  config,
  notes,
  notesByTag,
  expandedSections,
  toggleSection,
  onPageClick,
}: {
  config: NexusConfig;
  notes: Note[];
  notesByTag: Record<string, Note[]> | null;
  expandedSections: Set<string>;
  toggleSection: (title: string) => void;
  onPageClick: (slug: string) => void;
}) {
  // If tags are enabled and we have grouped notes
  if (notesByTag && config.features.tags) {
    const tags = Object.keys(notesByTag).sort((a, b) => {
      if (a === "Untagged") return 1;
      if (b === "Untagged") return -1;
      return a.localeCompare(b);
    });

    return (
      <div className="space-y-1">
        {tags.map((tag) => {
          const tagNotes = notesByTag[tag];
          if (tagNotes.length === 0) return null;

          return (
            <div key={tag}>
              <button
                onClick={() => toggleSection(tag)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm font-medium hover:bg-white/10 transition-colors"
                style={{ color: config.theme.colors?.text }}
              >
                <span
                  className="transition-transform"
                  style={{
                    transform: expandedSections.has(tag)
                      ? "rotate(90deg)"
                      : "rotate(0deg)",
                  }}
                >
                  <ChevronRightIcon size={14} />
                </span>
                <TagIcon size={14} />
                {tag}
                <span
                  className="ml-auto text-xs"
                  style={{ color: config.theme.colors?.text_muted }}
                >
                  {tagNotes.length}
                </span>
              </button>
              {expandedSections.has(tag) && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {tagNotes
                    .sort((a, b) => a.title.localeCompare(b.title))
                    .map((note) => (
                      <button
                        key={note.slug}
                        onClick={() => onPageClick(note.slug)}
                        className="w-full text-left px-2 py-1 rounded text-sm hover:bg-white/10 transition-colors truncate"
                        style={{ color: config.theme.colors?.text_muted }}
                      >
                        {note.title}
                      </button>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Flat alphabetical list
  return (
    <div className="space-y-0.5">
      {notes.map((note) => (
        <button
          key={note.slug}
          onClick={() => onPageClick(note.slug)}
          className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-white/10 transition-colors truncate"
          style={{ color: config.theme.colors?.text_muted }}
        >
          {note.title}
        </button>
      ))}
    </div>
  );
}

/** Search icon (magnifying glass) */
function SearchIcon() {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

/** Plus icon for "New Note" action */
function PlusIcon() {
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
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/** Left chevron icon for collapsing sidebar */
function ChevronLeftIcon() {
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
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

/** Right chevron icon for expanding sections/sidebar */
function ChevronRightIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
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

/** Tag icon for tag-grouped navigation */
function TagIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  );
}
