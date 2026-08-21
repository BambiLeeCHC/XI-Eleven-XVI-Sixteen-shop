import { useAuthActions } from "../lib/backend";
import { useAuthStatus } from "../lib/backend";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LocationAutocomplete } from "../components/LocationAutocomplete";

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
 * Sign-In Page
 *
 * Flow: email + password → if email is unverified, prompt for OTP → verified & signed in
 * OAuth (Google / Apple / Facebook) removed for now.
 */
export function LoginPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useAuthStatus();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [needsVerification, setNeedsVerification] = useState(false);
  const [code, setCode] = useState("");

  const [forgotStep, setForgotStep] = useState<null | "request" | "verify">(null);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");

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
      await signIn("password", { flow: "signIn", email, password });
      navigate("/profile", { replace: true });
    } catch (err: any) {
      const msg = err?.message || "Couldn't sign in.";
      if (
        msg.toLowerCase().includes("email not confirmed") ||
        msg.toLowerCase().includes("not confirmed")
      ) {
        setNeedsVerification(true);
        setError("Please confirm your email first — enter the code we sent you.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn("password", { flow: "email-verification", email, code });
      navigate("/profile", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Invalid code.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResetMessage("");
    setLoading(true);
    try {
      await signIn("password", { flow: "reset", email: resetEmail });
      setResetMessage("Check your email for a reset code.");
      setForgotStep("verify");
    } catch (err: any) {
      setError(err?.message || "Couldn't send reset email.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn("password", {
        flow: "reset-verification",
        email: resetEmail,
        code: resetCode,
        password: newPassword,
      });
      navigate("/profile", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Couldn't reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (forgotStep === "request") {
    return (
      <AuthShell eyebrow="Account recovery" title="Reset Password">
        <form onSubmit={handleForgotRequest} className="space-y-4">
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
          {resetMessage && <p className="text-[12px] text-slate-600 text-center">{resetMessage}</p>}
          <button type="submit" disabled={loading} className={primaryButtonClass} style={primaryButtonStyle}>
            {loading ? "Sending…" : "Send reset code"}
          </button>
          <button
            type="button"
            onClick={() => {
              setForgotStep(null);
              setError("");
            }}
            className="w-full text-[11px] text-slate-500"
          >
            ← Back to sign in
          </button>
        </form>
      </AuthShell>
    );
  }

  if (forgotStep === "verify") {
    return (
      <AuthShell eyebrow="Account recovery" title="New Password">
        <form onSubmit={handleForgotVerify} className="space-y-4">
          <div>
            <label className={labelClass}>CODE</label>
            <input
              type="text"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              placeholder="6-digit code"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>NEW PASSWORD</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
              required
            />
          </div>
          {error && <ErrorText>{error}</ErrorText>}
          <button type="submit" disabled={loading} className={primaryButtonClass} style={primaryButtonStyle}>
            {loading ? "Saving…" : "Update password"}
          </button>
        </form>
      </AuthShell>
    );
  }

  if (needsVerification) {
    return (
      <AuthShell eyebrow="Almost there" title="Confirm Email">
        <form onSubmit={handleVerify} className="space-y-4">
          <p className="text-[13px] text-slate-500 text-center">
            Enter the code we sent to <strong>{email}</strong>
          </p>
          <div>
            <label className={labelClass}>CODE</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6-digit code"
              className={inputClass}
              required
            />
          </div>
          {error && <ErrorText>{error}</ErrorText>}
          <button type="submit" disabled={loading} className={primaryButtonClass} style={primaryButtonStyle}>
            {loading ? "Verifying…" : "Verify & sign in"}
          </button>
        </form>
      </AuthShell>
    );
  }

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
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}

/**
 * Sign-Up Page — email + password only (OAuth removed).
 */
export function SignupPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useAuthStatus();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthLocation, setBirthLocation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

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
        flow: "signUp",
        email,
        password,
        name,
        birthDate,
        birthTime,
        birthLocation,
      });
      if (result?.signingIn) {
        navigate("/profile", { replace: true });
      } else {
        setCheckEmail(true);
      }
    } catch (err: any) {
      setError(err?.message || "Couldn't create account.");
    } finally {
      setLoading(false);
    }
  };

  if (checkEmail) {
    return (
      <AuthShell eyebrow="Check your inbox" title="Confirm your email">
        <p className="text-[13px] text-slate-600 text-center leading-relaxed">
          We sent a confirmation link to <strong>{email}</strong>. Open it to finish setting up your account.
        </p>
        <p className="text-[12px] text-slate-500 text-center mt-4">
          Already confirmed?{" "}
          <Link to="/login" className={linkClass} style={linkStyle}>
            Sign in
          </Link>
        </p>
      </AuthShell>
    );
  }

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
          <label className={labelClass}>PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputClass}
            required
            minLength={8}
          />
        </div>
        <div>
          <label className={labelClass}>BIRTH DATE</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>BIRTH TIME (optional)</label>
          <input
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>BIRTH LOCATION (optional)</label>
          <LocationAutocomplete value={birthLocation} onChange={setBirthLocation} className={inputClass} />
        </div>
        {error && <ErrorText>{error}</ErrorText>}
        <button type="submit" disabled={loading} className={primaryButtonClass} style={primaryButtonStyle}>
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
