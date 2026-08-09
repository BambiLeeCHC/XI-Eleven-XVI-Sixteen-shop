import { createClient } from "@supabase/supabase-js";
import { getSessionId } from "./session";

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

// Generated row types live in ./database.types.ts. The client is intentionally
// untyped: the schema is mapped to the storefront's own shapes in
// lib/backend/mappers.ts, which is where a column rename must be handled anyway.
