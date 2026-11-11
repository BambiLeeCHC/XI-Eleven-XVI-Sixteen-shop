import { type ReactNode, useState } from "react";
import { CREST_URL } from "./brand";
import { api, useAuthStatus, useMutation, useQuery } from "./backend";
import {
  canSeeTrueNorth,
  parseTrueNorthAllowlist,
  trueNorthFlagOn,
} from "./trueNorthAccess";
import "../true-north-soon.css";

export function trueNorthPublicEnabled() {
  return trueNorthFlagOn(import.meta.env.VITE_TRUE_NORTH_ENABLED);
}

export function clientAllowlist() {
  return parseTrueNorthAllowlist(import.meta.env.VITE_TRUE_NORTH_ALLOWLIST);
}

export function useTrueNorthAccess() {
  const enabled = trueNorthPublicEnabled();
  const { isLoading, isAuthenticated } = useAuthStatus();
  const me = useQuery(
    api.auth.currentUser,
    !enabled && isAuthenticated ? {} : "skip",
  ) as { _id?: string; email?: string; role?: string } | null | undefined;

  if (enabled) return { allowed: true, loading: false };
  if (isLoading) return { allowed: false, loading: true };
  if (isAuthenticated && me === undefined) return { allowed: false, loading: true };
  return {
    allowed: canSeeTrueNorth({
      enabled: false,
      role: me?.role,
      email: me?.email,
      userId: me?._id,
      allowlist: clientAllowlist(),
    }),
    loading: false,
  };
}

export function TrueNorthGate({ children }: { children: ReactNode }) {
  const access = useTrueNorthAccess();
  if (access.loading) return <div className="tn-soon" aria-busy="true" />;
  if (!access.allowed) return <TrueNorthComingSoon />;
  return children;
}

export function TrueNorthComingSoon() {
  const subscribe = useMutation(api.newsletter.subscribe);
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = email.trim();
    if (!value) return;
    try {
      await subscribe({ email: value });
      setNote("We'll write when it opens.");
      setEmail("");
    } catch {
      setNote("That didn't save. Try again in a moment.");
    }
  };

  return (
    <section className="tn-soon">
      <div className="tn-soon__stage">
        <span className="tn-soon__glow" aria-hidden="true" />
        <img src={CREST_URL} alt="" className="tn-soon__mark" />
        <p className="tn-soon__kicker">XI · XVI</p>
        <h1>True North</h1>
        <p className="tn-soon__line">True North is coming soon.</p>
        <form className="tn-soon__form" onSubmit={send}>
          <label htmlFor="tn-soon-email">Email</label>
          <div>
            <input
              id="tn-soon-email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              onChange={event => setEmail(event.target.value)}
            />
            <button type="submit">Notify me</button>
          </div>
        </form>
        {note ? <p className="tn-soon__note">{note}</p> : null}
      </div>
    </section>
  );
}
