import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase admin client.
 *
 * SECURITY: Uses SUPABASE_SERVICE_ROLE_KEY — a server-only secret with full
 * database access. This module must NEVER be imported by Expo/client-side code.
 * The Expo app uses EXPO_PUBLIC_SUPABASE_ANON_KEY only.
 */
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables",
  );
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
