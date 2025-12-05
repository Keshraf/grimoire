import { describe, it, expect } from "vitest";
import { parseWikilinks } from "./links";

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

  it("handles wikilinks with spaces in title", () => {
    const content = "See [[my note title]] for more.";
    expect(parseWikilinks(content)).toEqual(["my note title"]);
  });

  it("extracts title from wikilinks with display text", () => {
    const content = "See [[actual-title|Display Text]] for more.";
    expect(parseWikilinks(content)).toEqual(["actual-title"]);
  });

  it("handles mixed wikilinks with and without display text", () => {
    const content = "See [[note-one]] and [[note-two|Note Two Display]].";
    expect(parseWikilinks(content)).toEqual(["note-one", "note-two"]);
  });
});
