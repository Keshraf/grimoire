// Database record for a note
export interface Note {
  id: string;
  slug: string;
  title: string;
  content: string;
  tags: string[];
  section?: string;
  order?: number;
  created_at: string;
  updated_at: string;
}

// Note with resolved links and rendered HTML
export interface NoteWithLinks extends Note {
  outlinks: string[];
  backlinks: string[];
  html: string;
}

// Graph visualization types
export interface GraphNode {
  id: string;
  title: string;
  connections: number;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Multi-pane navigation types
export interface Pane {
  id: string;
  slug: string;
  mode: "view" | "edit";
  scrollTop: number;
}

export interface NavigationState {
  panes: Pane[];
  activePaneIndex: number;
}

export type NavigationAction =
  | { type: "OPEN_PANE"; slug: string; mode?: "view" | "edit" }
  | { type: "CLOSE_PANE"; paneId: string }
  | { type: "SET_ACTIVE_PANE"; paneIndex: number }
  | { type: "UPDATE_PANE_MODE"; paneId: string; mode: "view" | "edit" }
  | { type: "UPDATE_PANE_SCROLL"; paneId: string; scrollTop: number }
  | { type: "REPLACE_PANE"; paneId: string; slug: string }
  | { type: "RESET_NAVIGATION" };

// Configuration types
export interface NexusConfig {
  site: {
    title: string;
    description?: string;
    logo?: string;
    favicon?: string;
  };
  mode: "personal" | "documentation";
  theme: {
    preset: "dark" | "light" | "system" | string;
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      background?: string;
      surface?: string;
      text?: string;
      text_muted?: string;
    };
    fonts?: {
      heading?: string;
      body?: string;
      code?: string;
    };
    custom_css?: string;
  };
  layout: {
    sidebar: {
      position: "left" | "right" | "hidden";
      width: number;
      collapsible?: boolean;
    };
    pane: {
      width: number;
      min_width?: number;
      max_width?: number;
    };
    graph?: {
      position: "bottom" | "sidebar" | "hidden";
      height?: number;
      default_expanded?: boolean;
    };
  };
  features: {
    local_graph: boolean;
    backlinks_panel: boolean;
    linear_nav: boolean;
    tags: boolean;
    search: boolean;
    ai_search: boolean;
    import_export: boolean;
    mcp_server: boolean;
  };
  navigation?: {
    sections?: Array<{
      title: string;
      pages: string[];
    }>;
  };
  auth: {
    mode: "none" | "password" | "supabase";
    permissions?: {
      read: "public" | "authenticated";
      write: "authenticated";
    };
  };
  search: {
    ai?: {
      enabled: boolean;
      provider?: "openai" | "anthropic";
    };
  };
  mcp?: {
    enabled: boolean;
  };
}

// Search types
export interface SearchResult {
  slug: string;
  title: string;
  excerpt: string;
  score: number;
}

export interface AISearchResult {
  answer: string;
  sources: SearchResult[];
}

// Auth types
export interface AuthState {
  isAuthenticated: boolean;
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
}
