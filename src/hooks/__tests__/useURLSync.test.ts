import { describe, it, expect } from "vitest";
import { parseURLToTitles } from "../useURLSync";

describe("parseURLToTitles", () => {
  it("extracts single title from note param", () => {
    const result = parseURLToTitles("?note=Getting%20Started");
    expect(result).toEqual(["Getting Started"]);
  });

  it("extracts multiple titles from note and stack params", () => {
    const result = parseURLToTitles(
      "?note=Getting%20Started&stack=API%20Reference%2CExamples"
    );
    expect(result).toEqual(["Getting Started", "API Reference", "Examples"]);
  });

  it("handles empty search string", () => {
    const result = parseURLToTitles("");
    expect(result).toEqual([]);
  });

  it("handles search with no note param", () => {
    const result = parseURLToTitles("?other=param");
    expect(result).toEqual([]);
  });

  it("handles empty stack param", () => {
    const result = parseURLToTitles("?note=My%20Note&stack=");
    expect(result).toEqual(["My Note"]);
  });

  it("filters empty titles from stack", () => {
    const result = parseURLToTitles("?note=Note&stack=a%2C%2Cb");
    expect(result).toEqual(["Note", "a", "b"]);
  });
});
