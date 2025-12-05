"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";
import type {
  Pane,
  NavigationState,
  NavigationAction,
  NavigationContextValue,
} from "../types";

// Helper to create a new pane
function createPane(title: string): Pane {
  return {
    id: crypto.randomUUID(),
    title,
    mode: "view",
    scrollTop: 0,
  };
}

// Initial state
const initialState: NavigationState = {
  panes: [],
  activePaneIndex: 0,
};

// Reducer handling all navigation actions
export function navigationReducer(
  state: NavigationState,
  action: NavigationAction
): NavigationState {
  switch (action.type) {
    case "PUSH_PANE": {
      const { title, afterIndex } = action;

      // Check if this note is already in the stack - if so, don't add duplicate
      const existingIndex = state.panes.findIndex((pane) => pane.title === title);
      if (existingIndex !== -1) {
        // Note already exists, just make it active and scroll to it
        return {
          ...state,
          activePaneIndex: existingIndex,
        };
      }

      // Only stack to the right of the current pane (truncate any panes after)
      const newPanes = state.panes.slice(0, afterIndex + 1);
      const newPane = createPane(title);
      newPanes.push(newPane);
      return {
        panes: newPanes,
        activePaneIndex: newPanes.length - 1,
      };
    }

    case "REPLACE_ALL": {
      const { title } = action;
      const newPane = createPane(title);
      return {
        panes: [newPane],
        activePaneIndex: 0,
      };
    }

    case "CLOSE_PANE": {
      const { index } = action;
      if (index === 0 && state.panes.length === 1) {
        return state;
      }
      const newPanes = state.panes.slice(0, index);
      const newActiveIndex = Math.min(
        state.activePaneIndex,
        Math.max(0, newPanes.length - 1)
      );
      return {
        panes: newPanes,
        activePaneIndex: newActiveIndex,
      };
    }

    case "CLOSE_PANES_BY_TITLE": {
      const { title } = action;
      const newPanes = state.panes.filter((pane) => pane.title !== title);
      const newActiveIndex = Math.min(
        state.activePaneIndex,
        Math.max(0, newPanes.length - 1)
      );
      return {
        panes: newPanes,
        activePaneIndex: newActiveIndex,
      };
    }

    case "UPDATE_PANE_TITLE": {
      const { oldTitle, newTitle } = action;
      const newPanes = state.panes.map((pane) =>
        pane.title === oldTitle ? { ...pane, title: newTitle } : pane
      );
      return {
        ...state,
        panes: newPanes,
      };
    }

    case "SET_ACTIVE": {
      const { index } = action;
      const clampedIndex = Math.max(0, Math.min(index, state.panes.length - 1));
      return {
        ...state,
        activePaneIndex: clampedIndex,
      };
    }

    case "SET_MODE": {
      const { index, mode } = action;
      if (index < 0 || index >= state.panes.length) {
        return state;
      }
      const newPanes = state.panes.map((pane, i) =>
        i === index ? { ...pane, mode } : pane
      );
      return {
        ...state,
        panes: newPanes,
      };
    }

    case "NAVIGATE_LINEAR": {
      const { title, afterIndex } = action;
      const newPanes = state.panes.slice(0, afterIndex + 1);
      const newPane = createPane(title);
      newPanes.push(newPane);
      return {
        panes: newPanes,
        activePaneIndex: newPanes.length - 1,
      };
    }

    case "RESTORE_FROM_URL": {
      const { titles } = action;
      if (titles.length === 0) {
        return { panes: [], activePaneIndex: 0 };
      }
      const newPanes = titles.map((title) => createPane(title));
      return {
        panes: newPanes,
        activePaneIndex: newPanes.length - 1,
      };
    }

    default:
      return state;
  }
}

// Context
const NavigationContext = createContext<NavigationContextValue | null>(null);

interface NavigationProviderProps {
  children: ReactNode;
  initialTitle?: string;
}

export function NavigationProvider({
  children,
  initialTitle,
}: NavigationProviderProps) {
  const [state, dispatch] = useReducer(
    navigationReducer,
    initialTitle
      ? { panes: [createPane(initialTitle)], activePaneIndex: 0 }
      : initialState
  );

  const pushPane = useCallback(
    (title: string, afterIndex?: number) => {
      const idx = afterIndex ?? state.activePaneIndex;
      dispatch({ type: "PUSH_PANE", title, afterIndex: idx });
    },
    [state.activePaneIndex]
  );

  const replaceAll = useCallback((title: string) => {
    dispatch({ type: "REPLACE_ALL", title });
  }, []);

  const closePane = useCallback((index: number) => {
    dispatch({ type: "CLOSE_PANE", index });
  }, []);

  const closePanesByTitle = useCallback((title: string) => {
    dispatch({ type: "CLOSE_PANES_BY_TITLE", title });
  }, []);

  const updatePaneTitle = useCallback((oldTitle: string, newTitle: string) => {
    dispatch({ type: "UPDATE_PANE_TITLE", oldTitle, newTitle });
  }, []);

  const setActive = useCallback((index: number) => {
    dispatch({ type: "SET_ACTIVE", index });
  }, []);

  const setMode = useCallback((index: number, mode: "view" | "edit") => {
    dispatch({ type: "SET_MODE", index, mode });
  }, []);

  const navigateLinear = useCallback(
    (title: string, afterIndex?: number) => {
      const idx = afterIndex ?? state.activePaneIndex;
      dispatch({ type: "NAVIGATE_LINEAR", title, afterIndex: idx });
    },
    [state.activePaneIndex]
  );

  const value: NavigationContextValue = {
    state,
    dispatch,
    pushPane,
    replaceAll,
    closePane,
    closePanesByTitle,
    updatePaneTitle,
    setActive,
    setMode,
    navigateLinear,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextValue {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error(
      "useNavigation must be used within a NavigationProvider. " +
        "Wrap your component tree with <NavigationProvider>."
    );
  }
  return context;
}
