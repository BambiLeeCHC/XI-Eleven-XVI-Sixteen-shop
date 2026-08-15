/**
 * React bindings for the Supabase backend.
 *
 * These deliberately mirror the hook surface the storefront was written
 * against (`useQuery` / `useMutation` / `useAction` / `useAuthStatus` /
 * `useAuthActions`), so migrating the data layer did not mean rewriting forty
 * components on a live store.
 *
 * The one behavioural difference from the old backend: queries are not
 * websocket-live. They refetch on mount, on sign-in/sign-out, and whenever a
 * mutation runs — which covers everything this app actually relies on.
 */

import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { supabase } from "../supabase";
import type { FunctionRef } from "./api";
import { handlers } from "./handlers";

export type { FunctionRef } from "./api";
export { api } from "./api";

/* ── invalidation ─────────────────────────────────────────────────────── */

let version = 0;
const listeners = new Set<() => void>();

/** Tell every mounted query to refetch. Called after each mutation. */
export function invalidateQueries() {
  version += 1;
  for (const listener of listeners) listener();
}

function useBackendVersion() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return version;
}

function runHandler(ref: FunctionRef, args: Record<string, any>) {
  const handler = handlers[ref];
  if (!handler) {
    return Promise.reject(
      new Error(`No backend handler registered for "${ref}"`),
    );
  }
  return handler(args ?? {});
}

/* ── auth context ─────────────────────────────────────────────────────── */

type AuthState = { session: Session | null; loading: boolean };

const AuthContext = createContext<AuthState>({ session: null, loading: true });

export function BackendProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    loading: true,
  });

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setState({ session: data.session ?? null, loading: false });
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) return;
        setState({ session: session ?? null, loading: false });
        // Identity changed — everything that depends on "who am I" is now stale.
        invalidateQueries();
      },
    );

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuthState() {
  return useContext(AuthContext);
}

export function useAuthStatus() {
  const { session, loading } = useAuthState();
  return { isLoading: loading, isAuthenticated: !!session };
}

/* ── queries ──────────────────────────────────────────────────────────── */

export function useQuery<T = any>(
  ref: FunctionRef,
  args?: Record<string, any> | "skip",
): T | undefined {
  const backendVersion = useBackendVersion();
  const { session, loading } = useAuthState();
  const [value, setValue] = useState<T | undefined>(undefined);

  const key = args === "skip" ? "skip" : JSON.stringify(args ?? {});
  const latest = useRef(0);

  useEffect(() => {
    if (args === "skip" || loading) return;
    const requestId = ++latest.current;
    let active = true;

    runHandler(ref, args ?? {})
      .then(result => {
        // Ignore anything that resolves after a newer request was issued.
        if (active && requestId === latest.current) setValue(result as T);
      })
      .catch(error => {
        console.error(`Query ${ref} failed:`, error?.message ?? error);
        if (active && requestId === latest.current) setValue(undefined);
      });

    return () => {
      active = false;
    };
  }, [ref, key, backendVersion, session?.user?.id, loading]);

  return args === "skip" ? undefined : value;
}

/* ── mutations & actions ──────────────────────────────────────────────── */

export function useMutation<T = any>(ref: FunctionRef) {
  return useCallback(
    async (args?: Record<string, any>): Promise<T> => {
      const result = await runHandler(ref, args ?? {});
      invalidateQueries();
      return result as T;
    },
    [ref],
  );
}

/** Actions reach outside the database (Stripe, Printful, email, AI). */
export function useAction<T = any>(ref: FunctionRef) {
  return useCallback(
    async (args?: Record<string, any>): Promise<T> => {
      const result = await runHandler(ref, args ?? {});
      invalidateQueries();
      return result as T;
    },
    [ref],
  );
}

/* ── imperative client ────────────────────────────────────────────────── */

export function useBackend() {
  return useMemo(
    () => ({
      query: (ref: FunctionRef, args?: Record<string, any>) =>
        runHandler(ref, args ?? {}),
      mutation: async (ref: FunctionRef, args?: Record<string, any>) => {
        const result = await runHandler(ref, args ?? {});
        invalidateQueries();
        return result;
      },
      action: async (ref: FunctionRef, args?: Record<string, any>) => {
        const result = await runHandler(ref, args ?? {});
        invalidateQueries();
        return result;
      },
    }),
    [],
  );
}

/* ── auth actions ─────────────────────────────────────────────────────── */

type SignInInput = FormData | Record<string, string | undefined>;

function readInput(input: SignInInput): Record<string, string> {
  if (typeof FormData !== "undefined" && input instanceof FormData) {
    const result: Record<string, string> = {};
    input.forEach((value, key) => {
      result[key] = String(value);
    });
    return result;
  }
  return Object.fromEntries(
    Object.entries(input ?? {}).filter(([, value]) => value !== undefined),
  ) as Record<string, string>;
}

/**
 * Compatible with the previous auth provider's `signIn(provider, formData)`
 * shape, including its `flow` values, so the sign-in, sign-up, email
 * verification and password-reset screens all keep working unchanged.
 */
export function useAuthActions() {
  const signIn = useCallback(
    async (_provider: string, input: SignInInput = {}) => {
      const fields = readInput(input);
      const flow = fields.flow ?? "signIn";
      const email = (fields.email ?? "").trim().toLowerCase();
      const password = fields.password ?? "";
      const code = fields.code ?? "";

      if (flow === "signUp") {
        const metadata: Record<string, string> = {};
        if (fields.name) metadata.name = fields.name;
        if (fields.birthDate) metadata.birth_date = fields.birthDate;
        if (fields.situation) metadata.situation = fields.situation;
        if (fields.genderIdentity) metadata.gender_identity = fields.genderIdentity;
        if (fields.sexualOrientation)
          metadata.sexual_orientation = fields.sexualOrientation;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: Object.keys(metadata).length ? metadata : undefined,
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw new Error(error.message);
        invalidateQueries();
        return { signingIn: true };
      }

      if (flow === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw new Error(error.message);
        return { signingIn: false };
      }

      if (flow === "reset-verification") {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token: code,
          type: "recovery",
        });
        if (verifyError) throw new Error(verifyError.message);
        const { error: updateError } = await supabase.auth.updateUser({
          password,
        });
        if (updateError) throw new Error(updateError.message);
        invalidateQueries();
        return { signingIn: true };
      }

      if (flow === "email-verification") {
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: code,
          type: "email",
        });
        if (error) throw new Error(error.message);
        invalidateQueries();
        return { signingIn: true };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(error.message);
      invalidateQueries();
      return { signingIn: true };
    },
    [],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    invalidateQueries();
  }, []);

  /**
   * OAuth (Google / Facebook / Apple, etc). Redirects the browser to the
   * provider, then back to `${origin}/profile` once Supabase completes the
   * exchange. Throws BEFORE navigating away if the provider isn't enabled in
   * the Supabase Auth dashboard yet, so callers can show a friendly message
   * instead of the browser landing on Supabase's raw JSON error page.
   */
  const signInWithProvider = useCallback(
    async (provider: "google" | "facebook" | "apple") => {
      // skipBrowserRedirect so we can validate the provider is enabled
      // (via a manual, no-follow fetch) before sending the user anywhere.
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/profile`,
          skipBrowserRedirect: true,
        },
      });
      if (error) throw new Error(error.message);
      if (!data?.url) throw new Error("Couldn't start sign-in. Please try again.");

      // A disabled/unsupported provider responds 400 with a JSON error body
      // instead of a 302 redirect to the provider's consent screen. `manual`
      // redirect mode surfaces a real 3xx as an opaque "success" response
      // (status 0, type "opaqueredirect") we can distinguish from an actual
      // 4xx error response, so we can catch this before navigating away.
      try {
        const check = await fetch(data.url, { redirect: "manual" });
        if (check.type !== "opaqueredirect" && check.status >= 400) {
          let msg = "Unsupported provider: provider is not enabled";
          try {
            const body = await check.json();
            msg = body?.msg || body?.message || msg;
          } catch {
            // ignore — use default msg
          }
          throw new Error(msg);
        }
      } catch (checkErr: any) {
        // If the pre-check itself fails (e.g. CORS), fall back to just
        // navigating — better an unexplained redirect than blocking a
        // working provider on a check that couldn't run.
        if (checkErr instanceof Error && checkErr.message !== "Failed to fetch") {
          throw checkErr;
        }
      }

      window.location.assign(data.url);
    },
    [],
  );

  return { signIn, signOut, signInWithProvider };
}
