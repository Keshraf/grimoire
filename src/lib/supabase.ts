/**
 * Legacy Supabase client exports for backward compatibility.
 *
 * For new code, prefer importing from:
 * - '@/lib/supabase/client' for browser/client components
 * - '@/lib/supabase/server' for server components and API routes
 */

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client singleton for client-side usage
// This is kept for backward compatibility with existing code
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Re-export new utilities for gradual migration
export { createClient } from "./supabase/client";
export {
  createClient as createServerSupabaseClient,
  createServiceClient,
} from "./supabase/server";
