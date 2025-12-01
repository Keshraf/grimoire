// Database record for a note
// Title is the primary identifier (unique)
export interface Note {
  id: string;
  title: string;  // Primary identifier, must be unique
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

// Database record for a link between notes
export interface Link {
  id: string;
  source_title: string;
  target_title: string;
  created_at: string;
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
  title: string;  // Note title (primary identifier)
  mode: "view" | "edit";
  scrollTop: number;
}

export interface NavigationState {
  panes: Pane[];
  activePaneIndex: number;
}

export type NavigationAction =
  | { type: "PUSH_PANE"; title: string; afterIndex: number }
  | { type: "REPLACE_ALL"; title: string }
  | { type: "CLOSE_PANE"; index: number }
  | { type: "SET_ACTIVE"; index: number }
  | { type: "SET_MODE"; index: number; mode: "view" | "edit" }
  | { type: "NAVIGATE_LINEAR"; title: string; afterIndex: number }
  | { type: "RESTORE_FROM_URL"; titles: string[] };

export interface NavigationContextValue {
  state: NavigationState;
  dispatch: React.Dispatch<NavigationAction>;
  pushPane: (title: string, afterIndex?: number) => void;
  replaceAll: (title: string) => void;
  closePane: (index: number) => void;
  setActive: (index: number) => void;
  setMode: (index: number, mode: "view" | "edit") => void;
  navigateLinear: (title: string, afterIndex?: number) => void;
}

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
  title: string;  // Primary identifier
  excerpt: string;
  score: number;
}

export interface AISearchResult {
  answer: string;
  sources: SearchResult[];
}

// Auth types
export interface AuthUser {
  id: string;
  email?: string;
}

export interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  authMode: "none" | "password" | "supabase";
  canWrite: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export interface LoginCredentials {
  password?: string;
  email?: string;
}

export interface AuthSession {
  token: string;
  expiresAt: number;
}

// Legacy AuthState for backwards compatibility
export interface AuthState {
  isAuthenticated: boolean;
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
}

// MCP (Model Context Protocol) types
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
}

export interface MCPManifest {
  name: string;
  version: string;
  description: string;
  tools: MCPTool[];
}

export interface MCPToolRequest {
  tool: string;
  input: Record<string, unknown>;
}

export interface MCPSuccessResponse<T = unknown> {
  result: T;
}

export interface MCPErrorResponse {
  error: string;
}

export type MCPResponse<T = unknown> = MCPSuccessResponse<T> | MCPErrorResponse;

// MCP tool result types
export interface ListPagesResult {
  pages: Array<{ title: string }>;
}

export interface GetPageResult {
  title: string;
  content: string;
  outlinks: string[];  // Array of titles
  backlinks: string[];  // Array of titles
}

export interface SearchToolResult {
  results: Array<{ title: string; excerpt: string }>;
}

export interface AskToolResult {
  answer: string;
  sources: Array<{ title: string }>;
}

export interface GetConnectionsResult {
  title: string;
  outlinks: string[];  // Array of titles
  backlinks: string[];  // Array of titles
  localGraph: {
    nodes: Array<{ id: string; title: string; connections: number }>;
    edges: Array<{ source: string; target: string }>;
  };
}
