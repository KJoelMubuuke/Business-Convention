import { createClient } from "@supabase/supabase-js";

/**
 * Server-only admin client using the service_role key.
 * Bypasses Row Level Security — NEVER expose to the browser.
 * Used exclusively for admin operations like auto-confirming new users.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.");
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
