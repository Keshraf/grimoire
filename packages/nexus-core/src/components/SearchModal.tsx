"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { NexusConfig, SearchResult, AISearchResult } from "../types";

/**
 * Props for the SearchModal component.
 */
interface SearchModalProps {
  /** Whether the modal is currently visible */
  isOpen: boolean;
  /** Callback fired when the modal should close */
  onClose: () => void;
  /** Callback fired when a search result is selected, receives the note title */
  onSelect: (title: string) => void;
  /** NEXUS configuration object containing feature flags and search settings */
  config: NexusConfig;
}

/**
 * A modal dialog for searching notes with optional AI-powered answers.
 *
 * Provides a command-palette style search interface with debounced queries,
 * keyboard navigation (arrow keys, vim-style Ctrl+N/P), and optional AI
 * integration for question-style queries.
 *
 * @param props - The component props
 * @param props.isOpen - Controls modal visibility
 * @param props.onClose - Handler called when modal should close (Escape key or backdrop click)
 * @param props.onSelect - Handler called with the selected note's title
 * @param props.config - NEXUS config for feature flags (ai_search, search.ai.enabled)
 *
 * @remarks
 * - Search is debounced by 300ms to avoid excessive API calls
 * - AI answers are only fetched for question-style queries (starting with who/what/how/etc. or ending with ?)
 * - Keyboard navigation: Arrow Up/Down or Ctrl+P/N to navigate, Enter to select, Escape to close
 * - Results auto-scroll to keep the selected item visible
 *
 * @example
 * ```tsx
 * <SearchModal
 *   isOpen={showSearch}
 *   onClose={() => setShowSearch(false)}
 *   onSelect={(title) => navigateToNote(title)}
 *   config={nexusConfig}
 * />
 * ```
 */
export function SearchModal({
  isOpen,
  onClose,
  onSelect,
  config,
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [aiAnswer, setAiAnswer] = useState<AISearchResult | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const aiEnabled = config.features.ai_search && config.search?.ai?.enabled;

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setAiAnswer(null);
      setSelectedIndex(0);
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced search
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setAiAnswer(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: searchQuery,
            includeAI: aiEnabled && isQuestion(searchQuery),
          }),
        });

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();
        setResults(data.results || []);
        setAiAnswer(data.aiAnswer || null);
        setSelectedIndex(0);
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to search. Please try again.");
        setResults([]);
        setAiAnswer(null);
      } finally {
        setIsLoading(false);
      }
    },
    [aiEnabled]
  );

  // Handle input change with debounce
  const handleInputChange = (value: string) => {
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const handleSelect = useCallback(
    (title: string) => {
      onSelect(title);
      onClose();
    },
    [onSelect, onClose]
  );

  // Keyboard navigation - handled at container level like cmdk
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Skip if IME composition is in progress
      if (e.nativeEvent.isComposing) return;

      switch (e.key) {
        case "ArrowDown":
        case "n":
          // Support Ctrl+N for vim-style navigation
          if (e.key === "n" && !e.ctrlKey) break;
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
        case "p":
          // Support Ctrl+P for vim-style navigation
          if (e.key === "p" && !e.ctrlKey) break;
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : results.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex].title);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [results, selectedIndex, handleSelect, onClose]
  );

  // Scroll selected item into view
  useEffect(() => {
    const container = resultsRef.current;
    if (!container) return;

    const selectedEl = container.querySelector(
      `[data-index="${selectedIndex}"]`
    );
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal - handles keyboard navigation at root level like cmdk */}
      <div
        className="relative w-full max-w-2xl mx-4 bg-[var(--color-surface,#16213e)] rounded-xl shadow-2xl border border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <SearchIcon className="w-5 h-5 text-[var(--color-text-muted,#a8a6a3)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Search notes..."
            className="flex-1 bg-transparent text-[var(--color-text,#e8e6e3)] placeholder-[var(--color-text-muted,#a8a6a3)] outline-none text-lg"
            aria-label="Search notes"
          />
          {isLoading && <LoadingSpinner />}
        </div>

        {/* Results Container */}
        <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto">
          {/* Error State */}
          {error && (
            <div className="px-4 py-3 text-red-400 text-sm">{error}</div>
          )}

          {/* Empty State */}
          {!query && !isLoading && !error && (
            <div className="px-4 py-8 text-center text-[var(--color-text-muted,#a8a6a3)]">
              <p>Type to search your notes</p>
              {aiEnabled && (
                <p className="text-sm mt-1">
                  Ask a question for AI-powered answers
                </p>
              )}
            </div>
          )}

          {/* AI Answer */}
          {aiAnswer && (
            <div className="px-4 py-3 bg-[var(--color-primary,#7b2cbf)]/10 border-b border-white/10">
              <div className="flex items-center gap-2 text-[var(--color-accent,#c77dff)] text-sm font-medium mb-2">
                <SparklesIcon className="w-4 h-4" />
                AI Answer
              </div>
              <p className="text-[var(--color-text,#e8e6e3)] text-sm leading-relaxed">
                {aiAnswer.answer}
              </p>
              {aiAnswer.sources.length > 0 && (
                <div className="mt-2 text-xs text-[var(--color-text-muted,#a8a6a3)]">
                  Based on:{" "}
                  {aiAnswer.sources.map((s, i) => (
                    <span key={s.title}>
                      {i > 0 && ", "}
                      <button
                        onClick={() => handleSelect(s.title)}
                        className="text-[var(--color-accent,#c77dff)] hover:underline"
                      >
                        {s.title}
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search Results */}
          {results.length > 0 && (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={result.title}
                  data-index={index}
                  onClick={() => handleSelect(result.title)}
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    index === selectedIndex
                      ? "bg-[var(--color-primary,#7b2cbf)]/40 border-l-2 border-[var(--color-accent,#c77dff)]"
                      : "hover:bg-white/5 border-l-2 border-transparent"
                  }`}
                >
                  <div className="font-medium text-[var(--color-text,#e8e6e3)]">
                    {result.title}
                  </div>
                  <div className="text-sm text-[var(--color-text-muted,#a8a6a3)] line-clamp-2 mt-1">
                    {result.excerpt}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {query && !isLoading && results.length === 0 && !error && (
            <div className="px-4 py-8 text-center text-[var(--color-text-muted,#a8a6a3)]">
              No results found for &quot;{query}&quot;
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/10 text-xs text-[var(--color-text-muted,#a8a6a3)] flex gap-4">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Detects whether a search query is phrased as a question.
 *
 * Used to determine if AI-powered answers should be fetched.
 *
 * @param query - The search query string to analyze
 * @returns True if the query appears to be a question
 *
 * @example
 * ```ts
 * isQuestion("how do I authenticate?") // true
 * isQuestion("authentication")          // false
 * ```
 */
function isQuestion(query: string): boolean {
  const questionWords = [
    "what",
    "how",
    "why",
    "when",
    "where",
    "who",
    "which",
    "can",
    "does",
    "is",
    "are",
  ];
  const lowerQuery = query.toLowerCase().trim();
  return (
    lowerQuery.endsWith("?") ||
    questionWords.some((word) => lowerQuery.startsWith(word + " "))
  );
}

/**
 * Magnifying glass icon for the search input.
 * @param props - Component props
 * @param props.className - Optional CSS class names
 */
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

/**
 * Sparkles icon indicating AI-generated content.
 * @param props - Component props
 * @param props.className - Optional CSS class names
 */
function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

/**
 * Animated spinner shown while search results are loading.
 */
function LoadingSpinner() {
  return (
    <svg
      className="w-5 h-5 animate-spin text-[var(--color-accent,#c77dff)]"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
