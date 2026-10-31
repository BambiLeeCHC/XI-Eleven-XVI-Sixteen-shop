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

/**
 * Recovery emails often land on the site root (Supabase falls back to the
 * Site URL when /reset-password is not in the redirect allow list). Move the
 * browser onto /reset-password *before* the client reads the URL, so the
 * token is exchanged on the page that asks for a new password.
 */
function parkRecoveryOnResetPage() {
  if (typeof window === "undefined") return;
  const { pathname, search, hash } = window.location;
  if (pathname === "/reset-password") return;
  const blob = `${search}${hash}`.toLowerCase();
  if (!blob.includes("type=recovery") && !blob.includes("type%3drecovery")) return;
  window.history.replaceState(window.history.state, "", `/reset-password${search}${hash}`);
}

parkRecoveryOnResetPage();

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

if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange((event) => {
    if (event !== "PASSWORD_RECOVERY") return;
    if (window.location.pathname === "/reset-password") return;
    window.location.replace("/reset-password");
  });
}
