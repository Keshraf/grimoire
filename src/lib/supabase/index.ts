// Re-export all Supabase utilities
export { createClient } from "./client";
export {
  createClient as createServerSupabaseClient,
  createServiceClient,
} from "./server";
export { updateSession } from "./middleware";
