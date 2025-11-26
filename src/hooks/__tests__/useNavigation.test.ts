import { describe, it, expect, beforeEach } from "vitest";
import { navigationReducer } from "../useNavigation";
import type { NavigationState, NavigationAction } from "@/types";

// Helper to create a mock pane
function mockPane(slug: string, id = crypto.randomUUID()) {
  return { id, slug, mode: "view" as const, scrollTop: 0 };
}

describe("navigationReducer", () => {
  let initialState: NavigationState;

  beforeEach(() => {
    initialState = { panes: [], activePaneIndex: 0 };
  });

  describe("PUSH_PANE", () => {
    it("adds a new pane after the specified index", () => {
      const state: NavigationState = {
        panes: [mockPane("note-1"), mockPane("note-2")],
        activePaneIndex: 0,
      };
      const action: NavigationAction = {
        type: "PUSH_PANE",
        slug: "note-3",
        afterIndex: 0,
      };

      const result = navigationReducer(state, action);

      expect(result.panes).toHaveLength(2);
      expect(result.panes[1].slug).toBe("note-3");
      expect(result.activePaneIndex).toBe(1);
    });

    it("closes panes after afterIndex before adding new pane", () => {
      const state: NavigationState = {
        panes: [mockPane("note-1"), mockPane("note-2"), mockPane("note-3")],
        activePaneIndex: 2,
      };
      const action: NavigationAction = {
        type: "PUSH_PANE",
        slug: "note-4",
        afterIndex: 0,
      };

      const result = navigationReducer(state, action);

      expect(result.panes).toHaveLength(2);
      expect(result.panes[0].slug).toBe("note-1");
      expect(result.panes[1].slug).toBe("note-4");
    });

    it("sets the new pane as active", () => {
      const state: NavigationState = {
        panes: [mockPane("note-1")],
        activePaneIndex: 0,
      };
      const action: NavigationAction = {
        type: "PUSH_PANE",
        slug: "note-2",
        afterIndex: 0,
      };

      const result = navigationReducer(state, action);

      expect(result.activePaneIndex).toBe(1);
    });

    it("initializes new pane in view mode", () => {
      const action: NavigationAction = {
        type: "PUSH_PANE",
        slug: "note-1",
        afterIndex: -1,
      };

      const result = navigationReducer(initialState, action);

      expect(result.panes[0].mode).toBe("view");
    });
  });

  describe("CLOSE_PANE", () => {
    it("removes pane at index and all panes after", () => {
      const state: NavigationState = {
        panes: [mockPane("note-1"), mockPane("note-2"), mockPane("note-3")],
        activePaneIndex: 2,
      };
      const action: NavigationAction = { type: "CLOSE_PANE", index: 1 };

      const result = navigationReducer(state, action);

      expect(result.panes).toHaveLength(1);
      expect(result.panes[0].slug).toBe("note-1");
    });

    it("adjusts active index when active pane is removed", () => {
      const state: NavigationState = {
        panes: [mockPane("note-1"), mockPane("note-2")],
        activePaneIndex: 1,
      };
      const action: NavigationAction = { type: "CLOSE_PANE", index: 1 };

      const result = navigationReducer(state, action);

      expect(result.activePaneIndex).toBe(0);
    });

    it("keeps single pane when trying to close index 0", () => {
      const state: NavigationState = {
        panes: [mockPane("note-1")],
        activePaneIndex: 0,
      };
      const action: NavigationAction = { type: "CLOSE_PANE", index: 0 };

      const result = navigationReducer(state, action);

      expect(result.panes).toHaveLength(1);
      expect(result).toBe(state);
    });
  });

  describe("SET_ACTIVE", () => {
    it("updates active pane index", () => {
      const state: NavigationState = {
        panes: [mockPane("note-1"), mockPane("note-2"), mockPane("note-3")],
        activePaneIndex: 0,
      };
      const action: NavigationAction = { type: "SET_ACTIVE", index: 2 };

      const result = navigationReducer(state, action);

      expect(result.activePaneIndex).toBe(2);
    });

    it("clamps index to valid range (too high)", () => {
      const state: NavigationState = {
        panes: [mockPane("note-1"), mockPane("note-2")],
        activePaneIndex: 0,
      };
      const action: NavigationAction = { type: "SET_ACTIVE", index: 10 };

      const result = navigationReducer(state, action);

      expect(result.activePaneIndex).toBe(1);
    });

    it("clamps index to valid range (negative)", () => {
      const state: NavigationState = {
        panes: [mockPane("note-1"), mockPane("note-2")],
        activePaneIndex: 1,
      };
      const action: NavigationAction = { type: "SET_ACTIVE", index: -5 };

      const result = navigationReducer(state, action);

      expect(result.activePaneIndex).toBe(0);
    });
  });

  describe("SET_MODE", () => {
    it("updates mode for pane at index", () => {
      const state: NavigationState = {
        panes: [mockPane("note-1"), mockPane("note-2")],
        activePaneIndex: 0,
      };
      const action: NavigationAction = {
        type: "SET_MODE",
        index: 1,
        mode: "edit",
      };

      const result = navigationReducer(state, action);

      expect(result.panes[1].mode).toBe("edit");
      expect(result.panes[0].mode).toBe("view");
    });

    it("ignores action for invalid index (negative)", () => {
      const state: NavigationState = {
        panes: [mockPane("note-1")],
        activePaneIndex: 0,
      };
      const action: NavigationAction = {
        type: "SET_MODE",
        index: -1,
        mode: "edit",
      };

      const result = navigationReducer(state, action);

      expect(result).toBe(state);
    });

    it("ignores action for invalid index (too high)", () => {
      const state: NavigationState = {
        panes: [mockPane("note-1")],
        activePaneIndex: 0,
      };
      const action: NavigationAction = {
        type: "SET_MODE",
        index: 5,
        mode: "edit",
      };

      const result = navigationReducer(state, action);

      expect(result).toBe(state);
    });
  });

  describe("NAVIGATE_LINEAR", () => {
    it("closes panes after afterIndex and adds new pane", () => {
      const state: NavigationState = {
        panes: [mockPane("note-1"), mockPane("note-2"), mockPane("note-3")],
        activePaneIndex: 2,
      };
      const action: NavigationAction = {
        type: "NAVIGATE_LINEAR",
        slug: "note-prev",
        afterIndex: 0,
      };

      const result = navigationReducer(state, action);

      expect(result.panes).toHaveLength(2);
      expect(result.panes[1].slug).toBe("note-prev");
    });

    it("sets new pane as active", () => {
      const state: NavigationState = {
        panes: [mockPane("note-1")],
        activePaneIndex: 0,
      };
      const action: NavigationAction = {
        type: "NAVIGATE_LINEAR",
        slug: "note-next",
        afterIndex: 0,
      };

      const result = navigationReducer(state, action);

      expect(result.activePaneIndex).toBe(1);
    });

    it("initializes pane in view mode", () => {
      const action: NavigationAction = {
        type: "NAVIGATE_LINEAR",
        slug: "note-1",
        afterIndex: -1,
      };

      const result = navigationReducer(initialState, action);

      expect(result.panes[0].mode).toBe("view");
    });
  });

  describe("RESTORE_FROM_URL", () => {
    it("creates panes for each slug", () => {
      const action: NavigationAction = {
        type: "RESTORE_FROM_URL",
        slugs: ["note-1", "note-2", "note-3"],
      };

      const result = navigationReducer(initialState, action);

      expect(result.panes).toHaveLength(3);
      expect(result.panes[0].slug).toBe("note-1");
      expect(result.panes[1].slug).toBe("note-2");
      expect(result.panes[2].slug).toBe("note-3");
    });

    it("sets last pane as active", () => {
      const action: NavigationAction = {
        type: "RESTORE_FROM_URL",
        slugs: ["note-1", "note-2"],
      };

      const result = navigationReducer(initialState, action);

      expect(result.activePaneIndex).toBe(1);
    });

    it("initializes all panes in view mode", () => {
      const action: NavigationAction = {
        type: "RESTORE_FROM_URL",
        slugs: ["note-1", "note-2"],
      };

      const result = navigationReducer(initialState, action);

      expect(result.panes.every((p) => p.mode === "view")).toBe(true);
    });

    it("handles empty slugs array", () => {
      const action: NavigationAction = {
        type: "RESTORE_FROM_URL",
        slugs: [],
      };

      const result = navigationReducer(initialState, action);

      expect(result.panes).toHaveLength(0);
      expect(result.activePaneIndex).toBe(0);
    });
  });
});
