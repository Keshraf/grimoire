"use client";

import { useEffect, useRef } from "react";
import { useNavigation } from "./useNavigation.tsx";

/**
 * Parse URL to extract slugs from pathname and search params
 * URL format: /[slug]?stack=slug2,slug3
 */
export function parseURLToSlugs(pathname: string, search: string): string[] {
  const slugs: string[] = [];

  // Extract first slug from pathname (remove leading slash)
  const firstSlug = pathname.replace(/^\//, "").split("/")[0];
  if (firstSlug) {
    slugs.push(firstSlug);
  }

  // Extract additional slugs from ?stack= query param
  const params = new URLSearchParams(search);
  const stack = params.get("stack");
  if (stack) {
    const additionalSlugs = stack.split(",").filter(Boolean);
    slugs.push(...additionalSlugs);
  }

  return slugs;
}

/**
 * Build URL from array of slugs
 * Single pane: /[slug]
 * Multiple panes: /[slug]?stack=slug2,slug3
 */
export function buildURLFromSlugs(slugs: string[]): string {
  if (slugs.length === 0) {
    return "/";
  }

  const [firstSlug, ...rest] = slugs;
  let url = `/${firstSlug}`;

  if (rest.length > 0) {
    url += `?stack=${rest.join(",")}`;
  }

  return url;
}

/**
 * Hook to sync navigation state with URL
 * - On mount: parse URL and restore state
 * - On state change: update URL without page reload
 */
export function useURLSync(): void {
  const { state, dispatch } = useNavigation();
  const isInitialized = useRef(false);
  const prevSlugsRef = useRef<string[]>([]);

  // Restore from URL on mount
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    if (typeof window === "undefined") return;

    const slugs = parseURLToSlugs(
      window.location.pathname,
      window.location.search
    );

    if (slugs.length > 0) {
      dispatch({ type: "RESTORE_FROM_URL", slugs });
    }
  }, [dispatch]);

  // Sync state changes to URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isInitialized.current) return;

    const currentSlugs = state.panes.map((p) => p.slug);

    // Skip if slugs haven't changed
    if (
      currentSlugs.length === prevSlugsRef.current.length &&
      currentSlugs.every((s, i) => s === prevSlugsRef.current[i])
    ) {
      return;
    }

    prevSlugsRef.current = currentSlugs;

    const newURL = buildURLFromSlugs(currentSlugs);
    window.history.replaceState(null, "", newURL);
  }, [state.panes]);
}
