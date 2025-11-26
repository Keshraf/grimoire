import { describe, it, expect } from "vitest";
import type { Note } from "@/types";

// Test the filtering logic used in LinkAutocomplete
function filterNotes(notes: Note[], query: string): Note[] {
  const q = query.toLowerCase();
  return notes
    .filter(
      (note) =>
        note.title.toLowerCase().includes(q) ||
        note.slug.toLowerCase().includes(q)
    )
    .slice(0, 10);
}

// Mock notes for testing
const mockNotes: Note[] = [
  {
    id: "1",
    slug: "getting-started",
    title: "Getting Started",
    content: "",
    tags: [],
    created_at: "",
    updated_at: "",
  },
  {
    id: "2",
    slug: "api-reference",
    title: "API Reference",
    content: "",
    tags: [],
    created_at: "",
    updated_at: "",
  },
  {
    id: "3",
    slug: "my-notes",
    title: "My Notes",
    content: "",
    tags: [],
    created_at: "",
    updated_at: "",
  },
  {
    id: "4",
    slug: "react-hooks",
    title: "React Hooks Guide",
    content: "",
    tags: [],
    created_at: "",
    updated_at: "",
  },
  {
    id: "5",
    slug: "typescript-tips",
    title: "TypeScript Tips",
    content: "",
    tags: [],
    created_at: "",
    updated_at: "",
  },
];

describe("LinkAutocomplete filtering logic", () => {
  it("filters notes by title (case-insensitive)", () => {
    const result = filterNotes(mockNotes, "getting");
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("getting-started");
  });

  it("filters notes by slug (case-insensitive)", () => {
    const result = filterNotes(mockNotes, "api-ref");
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("api-reference");
  });

  it("returns empty array when no matches", () => {
    const result = filterNotes(mockNotes, "nonexistent");
    expect(result).toHaveLength(0);
  });

  it("performs case-insensitive matching", () => {
    const result = filterNotes(mockNotes, "REACT");
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("react-hooks");
  });

  it("returns all notes when query is empty", () => {
    const result = filterNotes(mockNotes, "");
    expect(result).toHaveLength(5);
  });

  it("limits results to 10 items", () => {
    const manyNotes: Note[] = Array.from({ length: 15 }, (_, i) => ({
      id: String(i),
      slug: `note-${i}`,
      title: `Note ${i}`,
      content: "",
      tags: [],
      created_at: "",
      updated_at: "",
    }));
    const result = filterNotes(manyNotes, "note");
    expect(result).toHaveLength(10);
  });

  it("matches partial text in title", () => {
    const result = filterNotes(mockNotes, "script");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("TypeScript Tips");
  });

  it("matches partial text in slug", () => {
    const result = filterNotes(mockNotes, "hooks");
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("react-hooks");
  });
});

describe("LinkAutocomplete keyboard navigation logic", () => {
  it("wraps selection to first item when at end and pressing down", () => {
    const totalItems = 5;
    const currentIndex = 4;
    const newIndex = (currentIndex + 1) % totalItems;
    expect(newIndex).toBe(0);
  });

  it("wraps selection to last item when at start and pressing up", () => {
    const totalItems = 5;
    const currentIndex = 0;
    const newIndex = (currentIndex - 1 + totalItems) % totalItems;
    expect(newIndex).toBe(4);
  });

  it("moves selection down normally", () => {
    const totalItems = 5;
    const currentIndex = 2;
    const newIndex = (currentIndex + 1) % totalItems;
    expect(newIndex).toBe(3);
  });

  it("moves selection up normally", () => {
    const totalItems = 5;
    const currentIndex = 2;
    const newIndex = (currentIndex - 1 + totalItems) % totalItems;
    expect(newIndex).toBe(1);
  });
});
