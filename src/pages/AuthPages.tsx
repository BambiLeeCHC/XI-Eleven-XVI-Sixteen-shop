import { useAuthActions } from "../lib/backend";
import { useAuthStatus } from "../lib/backend";
import { api, useAction } from "../lib/backend";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

/* ── shared shell (matches the light showroom theme used everywhere else) ── */

function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <p
          className="text-[10px] tracking-[0.3em] uppercase font-semibold text-center"
          style={{ color: "var(--showroom-gold)" }}
        >
          {eyebrow}
        </p>
        <h1
          className="text-3xl font-light mt-2 mb-3 text-center"
          style={{ fontFamily: "var(--font-display)", color: "var(--showroom-ink)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13px] text-slate-500 text-center mb-8">{subtitle}</p>
        )}

        <div className="p-6 rounded-2xl border border-[rgba(92,155,205,0.18)] bg-white/80 shadow-sm">
          {children}
        </div>

        {footer && <div className="text-center text-[12px] text-slate-500 mt-6">{footer}</div>}
      </div>
    </div>
  );
}

const inputClass =
  "w-full bg-white border border-[rgba(92,155,205,0.25)] text-[15px] placeholder-slate-400 px-4 py-3 outline-none focus:border-[rgba(185,149,69,0.55)] transition-colors rounded-md";

const labelClass =
  "block text-[10px] tracking-[0.25em] uppercase text-slate-500 font-semibold mb-2";

const primaryButtonClass =
  "w-full py-3 text-[11px] tracking-[0.25em] uppercase font-bold text-white transition-all disabled:opacity-50 rounded-md";

const primaryButtonStyle = {
  background: "linear-gradient(135deg, var(--showroom-gold), #8f6f2e)",
};

const linkClass = "font-semibold";
const linkStyle = { color: "var(--showroom-gold)" };

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] text-red-500 text-center">{children}</p>;
}

/**
 * Birth location field with live autocomplete, backed by a real geocoding
 * search (OpenStreetMap Nominatim, via /api/chart?kind=geocode-search) —
 * not a static list. Debounced as-you-type; picking a suggestion locks in
 * the exact place name Nominatim resolved, which is what actually drives
 * chart accuracy.
 */
function LocationAutocomplete({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const search = useAction(api.geocode.search);
  const [suggestions, setSuggestions] = useState<{ displayName: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (text: string) => {
    onChange(text);
    setOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestRef.current;
      try {
        const result = await search({ q: text });
        if (requestId !== requestRef.current) return; // stale response
        setSuggestions(result?.suggestions ?? []);
      } catch {
        if (requestId === requestRef.current) setSuggestions([]);
      } finally {
        if (requestId === requestRef.current) setLoading(false);
      }
    }, 350);
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => value.trim().length >= 2 && setOpen(true)}
        placeholder="City, State/Country"
        autoComplete="off"
        className={inputClass}
      />
      {open && (loading || suggestions.length > 0) && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-[rgba(92,155,205,0.25)] rounded-md shadow-lg max-h-60 overflow-auto">
          {loading && suggestions.length === 0 && (
            <div className="px-4 py-3 text-[13px] text-slate-400">Searching...</div>
          )}
          {suggestions.map((s, i) => (
            <button
              key={`${s.displayName}-${i}`}
              type="button"
              onClick={() => {
                onChange(s.displayName);
                setSuggestions([]);
                setOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-[13px] text-slate-600 hover:bg-[rgba(185,149,69,0.08)] transition-colors"
            >
              {s.displayName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── social login ─────────────────────────────────────────────────────── */

function SocialButtons({ onError }: { onError: (msg: string) => void }) {
  const { signInWithProvider } = useAuthActions() as any;
  const [pending, setPending] = useState<string | null>(null);

  const handleClick = async (provider: "google" | "facebook" | "apple") => {
    setPending(provider);
    onError("");
    try {
      await signInWithProvider(provider);
      // Browser is redirected away by Supabase; nothing else to do here.
    } catch (err: any) {
      setPending(null);
      onError(
        err?.message?.toLowerCase().includes("provider is not enabled") ||
          err?.message?.toLowerCase().includes("unsupported provider")
          ? "That sign-in method isn't turned on yet — use email for now."
          : err?.message || "Couldn't start sign-in. Please try again.",
      );
    }
  };

  return (
    <div className="space-y-2.5 mb-6">
      <SocialButton
        label="Continue with Google"
        loading={pending === "google"}
        onClick={() => handleClick("google")}
        icon={<GoogleIcon />}
      />
      <SocialButton
        label="Continue with Apple"
        loading={pending === "apple"}
        onClick={() => handleClick("apple")}
        icon={<AppleIcon />}
      />
      <SocialButton
        label="Continue with Facebook"
        loading={pending === "facebook"}
        onClick={() => handleClick("facebook")}
        icon={<FacebookIcon />}
      />

      <div className="flex items-center gap-3 pt-3">
        <div className="h-px flex-1 bg-[rgba(92,155,205,0.2)]" />
        <span className="text-[10px] tracking-[0.2em] uppercase text-slate-400">or</span>
        <div className="h-px flex-1 bg-[rgba(92,155,205,0.2)]" />
      </div>
    </div>
  );
}

function SocialButton({
  label,
  icon,
  loading,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3 rounded-md border border-[rgba(92,155,205,0.25)] bg-white text-[13px] font-medium text-slate-700 transition-all hover:border-[rgba(185,149,69,0.5)] hover:bg-[rgba(185,149,69,0.05)] disabled:opacity-50"
    >
      <span className="w-4 h-4 flex items-center justify-center shrink-0">{icon}</span>
      {loading ? "Redirecting…" : label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.67-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.67-.35-1.38-.35-2.1s.13-1.43.35-2.1V7.06H2.18A10.97 10.97 0 001 12c0 1.77.43 3.44 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="#111">
      <path d="M16.36 1.43c.1 1.06-.28 2.1-.94 2.9-.68.82-1.8 1.46-2.9 1.38-.12-1.03.32-2.1.97-2.85.7-.83 1.9-1.44 2.87-1.43zM20.7 17.35c-.5 1.15-.75 1.66-1.4 2.67-.9 1.4-2.16 3.15-3.72 3.16-1.4.02-1.75-.9-3.65-.9-1.9 0-2.3.88-3.68.9-1.55.03-2.73-1.58-3.64-2.98C2.24 17.3 1.4 12.6 3.4 9.4c1.03-1.62 2.66-2.65 4.4-2.68 1.4-.02 2.28.94 3.65.94 1.34 0 2.05-.94 3.66-.94 1.5.02 3.08.8 4.1 2.16-3.6 2-3.02 6.9 1.5 8.47z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16">
      <path
        fill="#1877F2"
        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 5.02 3.16 9.31 7.63 10.94v-7.62H5.32V12.4h2.31V9.86c0-2.28 1.36-3.54 3.43-3.54.99 0 2.03.18 2.03.18v2.5H12.1c-1.14 0-1.5.71-1.5 1.44v1.96h2.56l-.41 2.99h-2.15v7.62C20.84 21.38 24 17.09 24 12.07z"
      />
    </svg>
  );
}

/**
 * Sign-In Page
 *
 * Flow: email + password → if email is unverified, prompt for OTP → verified & signed in
 */
export function LoginPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useAuthStatus();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP verification step (for unverified accounts)
  const [needsVerification, setNeedsVerification] = useState(false);
  const [code, setCode] = useState("");

  // Forgot-password flow: "request" (enter email) → "verify" (enter code + new password)
  const [forgotStep, setForgotStep] = useState<null | "request" | "verify">(null);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/profile", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResetMessage("");
    setLoading(true);
    try {
      await signIn("password", { email: resetEmail, flow: "reset" });
      setForgotStep("verify");
    } catch {
      setError("Couldn't send a reset code. Double-check the email and try again.");
    }
    setLoading(false);
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn("password", {
        email: resetEmail,
        code: resetCode,
        newPassword,
        flow: "reset-verification",
      });
      // useEffect handles redirect on auth state change
    } catch {
      setError("Invalid or expired code. Please try again.");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("password", { email, password, flow: "signIn" });
      if (result?.signingIn === false) {
        // Email not verified — send OTP and show verification input
        setNeedsVerification(true);
      }
      // If signingIn is true, useEffect above handles redirect
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.toLowerCase().includes("verify") || msg.toLowerCase().includes("verification")) {
        // Account exists but needs verification
        setNeedsVerification(true);
      } else if (msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("could not")) {
        setError("Invalid email or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
    setLoading(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn("password", { email, code, flow: "email-verification" });
      // useEffect handles redirect on auth state change
    } catch {
      setError("Invalid or expired code. Please try again.");
    }
    setLoading(false);
  };

  // OTP verification screen
  if (needsVerification) {
    return (
      <AuthShell
        eyebrow="Verify your email"
        title="Enter Code"
        subtitle={
          <>
            We sent a 6-digit code to <span className="text-slate-700">{email}</span>
          </>
        }
      >
        <form onSubmit={handleVerify} className="space-y-4">
          <OTPInput value={code} onChange={setCode} />

          {error && <ErrorText>{error}</ErrorText>}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className={primaryButtonClass}
            style={primaryButtonStyle}
          >
            {loading ? "VERIFYING..." : "VERIFY & SIGN IN"}
          </button>
        </form>

        <p className="text-center text-[12px] text-slate-500 mt-6">
          Didn't get a code?{" "}
          <button
            onClick={async () => {
              setError("");
              try {
                await signIn("password", { email, password, flow: "signIn" });
              } catch {
                // Expected — re-sends OTP
              }
              setError("A new code has been sent.");
            }}
            className={linkClass}
            style={linkStyle}
          >
            Resend
          </button>
        </p>

        <p className="text-center text-[12px] text-slate-400 mt-3">
          <button
            onClick={() => {
              setNeedsVerification(false);
              setCode("");
              setError("");
            }}
            className="hover:text-slate-600"
          >
            ← Back to sign in
          </button>
        </p>
      </AuthShell>
    );
  }

  // Forgot-password: step 1 — enter email to request a reset code
  if (forgotStep === "request") {
    return (
      <AuthShell
        eyebrow="Reset password"
        title="Forgot Password"
        subtitle="Enter your account email and we'll send you a 6-digit code to reset your password."
      >
        <form onSubmit={handleRequestReset} className="space-y-4">
          <div>
            <label className={labelClass}>EMAIL</label>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
              required
            />
          </div>

          {error && <ErrorText>{error}</ErrorText>}

          <button type="submit" disabled={loading} className={primaryButtonClass} style={primaryButtonStyle}>
            {loading ? "SENDING..." : "SEND RESET CODE"}
          </button>
        </form>

        <p className="text-center text-[12px] text-slate-400 mt-6">
          <button
            onClick={() => {
              setForgotStep(null);
              setError("");
            }}
            className="hover:text-slate-600"
          >
            ← Back to sign in
          </button>
        </p>
      </AuthShell>
    );
  }

  // Forgot-password: step 2 — enter code + choose new password
  if (forgotStep === "verify") {
    return (
      <AuthShell
        eyebrow="Reset password"
        title="Enter Code"
        subtitle={
          <>
            We sent a 6-digit code to <span className="text-slate-700">{resetEmail}</span>
          </>
        }
      >
        <form onSubmit={handleConfirmReset} className="space-y-4">
          <OTPInput value={resetCode} onChange={setResetCode} />

          <div>
            <label className={labelClass}>NEW PASSWORD</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
              required
              minLength={8}
            />
          </div>

          {error && <ErrorText>{error}</ErrorText>}
          {resetMessage && <p className="text-[12px] text-emerald-600 text-center">{resetMessage}</p>}

          <button
            type="submit"
            disabled={loading || resetCode.length !== 6 || newPassword.length < 8}
            className={primaryButtonClass}
            style={primaryButtonStyle}
          >
            {loading ? "RESETTING..." : "RESET & SIGN IN"}
          </button>
        </form>

        <p className="text-center text-[12px] text-slate-500 mt-6">
          <button
            onClick={async () => {
              setError("");
              try {
                await signIn("password", { email: resetEmail, flow: "reset" });
              } catch {
                // Expected — re-sends OTP
              }
              setResetMessage("A new code has been sent.");
            }}
            className={linkClass}
            style={linkStyle}
          >
            Resend code
          </button>
        </p>

        <p className="text-center text-[12px] text-slate-400 mt-3">
          <button
            onClick={() => {
              setForgotStep(null);
              setResetCode("");
              setNewPassword("");
              setError("");
              setResetMessage("");
            }}
            className="hover:text-slate-600"
          >
            ← Back to sign in
          </button>
        </p>
      </AuthShell>
    );
  }

  // Main sign-in screen
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign In"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/signup" className={linkClass} style={linkStyle}>
            Create one
          </Link>
        </>
      }
    >
      <SocialButtons onError={setError} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>EMAIL</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputClass}
            required
          />
          <button
            type="button"
            onClick={() => {
              setResetEmail(email);
              setError("");
              setForgotStep("request");
            }}
            className="mt-2 text-[11px] font-semibold"
            style={linkStyle}
          >
            Forgot password?
          </button>
        </div>

        {error && <ErrorText>{error}</ErrorText>}

        <button type="submit" disabled={loading} className={primaryButtonClass} style={primaryButtonStyle}>
          {loading ? "SIGNING IN..." : "SIGN IN"}
        </button>
      </form>
    </AuthShell>
  );
}

/**
 * Sign-Up Page
 *
 * Flow: email + password → OTP verification → signed in
 */
export function SignupPage() {
  const { signIn, resendConfirmation } = useAuthActions() as any;
  const { isAuthenticated } = useAuthStatus();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthLocation, setBirthLocation] = useState("");
  const [genderIdentity, setGenderIdentity] = useState("");
  const [sexualOrientation, setSexualOrientation] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Post-registration: waiting for the user to click the confirmation
  // link in their email (lands them on /welcome, signed in).
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");

  // Redirect once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/profile", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("password", {
        name,
        email,
        password,
        birthDate,
        birthTime,
        birthLocation,
        genderIdentity,
        sexualOrientation,
        flow: "signUp",
      });
      // Email confirmation is required on this project, so signUp never
      // returns a live session — show the "check your email" screen.
      if (result?.signingIn === false) {
        setAwaitingConfirmation(true);
      }
      // In case confirmation is ever turned off, useEffect handles redirect.
    } catch (err: any) {
      const msg = err?.message || "";
      if (
        msg.toLowerCase().includes("already") ||
        msg.toLowerCase().includes("exists")
      ) {
        setError(
          "An account with this email already exists. Try signing in instead.",
        );
      } else {
        setError("Could not create account. Please try again.");
      }
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResendState("sending");
    try {
      await resendConfirmation(email);
    } catch {
      // Even on error, don't reveal account-enumeration details — show sent.
    }
    setResendState("sent");
  };

  // "Check your email" screen — shown after a successful sign-up, until the
  // user clicks the confirmation link in their inbox.
  if (awaitingConfirmation) {
    return (
      <AuthShell
        eyebrow="Almost there"
        title="Check Your Email"
        subtitle={
          <>
            We sent a confirmation link to <span className="text-slate-700">{email}</span>.
            <br />
            <span className="text-slate-400 text-[11px]">
              Click it to finish setting up your account — check spam if it doesn't show up in a minute.
            </span>
          </>
        }
      >
        <div className="flex flex-col items-center gap-5 py-2">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
            style={{ background: "rgba(185,149,69,0.12)" }}
            aria-hidden="true"
          >
            ✉️
          </div>
          <p className="text-[13px] text-slate-500 text-center">
            Once you confirm, you'll land on your personal astrology page — your free natal
            chart included.
          </p>

          <button
            type="button"
            onClick={handleResend}
            disabled={resendState === "sending"}
            className={linkClass}
            style={{ ...linkStyle, fontSize: 12 }}
          >
            {resendState === "sending"
              ? "Sending…"
              : resendState === "sent"
                ? "Sent — check your inbox"
                : "Didn't get it? Resend the link"}
          </button>
        </div>

        <p className="text-center text-[12px] text-slate-400 mt-3">
          <button
            onClick={() => {
              setAwaitingConfirmation(false);
              setResendState("idle");
              setError("");
            }}
            className="hover:text-slate-600"
          >
            ← Back
          </button>
        </p>
      </AuthShell>
    );
  }

  // Main sign-up screen
  return (
    <AuthShell
      eyebrow="Join the inner circle"
      title="Create Account"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className={linkClass} style={linkStyle}>
            Sign in
          </Link>
        </>
      }
    >
      <SocialButtons onError={setError} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>NAME</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>EMAIL</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>BIRTH DATE</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            autoComplete="bday"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>BIRTH TIME</label>
          <input
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            className={inputClass}
          />
          <p className="text-[12px] text-slate-400 mt-1">
            Powers your free natal chart — the closer to exact, the more accurate it is. Don't know it? Leave it blank.
          </p>
        </div>
        <div>
          <label className={labelClass}>BIRTH LOCATION</label>
          <LocationAutocomplete value={birthLocation} onChange={setBirthLocation} />
          <p className="text-[12px] text-slate-400 mt-1">
            Where you were born — also used for your natal chart.
          </p>
        </div>
        <div>
          <label className={labelClass}>GENDER IDENTITY</label>
          <select
            value={genderIdentity}
            onChange={(e) => setGenderIdentity(e.target.value)}
            className={inputClass}
          >
            <option value="">Prefer not to say</option>
            <option value="woman">Woman</option>
            <option value="man">Man</option>
            <option value="nonbinary">Non-binary</option>
            <option value="self-described">Prefer to self-describe</option>
          </select>
          <p className="text-[12px] text-slate-400 mt-1">
            Helps us personalize your readings — optional.
          </p>
        </div>
        <div>
          <label className={labelClass}>SEXUAL ORIENTATION</label>
          <select
            value={sexualOrientation}
            onChange={(e) => setSexualOrientation(e.target.value)}
            className={inputClass}
          >
            <option value="">Prefer not to say</option>
            <option value="straight">Straight</option>
            <option value="gay">Gay</option>
            <option value="lesbian">Lesbian</option>
            <option value="bisexual">Bisexual</option>
            <option value="queer">Queer</option>
            <option value="asexual">Asexual</option>
            <option value="self-described">Prefer to self-describe</option>
          </select>
          <p className="text-[12px] text-slate-400 mt-1">
            Also optional — used the same way, to personalize your readings.
          </p>
        </div>
        <div>
          <label className={labelClass}>PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
            className={inputClass}
            required
            minLength={6}
          />
        </div>

        {error && <ErrorText>{error}</ErrorText>}

        <button type="submit" disabled={loading} className={primaryButtonClass} style={primaryButtonStyle}>
          {loading ? "CREATING..." : "CREATE ACCOUNT"}
        </button>
      </form>
    </AuthShell>
  );
}

/**
 * OTP Code Input — 6 individual digit boxes
 */
function OTPInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    // Only allow digits
    if (char && !/^\d$/.test(char)) return;

    const arr = value.split("");
    arr[index] = char;
    const newVal = arr.join("").slice(0, 6);
    onChange(newVal);

    // Auto-focus next input
    if (char && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    // Focus the input after last pasted digit
    const focusIdx = Math.min(pasted.length, 5);
    inputsRef.current[focusIdx]?.focus();
  };

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-11 h-14 text-center text-xl font-mono border border-[rgba(92,155,205,0.25)] rounded-lg focus:border-[rgba(185,149,69,0.55)] outline-none transition-all"
          style={{ color: "var(--showroom-ink)" }}
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}
