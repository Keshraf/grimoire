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
} from "@/types";

// Helper to create a new pane
function createPane(slug: string): Pane {
  return {
    id: crypto.randomUUID(),
    slug,
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
      const { slug, afterIndex } = action;
      const newPanes = state.panes.slice(0, afterIndex + 1);
      const newPane = createPane(slug);
      newPanes.push(newPane);
      return {
        panes: newPanes,
        activePaneIndex: newPanes.length - 1,
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
      const { slug, afterIndex } = action;
      const newPanes = state.panes.slice(0, afterIndex + 1);
      const newPane = createPane(slug);
      newPanes.push(newPane);
      return {
        panes: newPanes,
        activePaneIndex: newPanes.length - 1,
      };
    }

    case "RESTORE_FROM_URL": {
      const { slugs } = action;
      if (slugs.length === 0) {
        return { panes: [], activePaneIndex: 0 };
      }
      const newPanes = slugs.map((slug) => createPane(slug));
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
  initialSlug?: string;
}

export function NavigationProvider({
  children,
  initialSlug,
}: NavigationProviderProps) {
  const [state, dispatch] = useReducer(
    navigationReducer,
    initialSlug
      ? { panes: [createPane(initialSlug)], activePaneIndex: 0 }
      : initialState
  );

  const pushPane = useCallback(
    (slug: string, afterIndex?: number) => {
      const idx = afterIndex ?? state.activePaneIndex;
      dispatch({ type: "PUSH_PANE", slug, afterIndex: idx });
    },
    [state.activePaneIndex]
  );

  const closePane = useCallback((index: number) => {
    dispatch({ type: "CLOSE_PANE", index });
  }, []);

  const setActive = useCallback((index: number) => {
    dispatch({ type: "SET_ACTIVE", index });
  }, []);

  const setMode = useCallback((index: number, mode: "view" | "edit") => {
    dispatch({ type: "SET_MODE", index, mode });
  }, []);

  const navigateLinear = useCallback(
    (slug: string, afterIndex?: number) => {
      const idx = afterIndex ?? state.activePaneIndex;
      dispatch({ type: "NAVIGATE_LINEAR", slug, afterIndex: idx });
    },
    [state.activePaneIndex]
  );

  const value: NavigationContextValue = {
    state,
    dispatch,
    pushPane,
    closePane,
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
