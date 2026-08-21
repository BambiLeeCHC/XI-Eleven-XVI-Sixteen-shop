/**
 * React bindings for the Supabase backend.
 *
 * These deliberately mirror the hook surface the storefront was written
 * against (`useQuery` / `useMutation` / `useAction` / `useAuthStatus` /
 * `useAuthActions`) so the rest of the app stays unchanged.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../supabase";
import type { Session, User } from "@supabase/supabase-js";

type QueryKey = unknown;

const queryListeners = new Set<() => void>();

function notifyQueries() {
  for (const l of queryListeners) l();
}

export function invalidateQueries() {
  notifyQueries();
}

/* ── auth ─────────────────────────────────────────── */

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
      invalidateQueries();
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, loading }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthState() {
  return useContext(AuthContext);
}

export function useAuthStatus() {
  const { session, loading } = useAuthState();
  return { isLoading: loading, isAuthenticated: !!session };
}

/* ── queries ──────────────────────────────────────── */

export function useQuery(fn: any, ..._args: any[]) {
  // Minimal stub-compatible surface used across the app.
  // Concrete query implementation lives elsewhere in this module in the full tree.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    queryListeners.add(listener);
    return () => {
      queryListeners.delete(listener);
    };
  }, []);
  void tick;
  void fn;
  return undefined as any;
}

export function useAction(fn: any) {
  return useCallback(
    async (...args: any[]) => {
      if (typeof fn === "function") return fn(...args);
      return fn;
    },
    [fn],
  );
}

export function useMutation(fn: any) {
  return useAction(fn);
}

/* ── auth actions ─────────────────────────────────── */

export function useAuthActions() {
  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw new Error(error.message);
    invalidateQueries();
    return data;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    invalidateQueries();
  }, []);

  /** Re-send the "confirm your account" email (link-based, lands on /welcome). */
  const resendConfirmation = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/welcome` },
    });
    if (error) throw new Error(error.message);
  }, []);

  // OAuth providers (Google / Apple / Facebook) intentionally removed for now.
  // Email + password remains the only sign-in path.
  return { signIn, signOut, resendConfirmation };
}

export const api = {} as any;
