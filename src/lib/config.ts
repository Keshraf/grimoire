import * as fs from "fs";
import * as path from "path";
import * as yaml from "yaml";
import type { NexusConfig } from "@/types";

const DEFAULT_CONFIG: NexusConfig = {
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

let cachedConfig: NexusConfig | null = null;

function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target } as T;

  for (const key in source) {
    const sourceValue = source[key as keyof T];
    const targetValue = target[key as keyof T];

    if (
      sourceValue !== null &&
      sourceValue !== undefined &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      targetValue !== undefined &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      (result as Record<string, unknown>)[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      );
    } else if (sourceValue !== undefined) {
      (result as Record<string, unknown>)[key] = sourceValue;
    }
  }

  return result;
}

function loadConfigFromFile(): Partial<NexusConfig> | null {
  const configPath = path.join(process.cwd(), "nexus.config.yaml");

  try {
    if (fs.existsSync(configPath)) {
      const fileContent = fs.readFileSync(configPath, "utf-8");
      return yaml.parse(fileContent) as Partial<NexusConfig>;
    }
  } catch (error) {
    console.warn("Failed to load nexus.config.yaml:", error);
  }

  return null;
}

export function getConfig(): NexusConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const fileConfig = loadConfigFromFile();

  if (fileConfig) {
    cachedConfig = deepMerge<NexusConfig>(DEFAULT_CONFIG, fileConfig);
  } else {
    cachedConfig = { ...DEFAULT_CONFIG };
  }

  return cachedConfig!;
}

export function clearConfigCache(): void {
  cachedConfig = null;
}

export { DEFAULT_CONFIG };
