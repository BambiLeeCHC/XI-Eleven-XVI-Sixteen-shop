import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SEO } from "../components/SEO";
import { supabase } from "../lib/supabase";
import { invalidateQueries } from "../lib/backend";

/**
 * Handles the Supabase recovery redirect.
 *
 * Flow:
 * 1. User requests reset → `resetPasswordForEmail` emails a link with
 *    redirectTo = /reset-password
 * 2. User opens the link → Supabase puts a recovery session in the URL
 *    (detectSessionInUrl + PKCE)
 * 3. This page waits for that session, then lets the user set a new password
 *    via `updateUser({ password })`.
 */
export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;

    // Supabase may need a moment to exchange the recovery token from the URL.
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!active) return;
        // PASSWORD_RECOVERY is fired when the recovery link is consumed.
        // SIGNED_IN also occurs after a successful exchange.
        if (
          event === "PASSWORD_RECOVERY" ||
          (event === "SIGNED_IN" && session)
        ) {
          setHasRecoverySession(true);
          setReady(true);
        }
      },
    );

    // Also check any session already present (e.g. after refresh).
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) {
        setHasRecoverySession(true);
      }
      setReady(true);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;
      invalidateQueries();
      setDone(true);
      // Brief pause so the user sees success, then send them to their profile.
      setTimeout(() => navigate("/profile", { replace: true }), 1400);
    } catch (err: any) {
      setError(err?.message || "Could not update password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "fld-lock light";
  const labelClass = "label-lock block mb-2";
  const primaryButtonClass = "cta-pist-block";
  const primaryButtonStyle = { boxShadow: "6px 6px 0 #0B0B0C", color: "#142010" };

  return (
    <div
      className="min-h-[70vh] px-6 py-16"
      style={{ background: "var(--cream)", color: "#0B0B0C" }}
    >
      <SEO
        title="Set new password"
        description="Choose a new password for your xixvi.shop account."
        url="/reset-password"
        noindex
      />
      <div className="w-full max-w-[980px] mx-auto">
        <p className="label-lock" style={{ color: "#0B0B0C" }}>
          Account recovery
        </p>
        <h1 className="clash text-6xl md:text-8xl mt-3">New password</h1>
        <p className="serif-quiet text-2xl mt-4 max-w-2xl">
          Choose a strong password for your account.
        </p>

        <div
          className="mt-7 p-9"
          style={{ border: "2px solid #0B0B0C", background: "#F7F0E6" }}
        >
          {!ready && (
            <p className="text-[13px] text-slate-600 text-center">
              Confirming your recovery link…
            </p>
          )}

          {ready && !hasRecoverySession && !done && (
            <div className="space-y-4 text-center">
              <p className="text-[13px] text-slate-600 leading-relaxed">
                This page only works from the reset link we email you. Request a
                new link from the sign-in page, then open it on this device.
              </p>
              <Link
                to="/login"
                className={primaryButtonClass}
                style={{ ...primaryButtonStyle, display: "block", textAlign: "center" }}
              >
                Back to sign in
              </Link>
            </div>
          )}

          {ready && hasRecoverySession && !done && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>NEW PASSWORD</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className={labelClass}>CONFIRM PASSWORD</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              {error && (
                <p className="text-[12px] text-red-500 text-center">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className={primaryButtonClass}
                style={primaryButtonStyle}
              >
                {loading ? "Saving…" : "Update password"}
              </button>
            </form>
          )}

          {done && (
            <p className="text-[13px] text-slate-600 text-center leading-relaxed">
              Password updated. Taking you to your profile…
            </p>
          )}
        </div>

        <div className="serif-quiet text-center mt-6">
          <Link to="/login" className="underline font-semibold" style={{ color: "#0B0B0C" }}>
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
