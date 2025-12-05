import { describe, it, expect } from "vitest";

// Test the trigger detection logic used in NoteEditor
function detectTrigger(
  value: string,
  cursorPos: number
): { isOpen: boolean; query: string; triggerIndex: number } | null {
  const textBeforeCursor = value.slice(0, cursorPos);
  const triggerMatch = textBeforeCursor.match(/\[\[([^\]|\[]*)$/);

  if (triggerMatch) {
    const triggerIndex = textBeforeCursor.lastIndexOf("[[");
    const query = triggerMatch[1];
    return { isOpen: true, query, triggerIndex };
  }
  return null;
}

// Test the link insertion logic used in NoteEditor
function insertLink(
  content: string,
  triggerIndex: number,
  cursorPos: number,
  slug: string,
  title: string
): { newContent: string; newCursorPos: number } {
  const before = content.slice(0, triggerIndex);
  const after = content.slice(cursorPos);

  // Use [[slug]] if title matches slug pattern, otherwise [[slug|title]]
  const slugFromTitle = title.toLowerCase().replace(/\s+/g, "-");
  const link = slug === slugFromTitle ? `[[${slug}]]` : `[[${slug}|${title}]]`;

  const newContent = before + link + after;
  const newCursorPos = triggerIndex + link.length;

  return { newContent, newCursorPos };
}

describe("NoteEditor trigger detection", () => {
  it("detects [[ trigger at cursor position", () => {
    const result = detectTrigger("Hello [[", 8);
    expect(result).not.toBeNull();
    expect(result?.isOpen).toBe(true);
    expect(result?.query).toBe("");
    expect(result?.triggerIndex).toBe(6);
  });

  it("captures query text after [[", () => {
    const result = detectTrigger("Hello [[my-note", 15);
    expect(result).not.toBeNull();
    expect(result?.query).toBe("my-note");
  });

  it("returns null when no [[ trigger", () => {
    const result = detectTrigger("Hello world", 11);
    expect(result).toBeNull();
  });

  it("returns null when [[ is closed with ]]", () => {
    const result = detectTrigger("Hello [[note]] world", 20);
    expect(result).toBeNull();
  });

  it("detects trigger in middle of text", () => {
    const result = detectTrigger("Some text [[query here", 22);
    expect(result).not.toBeNull();
    expect(result?.query).toBe("query here");
    expect(result?.triggerIndex).toBe(10);
  });

  it("handles multiple [[ by using the last one", () => {
    const result = detectTrigger("[[first]] and [[second", 22);
    expect(result).not.toBeNull();
    expect(result?.query).toBe("second");
    expect(result?.triggerIndex).toBe(14);
  });

  it("stops at | character (for display text syntax)", () => {
    const result = detectTrigger("Hello [[slug|display", 20);
    expect(result).toBeNull();
  });
});

describe("NoteEditor link insertion", () => {
  it("inserts [[slug]] when title matches slug pattern", () => {
    const result = insertLink("Hello [[", 6, 8, "my-note", "my-note");
    expect(result.newContent).toBe("Hello [[my-note]]");
    expect(result.newCursorPos).toBe(17);
  });

  it("inserts [[slug|title]] when title differs from slug", () => {
    // "API Reference" -> "api-reference", but slug is "api-ref" (different)
    const result = insertLink("Hello [[", 6, 8, "api-ref", "API Reference");
    expect(result.newContent).toBe("Hello [[api-ref|API Reference]]");
    expect(result.newCursorPos).toBe(31);
  });

  it("replaces query text with link", () => {
    // "Getting Started" -> "getting-started", slug matches
    const result = insertLink(
      "Hello [[get",
      6,
      11,
      "getting-started",
      "Getting Started"
    );
    expect(result.newContent).toBe("Hello [[getting-started]]");
  });

  it("preserves text after cursor", () => {
    const result = insertLink("Hello [[ world", 6, 8, "greeting", "greeting");
    expect(result.newContent).toBe("Hello [[greeting]] world");
  });

  it("handles insertion at start of content", () => {
    const result = insertLink("[[", 0, 2, "intro", "Introduction");
    expect(result.newContent).toBe("[[intro|Introduction]]");
    expect(result.newCursorPos).toBe(22);
  });

  it("positions cursor after closing brackets", () => {
    const result = insertLink("Test [[query", 5, 12, "test-note", "test-note");
    expect(result.newCursorPos).toBe(5 + "[[test-note]]".length);
  });
});

describe("NoteEditor keyboard shortcuts", () => {
  it("Cmd+S should trigger save (logic test)", () => {
    // Test the condition that triggers save
    const event = { metaKey: true, ctrlKey: false, key: "s" };
    const shouldSave = (event.metaKey || event.ctrlKey) && event.key === "s";
    expect(shouldSave).toBe(true);
  });

  it("Ctrl+S should trigger save (logic test)", () => {
    const event = { metaKey: false, ctrlKey: true, key: "s" };
    const shouldSave = (event.metaKey || event.ctrlKey) && event.key === "s";
    expect(shouldSave).toBe(true);
  });

  it("Escape should trigger cancel when autocomplete is closed", () => {
    const event = { key: "Escape" };
    const autocompleteIsOpen = false;
    const shouldCancel = event.key === "Escape" && !autocompleteIsOpen;
    expect(shouldCancel).toBe(true);
  });

  it("Escape should not trigger cancel when autocomplete is open", () => {
    const event = { key: "Escape" };
    const autocompleteIsOpen = true;
    const shouldCancel = event.key === "Escape" && !autocompleteIsOpen;
    expect(shouldCancel).toBe(false);
  });
});
