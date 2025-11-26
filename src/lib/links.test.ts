import { describe, it, expect } from "vitest";
import { parseWikilinks, generateSlug } from "./links";

describe("parseWikilinks", () => {
  it("returns empty array for empty content", () => {
    expect(parseWikilinks("")).toEqual([]);
    expect(parseWikilinks(null as unknown as string)).toEqual([]);
    expect(parseWikilinks(undefined as unknown as string)).toEqual([]);
  });

  it("extracts single wikilink", () => {
    const content = "Check out [[my-note]] for more info.";
    expect(parseWikilinks(content)).toEqual(["my-note"]);
  });

  it("extracts multiple wikilinks", () => {
    const content = "See [[note-one]] and [[note-two]] for details.";
    expect(parseWikilinks(content)).toEqual(["note-one", "note-two"]);
  });

  it("deduplicates repeated links", () => {
    const content = "Link to [[same-note]] and again [[same-note]].";
    expect(parseWikilinks(content)).toEqual(["same-note"]);
  });

  it("handles content with no wikilinks", () => {
    const content = "This is plain text without any links.";
    expect(parseWikilinks(content)).toEqual([]);
  });

  it("handles wikilinks with spaces in slug", () => {
    const content = "See [[my note title]] for more.";
    expect(parseWikilinks(content)).toEqual(["my note title"]);
  });
});

describe("generateSlug", () => {
  it("converts basic title to slug", () => {
    expect(generateSlug("My Note Title")).toBe("my-note-title");
  });

  it("removes special characters", () => {
    expect(generateSlug("Hello! World?")).toBe("hello-world");
    expect(generateSlug("Test@#$%^&*()")).toBe("test");
  });

  it("handles multiple spaces", () => {
    expect(generateSlug("Multiple   Spaces   Here")).toBe(
      "multiple-spaces-here"
    );
  });

  it("trims leading and trailing whitespace", () => {
    expect(generateSlug("  Trimmed Title  ")).toBe("trimmed-title");
  });

  it("removes leading and trailing hyphens", () => {
    expect(generateSlug("---Title---")).toBe("title");
  });

  it("handles numbers", () => {
    expect(generateSlug("Note 123")).toBe("note-123");
  });
});
