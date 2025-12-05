"use client";

import { useState, useMemo } from "react";
import type { NexusConfig, Note } from "../types";
import { useAuth } from "../hooks";

/**
 * Props for the Sidebar component.
 */
interface SidebarProps {
  /** Application configuration including theme, layout, and feature flags */
  config: NexusConfig;
  /** Array of notes to display in the navigation */
  notes: Note[];
  /** Callback fired when a note is clicked, receives the note's title */
  onPageClick: (title: string) => void;
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
 *   onPageClick={(title) => navigateTo(title)}
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
      <SidebarActions config={config} onNewNote={onNewNote} />

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
  onPageClick: (title: string) => void;
}) {
  const sections = config.navigation?.sections || [];
  const noteMap = new Map(notes.map((n) => [n.title, n]));

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
              {section.pages.map((pageTitle) => {
                const note = noteMap.get(pageTitle);
                return (
                  <button
                    key={pageTitle}
                    onClick={() => onPageClick(pageTitle)}
                    className="w-full text-left px-2 py-1 rounded text-sm hover:bg-white/10 transition-colors truncate"
                    style={{ color: config.theme.colors?.text_muted }}
                  >
                    {note?.title || pageTitle}
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
 * Shows all notes in a simple alphabetical list.
 */
function PersonalNav({
  config,
  notes,
  onPageClick,
}: {
  config: NexusConfig;
  notes: Note[];
  onPageClick: (title: string) => void;
}) {
  // Simple flat alphabetical list
  return (
    <div className="space-y-0.5">
      {notes.map((note) => (
        <button
          key={note.title}
          onClick={() => onPageClick(note.title)}
          className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-white/10 transition-colors truncate"
          style={{ color: config.theme.colors?.text_muted }}
        >
          {note.title}
        </button>
      ))}
    </div>
  );
}

/**
 * Sidebar actions component with auth-aware buttons.
 */
function SidebarActions({
  config,
  onNewNote,
}: {
  config: NexusConfig;
  onNewNote: () => void;
}) {
  const { isAuthenticated, isLoading, canWrite, authMode, logout } = useAuth();

  return (
    <div className="p-3 space-y-2 border-b border-white/10">
      {config.features.search && (
        <button
          className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm hover:bg-white/10 transition-colors"
          style={{ color: config.theme.colors?.text_muted }}
          onClick={() => {
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

      {/* Show New Note only if inline editing is enabled AND user can write */}
      {config.features.inline_editing && canWrite && (
        <button
          onClick={onNewNote}
          className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm hover:bg-white/10 transition-colors"
          style={{ color: config.theme.colors?.text }}
        >
          <PlusIcon />
          <span>New Note</span>
        </button>
      )}

      {config.features.import_export && canWrite && (
        <button
          className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm hover:bg-white/10 transition-colors"
          style={{ color: config.theme.colors?.text_muted }}
          onClick={() => {
            document.dispatchEvent(new CustomEvent("open-import-export"));
          }}
        >
          <ImportExportIcon />
          <span>Import / Export</span>
        </button>
      )}

      {/* Auth actions */}
      {!isLoading && authMode !== "none" && (
        <>
          {isAuthenticated ? (
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm hover:bg-white/10 transition-colors"
              style={{ color: config.theme.colors?.text_muted }}
            >
              <LogoutIcon />
              <span>Sign Out</span>
            </button>
          ) : (
            <a
              href="/auth"
              className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm hover:bg-white/10 transition-colors"
              style={{ color: config.theme.colors?.text_muted }}
            >
              <LoginIcon />
              <span>Sign In</span>
            </a>
          )}
        </>
      )}
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

/** Import/Export icon (arrows up and down) */
function ImportExportIcon() {
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
      <path d="M12 3v12" />
      <path d="m8 11 4 4 4-4" />
      <path d="M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4" />
    </svg>
  );
}

/** Login icon */
function LoginIcon() {
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
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" x2="3" y1="12" y2="12" />
    </svg>
  );
}

/** Logout icon */
function LogoutIcon() {
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}
