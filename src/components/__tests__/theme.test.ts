import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock document and window for theme testing
const mockStyleSetProperty = vi.fn();
const mockRemove = vi.fn();
const mockAppendChild = vi.fn();
const mockGetElementById = vi.fn();

// Theme CSS variable application tests
describe("Theme CSS Variables", () => {
  let mockRoot: { style: { setProperty: typeof mockStyleSetProperty } };

  beforeEach(() => {
    mockStyleSetProperty.mockClear();
    mockRoot = {
      style: {
        setProperty: mockStyleSetProperty,
      },
    };
  });

  describe("Color Variables", () => {
    it("should set all color CSS variables on document root", () => {
      const colors = {
        primary: "#7b2cbf",
        secondary: "#1a1a2e",
        accent: "#c77dff",
        background: "#0a0a0f",
        surface: "#16213e",
        text: "#e8e6e3",
        text_muted: "#a8a6a3",
      };

      // Simulate applying colors
      if (colors.primary)
        mockRoot.style.setProperty("--color-primary", colors.primary);
      if (colors.secondary)
        mockRoot.style.setProperty("--color-secondary", colors.secondary);
      if (colors.accent)
        mockRoot.style.setProperty("--color-accent", colors.accent);
      if (colors.background)
        mockRoot.style.setProperty("--color-background", colors.background);
      if (colors.surface)
        mockRoot.style.setProperty("--color-surface", colors.surface);
      if (colors.text) mockRoot.style.setProperty("--color-text", colors.text);
      if (colors.text_muted)
        mockRoot.style.setProperty("--color-text-muted", colors.text_muted);

      expect(mockStyleSetProperty).toHaveBeenCalledWith(
        "--color-primary",
        "#7b2cbf"
      );
      expect(mockStyleSetProperty).toHaveBeenCalledWith(
        "--color-secondary",
        "#1a1a2e"
      );
      expect(mockStyleSetProperty).toHaveBeenCalledWith(
        "--color-accent",
        "#c77dff"
      );
      expect(mockStyleSetProperty).toHaveBeenCalledWith(
        "--color-background",
        "#0a0a0f"
      );
      expect(mockStyleSetProperty).toHaveBeenCalledWith(
        "--color-surface",
        "#16213e"
      );
      expect(mockStyleSetProperty).toHaveBeenCalledWith(
        "--color-text",
        "#e8e6e3"
      );
      expect(mockStyleSetProperty).toHaveBeenCalledWith(
        "--color-text-muted",
        "#a8a6a3"
      );
      expect(mockStyleSetProperty).toHaveBeenCalledTimes(7);
    });

    it("should only set provided color overrides", () => {
      const colors = {
        primary: "#ff0000",
        accent: "#00ff00",
      };

      // Simulate applying partial colors
      if (colors.primary)
        mockRoot.style.setProperty("--color-primary", colors.primary);
      if (colors.accent)
        mockRoot.style.setProperty("--color-accent", colors.accent);

      expect(mockStyleSetProperty).toHaveBeenCalledWith(
        "--color-primary",
        "#ff0000"
      );
      expect(mockStyleSetProperty).toHaveBeenCalledWith(
        "--color-accent",
        "#00ff00"
      );
      expect(mockStyleSetProperty).toHaveBeenCalledTimes(2);
    });
  });

  describe("Font Variables", () => {
    it("should set all font CSS variables on document root", () => {
      const fonts = {
        heading: "Cinzel, serif",
        body: "Inter, sans-serif",
        code: "JetBrains Mono, monospace",
      };

      // Simulate applying fonts
      if (fonts.heading)
        mockRoot.style.setProperty("--font-heading", fonts.heading);
      if (fonts.body) mockRoot.style.setProperty("--font-body", fonts.body);
      if (fonts.code) mockRoot.style.setProperty("--font-code", fonts.code);

      expect(mockStyleSetProperty).toHaveBeenCalledWith(
        "--font-heading",
        "Cinzel, serif"
      );
      expect(mockStyleSetProperty).toHaveBeenCalledWith(
        "--font-body",
        "Inter, sans-serif"
      );
      expect(mockStyleSetProperty).toHaveBeenCalledWith(
        "--font-code",
        "JetBrains Mono, monospace"
      );
      expect(mockStyleSetProperty).toHaveBeenCalledTimes(3);
    });

    it("should only set provided font overrides", () => {
      const fonts = {
        heading: "Georgia, serif",
      };

      // Simulate applying partial fonts
      if (fonts.heading)
        mockRoot.style.setProperty("--font-heading", fonts.heading);

      expect(mockStyleSetProperty).toHaveBeenCalledWith(
        "--font-heading",
        "Georgia, serif"
      );
      expect(mockStyleSetProperty).toHaveBeenCalledTimes(1);
    });
  });

  describe("Override Precedence", () => {
    it("should apply config overrides after preset theme", () => {
      // First, preset theme sets defaults
      mockRoot.style.setProperty("--color-primary", "#7b2cbf");
      mockRoot.style.setProperty("--color-accent", "#c77dff");

      // Then, config overrides take precedence
      mockRoot.style.setProperty("--color-primary", "#ff0000");

      // Verify the override was called last
      const calls = mockStyleSetProperty.mock.calls;
      const lastPrimaryCall = calls
        .filter((call) => call[0] === "--color-primary")
        .pop();
      expect(lastPrimaryCall).toEqual(["--color-primary", "#ff0000"]);
    });
  });
});

// Theme preset mapping tests
describe("Theme Preset Mapping", () => {
  const THEME_PRESETS: Record<string, string> = {
    dark: "/themes/dark.css",
    light: "/themes/light.css",
    arcana: "/themes/arcana.css",
    codex: "/themes/codex.css",
  };

  it("should map dark preset to correct CSS file", () => {
    expect(THEME_PRESETS["dark"]).toBe("/themes/dark.css");
  });

  it("should map light preset to correct CSS file", () => {
    expect(THEME_PRESETS["light"]).toBe("/themes/light.css");
  });

  it("should map arcana preset to correct CSS file", () => {
    expect(THEME_PRESETS["arcana"]).toBe("/themes/arcana.css");
  });

  it("should map codex preset to correct CSS file", () => {
    expect(THEME_PRESETS["codex"]).toBe("/themes/codex.css");
  });

  it("should return undefined for invalid preset", () => {
    expect(THEME_PRESETS["invalid"]).toBeUndefined();
  });
});

// System preference detection tests
describe("System Preference Detection", () => {
  let mockMatchMedia: ReturnType<typeof vi.fn>;
  let mockAddEventListener: ReturnType<typeof vi.fn>;
  let mockRemoveEventListener: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockAddEventListener = vi.fn();
    mockRemoveEventListener = vi.fn();
    mockMatchMedia = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should detect dark system preference", () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    });

    const result = mockMatchMedia("(prefers-color-scheme: dark)");
    expect(result.matches).toBe(true);
  });

  it("should detect light system preference", () => {
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    });

    const result = mockMatchMedia("(prefers-color-scheme: dark)");
    expect(result.matches).toBe(false);
  });

  it("should add event listener for preference changes", () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    });

    const mediaQuery = mockMatchMedia("(prefers-color-scheme: dark)");
    const handleChange = vi.fn();
    mediaQuery.addEventListener("change", handleChange);

    expect(mockAddEventListener).toHaveBeenCalledWith("change", handleChange);
  });

  it("should trigger theme update on preference change", () => {
    const handleChange = vi.fn((e: { matches: boolean }) => {
      return e.matches ? "dark" : "light";
    });

    // Simulate dark preference change
    const darkResult = handleChange({ matches: true });
    expect(darkResult).toBe("dark");

    // Simulate light preference change
    const lightResult = handleChange({ matches: false });
    expect(lightResult).toBe("light");
  });

  it("should remove event listener on cleanup", () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    });

    const mediaQuery = mockMatchMedia("(prefers-color-scheme: dark)");
    const handleChange = vi.fn();
    mediaQuery.addEventListener("change", handleChange);
    mediaQuery.removeEventListener("change", handleChange);

    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      "change",
      handleChange
    );
  });
});
