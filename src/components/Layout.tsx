"use client";

import { useState, useEffect, type ReactNode } from "react";
import type { NexusConfig, Note } from "@/types";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  config: NexusConfig;
  notes: Note[];
  children: ReactNode;
  onPageClick: (slug: string) => void;
  onNewNote: () => void;
}

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

  const sidebarPosition = config.layout.sidebar.position;
  const sidebarHidden = sidebarPosition === "hidden";

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

  // Apply theme CSS variables
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
  }, [config.theme]);

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
    </div>
  );
}

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
