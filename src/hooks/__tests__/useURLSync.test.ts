import { describe, it, expect } from "vitest";
import { parseURLToSlugs, buildURLFromSlugs } from "../useURLSync";

describe("parseURLToSlugs", () => {
  it("extracts single slug from pathname", () => {
    const result = parseURLToSlugs("/getting-started", "");
    expect(result).toEqual(["getting-started"]);
  });

  it("extracts multiple slugs from pathname and stack param", () => {
    const result = parseURLToSlugs(
      "/getting-started",
      "?stack=api-reference,examples"
    );
    expect(result).toEqual(["getting-started", "api-reference", "examples"]);
  });

  it("handles empty pathname", () => {
    const result = parseURLToSlugs("/", "");
    expect(result).toEqual([]);
  });

  it("handles pathname with no stack param", () => {
    const result = parseURLToSlugs("/my-note", "?other=param");
    expect(result).toEqual(["my-note"]);
  });

  it("handles empty stack param", () => {
    const result = parseURLToSlugs("/note", "?stack=");
    expect(result).toEqual(["note"]);
  });

  it("filters empty slugs from stack", () => {
    const result = parseURLToSlugs("/note", "?stack=a,,b");
    expect(result).toEqual(["note", "a", "b"]);
  });
});

describe("buildURLFromSlugs", () => {
  it("builds URL for single slug", () => {
    const result = buildURLFromSlugs(["getting-started"]);
    expect(result).toBe("/getting-started");
  });

  it("builds URL with stack param for multiple slugs", () => {
    const result = buildURLFromSlugs([
      "getting-started",
      "api-reference",
      "examples",
    ]);
    expect(result).toBe("/getting-started?stack=api-reference,examples");
  });

  it("returns root for empty slugs", () => {
    const result = buildURLFromSlugs([]);
    expect(result).toBe("/");
  });

  it("handles two slugs", () => {
    const result = buildURLFromSlugs(["note-1", "note-2"]);
    expect(result).toBe("/note-1?stack=note-2");
  });
});
