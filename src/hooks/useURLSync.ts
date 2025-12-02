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
 * Hook to restore navigation state from URL on initial page load.
 *
 * Note: This hook only parses the URL on mount. It does NOT sync state
 * changes back to the URL. Navigation within the app is purely state-based.
 */
export function useURLSync(): void {
  const { dispatch } = useNavigation();
  const isInitialized = useRef(false);

  // Restore from URL on mount (runs once)
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    if (typeof window === "undefined") return;

    const titles = parseURLToTitles(window.location.search);

    if (titles.length > 0) {
      dispatch({ type: "RESTORE_FROM_URL", titles });
    }
  }, [dispatch]);
}
