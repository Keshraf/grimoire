"use client";

import { useEffect, useRef } from "react";
import { useNavigation } from "./useNavigation";

/**
 * Parse URL to extract titles from query params
 * URL format: /?note=Title&stack=Title2,Title3
 */
export function parseURLToTitles(search: string): string[] {
  const titles: string[] = [];
  const params = new URLSearchParams(search);

  // Extract first title from ?note= param
  const firstTitle = params.get("note");
  if (firstTitle) {
    titles.push(decodeURIComponent(firstTitle));
  }

  // Extract additional titles from ?stack= query param
  const stack = params.get("stack");
  if (stack) {
    const additionalTitles = stack.split(",").filter(Boolean).map(t => decodeURIComponent(t));
    titles.push(...additionalTitles);
  }

  return titles;
}

/**
 * Build URL from array of titles
 * Single pane: /?note=Title
 * Multiple panes: /?note=Title&stack=Title2,Title3
 */
export function buildURLFromTitles(titles: string[]): string {
  if (titles.length === 0) {
    return "/";
  }

  const [firstTitle, ...rest] = titles;
  const params = new URLSearchParams();
  params.set("note", firstTitle);

  if (rest.length > 0) {
    params.set("stack", rest.map(t => encodeURIComponent(t)).join(","));
  }

  return `/?${params.toString()}`;
}

/**
 * Hook to sync navigation state with URL
 * - On mount: parse URL and restore state
 * - On state change: update URL without page reload
 */
export function useURLSync(): void {
  const { state, dispatch } = useNavigation();
  const isInitialized = useRef(false);
  const prevTitlesRef = useRef<string[]>([]);

  // Restore from URL on mount
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    if (typeof window === "undefined") return;

    const titles = parseURLToTitles(window.location.search);

    if (titles.length > 0) {
      dispatch({ type: "RESTORE_FROM_URL", titles });
    }
  }, [dispatch]);

  // Sync state changes to URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isInitialized.current) return;

    const currentTitles = state.panes.map((p) => p.title);

    // Skip if titles haven't changed
    if (
      currentTitles.length === prevTitlesRef.current.length &&
      currentTitles.every((t, i) => t === prevTitlesRef.current[i])
    ) {
      return;
    }

    prevTitlesRef.current = currentTitles;

    const newURL = buildURLFromTitles(currentTitles);
    window.history.replaceState(null, "", newURL);
  }, [state.panes]);
}
