import { createClient } from "@supabase/supabase-js";
import { getSessionId } from "./session";

/**
 * Browser Supabase client (anon key + user session).
 *
 * Env (Vite):
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 *
 * Server routes use the service role via api/_lib/server.ts (supabaseAdmin).
 * Typed Long Read helpers (window column) live in ./deepReadingsClient.ts.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !key) {
  // Fail loudly in the console rather than throwing: a missing env var should not
  // white-screen the storefront the way the previous backend outage did.
  console.error(
    "Supabase is not configured — VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing.",
  );
}

export const supabase = createClient(url ?? "", key ?? "", {
  global: {
    // Scopes the guest cart: RLS on `cart_items` matches rows against this.
    headers: { "x-cart-session": getSessionId() },
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});

export type SupabaseClient = typeof supabase;

// Generated row types live in ./database.types.ts (optional). The client is
// intentionally untyped at the root: schema is mapped to storefront shapes in
// lib/backend/mappers.ts. For deep_readings + window, prefer deepReadingsClient.
