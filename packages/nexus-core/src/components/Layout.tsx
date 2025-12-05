"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import type { NexusConfig, Note } from "../types";
import { Sidebar } from "./Sidebar";
import { ImportExportModal } from "./ImportExportModal";

/** Theme preset to CSS file path mapping */
const THEME_PRESETS: Record<string, string> = {
  dark: "/themes/dark.css",
  light: "/themes/light.css",
  arcana: "/themes/arcana.css",
  codex: "/themes/codex.css",
};

/**
 * Props for the Layout component.
 */
interface LayoutProps {
  /** Application configuration including theme, layout, and feature settings */
  config: NexusConfig;
  /** Array of all notes for sidebar navigation */
  notes: Note[];
  /** Main content to render in the layout */
  children: ReactNode;
  /** Callback when a note/page is clicked in the sidebar */
  onPageClick: (slug: string) => void;
  /** Callback to create a new note */
  onNewNote: () => void;
}

/**
 * Main application layout component that orchestrates theming, sidebar, and content areas.
 *
 * Handles dynamic theme loading based on preset selection (dark, light, arcana, codex, system),
 * applies config-based color/font overrides, and manages responsive sidebar behavior.
 *
 * @param props - The component props
 * @param props.config - Application configuration from nexus.config.yaml
 * @param props.notes - All notes for sidebar navigation
 * @param props.children - Main content area (typically StackContainer with panes)
 * @param props.onPageClick - Handler for note selection in sidebar
 * @param props.onNewNote - Handler for creating new notes
 *
 * @remarks
 * Theme loading follows a layered approach:
 * 1. Load preset theme CSS file (dark/light/arcana/codex)
 * 2. Apply config.theme.colors overrides as inline CSS variables
 * 3. Apply config.theme.fonts overrides as inline CSS variables
 * 4. Load custom_css file if specified (loaded last for full override capability)
 *
 * When preset is "system", the component listens for OS color scheme changes
 * and automatically switches between dark/light themes.
 *
 * @example
 * ```tsx
 * <Layout
 *   config={nexusConfig}
 *   notes={allNotes}
 *   onPageClick={(slug) => navigation.openPane(slug)}
 *   onNewNote={() => createNote()}
 * >
 *   <StackContainer panes={openPanes} />
 * </Layout>
 * ```
 */
export function Layout({
  config,
  notes,
  children,
  onPageClick,
  onNewNote,
}: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [importExportOpen, setImportExportOpen] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<string>("dark");

  const sidebarPosition = config.layout.sidebar.position;
  const sidebarHidden = sidebarPosition === "hidden";

  // Load theme CSS file dynamically
  const loadThemeCSS = useCallback((themePath: string, linkId: string) => {
    // Remove existing theme link if present
    const existingLink = document.getElementById(linkId);
    if (existingLink) {
      existingLink.remove();
    }

    // Create and inject new link element
    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = themePath;
    link.onerror = () => {
      console.warn(`[Theme] Failed to load theme CSS: ${themePath}`);
    };
    document.head.appendChild(link);
  }, []);

  // Detect system color scheme preference
  const getSystemPreference = useCallback((): "dark" | "light" => {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }, []);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Listen for import/export modal trigger
  useEffect(() => {
    const handleOpenImportExport = () => setImportExportOpen(true);
    document.addEventListener("open-import-export", handleOpenImportExport);
    return () =>
      document.removeEventListener(
        "open-import-export",
        handleOpenImportExport
      );
  }, []);

  // Load preset theme CSS
  useEffect(() => {
    const preset = config.theme.preset;
    let themeToLoad = preset;

    // Handle system preference
    if (preset === "system") {
      themeToLoad = getSystemPreference();
    }

    // Validate preset and fallback to dark if invalid
    if (!THEME_PRESETS[themeToLoad]) {
      console.warn(
        `[Theme] Unknown preset "${preset}", falling back to "dark"`
      );
      themeToLoad = "dark";
    }

    setResolvedTheme(themeToLoad);
    loadThemeCSS(THEME_PRESETS[themeToLoad], "nexus-theme");
  }, [config.theme.preset, getSystemPreference, loadThemeCSS]);

  // Listen for system preference changes when preset is "system"
  useEffect(() => {
    if (config.theme.preset !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? "dark" : "light";
      setResolvedTheme(newTheme);
      loadThemeCSS(THEME_PRESETS[newTheme], "nexus-theme");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [config.theme.preset, loadThemeCSS]);

  // Load custom CSS if specified
  useEffect(() => {
    const customCss = config.theme.custom_css;
    if (!customCss) {
      // Remove custom CSS link if it exists
      const existingLink = document.getElementById("nexus-custom-css");
      if (existingLink) existingLink.remove();
      return;
    }

    loadThemeCSS(customCss, "nexus-custom-css");
  }, [config.theme.custom_css, loadThemeCSS]);

  // Apply config color and font overrides as inline CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const colors = config.theme.colors;
    const fonts = config.theme.fonts;

    if (colors) {
      if (colors.primary)
        root.style.setProperty("--color-primary", colors.primary);
      if (colors.secondary)
        root.style.setProperty("--color-secondary", colors.secondary);
      if (colors.accent)
        root.style.setProperty("--color-accent", colors.accent);
      if (colors.background)
        root.style.setProperty("--color-background", colors.background);
      if (colors.surface)
        root.style.setProperty("--color-surface", colors.surface);
      if (colors.text) root.style.setProperty("--color-text", colors.text);
      if (colors.text_muted)
        root.style.setProperty("--color-text-muted", colors.text_muted);
    }

    if (fonts) {
      if (fonts.heading)
        root.style.setProperty("--font-heading", fonts.heading);
      if (fonts.body) root.style.setProperty("--font-body", fonts.body);
      if (fonts.code) root.style.setProperty("--font-code", fonts.code);
    }
  }, [config.theme, resolvedTheme]);

  const handlePageClick = (slug: string) => {
    onPageClick(slug);
    if (isMobile) setMobileMenuOpen(false);
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  // Build layout classes based on sidebar position
  const layoutClasses = [
    "h-screen w-screen overflow-hidden flex",
    sidebarPosition === "right" ? "flex-row-reverse" : "flex-row",
  ].join(" ");

  return (
    <div
      className={layoutClasses}
      style={{
        backgroundColor: config.theme.colors?.background,
        color: config.theme.colors?.text,
        fontFamily: config.theme.fonts?.body,
      }}
    >
      {/* Mobile menu button */}
      {isMobile && !sidebarHidden && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/10 backdrop-blur-sm"
          aria-label="Toggle menu"
        >
          <MenuIcon />
        </button>
      )}

      {/* Mobile overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      {!sidebarHidden && (
        <div
          className={
            isMobile
              ? `fixed inset-y-0 left-0 z-50 transition-transform duration-300 ${
                  mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                }`
              : ""
          }
        >
          <Sidebar
            config={config}
            notes={notes}
            onPageClick={handlePageClick}
            onNewNote={onNewNote}
            collapsed={!isMobile && sidebarCollapsed}
            onToggleCollapse={
              config.layout.sidebar.collapsible ? toggleSidebar : undefined
            }
          />
        </div>
      )}

      {/* Main content area */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden">
        {children}
      </main>

      {/* Import/Export Modal */}
      {config.features.import_export && (
        <ImportExportModal
          isOpen={importExportOpen}
          onClose={() => setImportExportOpen(false)}
        />
      )}
    </div>
  );
}

/** Hamburger menu icon for mobile sidebar toggle */
function MenuIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}
