import { NextResponse } from "next/server";
import { getConfig } from "@nexus/core/lib/config";

/**
 * GET /api/config - Get public configuration
 * Returns safe config values for client-side use (excludes sensitive data)
 */
export async function GET() {
  const config = getConfig();

  // Return only safe, public configuration values
  const publicConfig = {
    site: config.site,
    mode: config.mode,
    theme: config.theme,
    layout: config.layout,
    features: config.features,
    navigation: config.navigation,
    auth: {
      mode: config.auth.mode,
      permissions: config.auth.permissions,
    },
  };

  return NextResponse.json(publicConfig);
}
