import type { NexusConfig } from "@/types";

export const DEFAULT_CONFIG: NexusConfig = {
  site: {
    title: "Nexus",
    description: "Personal knowledge base",
  },
  mode: "personal",
  theme: {
    preset: "dark",
    colors: {
      primary: "#7b2cbf",
      secondary: "#1a1a2e",
      accent: "#c77dff",
      background: "#0a0a0f",
      surface: "#16213e",
      text: "#e8e6e3",
      text_muted: "#a8a6a3",
    },
    fonts: {
      heading: "Cinzel, serif",
      body: "Inter, sans-serif",
      code: "JetBrains Mono, monospace",
    },
  },
  layout: {
    sidebar: {
      position: "left",
      width: 260,
      collapsible: true,
    },
    pane: {
      width: 600,
      min_width: 400,
      max_width: 800,
    },
    graph: {
      position: "bottom",
      height: 200,
      default_expanded: true,
    },
  },
  features: {
    local_graph: true,
    backlinks_panel: true,
    linear_nav: false,
    tags: true,
    search: true,
    ai_search: false,
    import_export: true,
    mcp_server: true,
    inline_editing: false,
  },
  auth: {
    mode: "none",
    permissions: {
      read: "public",
      write: "authenticated",
    },
  },
  search: {
    ai: {
      enabled: false,
    },
  },
  mcp: {
    enabled: true,
  },
};
