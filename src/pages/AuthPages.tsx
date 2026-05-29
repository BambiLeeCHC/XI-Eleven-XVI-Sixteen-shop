import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * Sign-In Page
 *
 * Flow: email + password → if email is unverified, prompt for OTP → verified & signed in
 */
export function LoginPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP verification step (for unverified accounts)
  const [needsVerification, setNeedsVerification] = useState(false);
  const [code, setCode] = useState("");

  // Redirect if already authenticated
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
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <p className="text-[10px] tracking-[0.3em] uppercase text-purple-400/60 mb-2 text-center">
            VERIFY YOUR EMAIL
          </p>
          <h1
            className="text-3xl text-white font-light mb-3 text-center"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Enter Code
          </h1>
          <p className="text-[13px] text-white/40 text-center mb-8">
            We sent a 6-digit code to{" "}
            <span className="text-white/60">{email}</span>
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <OTPInput value={code} onChange={setCode} />

            {error && <p className="text-[12px] text-red-400 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full py-3 text-[11px] tracking-[0.25em] uppercase font-bold text-white transition-all disabled:opacity-50 rounded-md"
              style={{
                background: "linear-gradient(135deg, #a855f7, #7c3aed)",
              }}
            >
              {loading ? "VERIFYING..." : "VERIFY & SIGN IN"}
            </button>
          </form>

          <p className="text-center text-[12px] text-white/30 mt-6">
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
              className="text-purple-400 hover:text-purple-300"
            >
              Resend
            </button>
          </p>

          <p className="text-center text-[12px] text-white/30 mt-3">
            <button
              onClick={() => {
                setNeedsVerification(false);
                setCode("");
                setError("");
              }}
              className="text-white/40 hover:text-white/60"
            >
              ← Back to sign in
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Main sign-in screen
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-[10px] tracking-[0.3em] uppercase text-purple-400/60 mb-2 text-center">
          WELCOME BACK
        </p>
        <h1
          className="text-3xl text-white font-light mb-8 text-center"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Sign In
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] tracking-[0.25em] uppercase text-white/50 font-semibold mb-2">
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white/5 border border-white/10 text-white/80 placeholder-white/25 px-4 py-3 text-sm outline-none focus:border-purple-400/40 transition-colors rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.25em] uppercase text-white/50 font-semibold mb-2">
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 text-white/80 placeholder-white/25 px-4 py-3 text-sm outline-none focus:border-purple-400/40 transition-colors rounded-md"
              required
            />
          </div>

          {error && <p className="text-[12px] text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-[11px] tracking-[0.25em] uppercase font-bold text-white transition-all disabled:opacity-50 rounded-md"
            style={{
              background: "linear-gradient(135deg, #a855f7, #7c3aed)",
            }}
          >
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>
        </form>

        <p className="text-center text-[12px] text-white/40 mt-6">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-purple-400 hover:text-purple-300"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

/**
 * Sign-Up Page
 *
 * Flow: email + password → OTP verification → signed in
 */
export function SignupPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP verification step
  const [needsVerification, setNeedsVerification] = useState(false);
  const [code, setCode] = useState("");

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
        email,
        password,
        flow: "signUp",
      });
      // signUp with email verify always returns signingIn: false → needs OTP
      if (result?.signingIn === false) {
        setNeedsVerification(true);
      }
      // In case it signs in directly
    } catch (err: any) {
      const msg = err?.message || "";
      if (
        msg.toLowerCase().includes("already") ||
        msg.toLowerCase().includes("exists")
      ) {
        setError(
          "An account with this email already exists. Try signing in instead."
        );
      } else {
        setError("Could not create account. Please try again.");
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
      // useEffect handles redirect
    } catch {
      setError("Invalid or expired code. Please try again.");
    }
    setLoading(false);
  };

  // OTP verification screen
  if (needsVerification) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <p className="text-[10px] tracking-[0.3em] uppercase text-purple-400/60 mb-2 text-center">
            ALMOST THERE
          </p>
          <h1
            className="text-3xl text-white font-light mb-3 text-center"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Verify Email
          </h1>
          <p className="text-[13px] text-white/40 text-center mb-8">
            We sent a 6-digit code to{" "}
            <span className="text-white/60">{email}</span>
            <br />
            <span className="text-white/25 text-[11px]">
              Check your inbox (and spam folder)
            </span>
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <OTPInput value={code} onChange={setCode} />

            {error && (
              <p className="text-[12px] text-red-400 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full py-3 text-[11px] tracking-[0.25em] uppercase font-bold text-white transition-all disabled:opacity-50 rounded-md"
              style={{
                background: "linear-gradient(135deg, #a855f7, #7c3aed)",
              }}
            >
              {loading ? "VERIFYING..." : "VERIFY & CREATE ACCOUNT"}
            </button>
          </form>

          <p className="text-center text-[12px] text-white/30 mt-6">
            Didn't get a code?{" "}
            <button
              onClick={async () => {
                setError("");
                try {
                  await signIn("password", {
                    email,
                    password,
                    flow: "signUp",
                  });
                } catch {
                  // Expected — re-sends OTP
                }
                setError("A new code has been sent.");
              }}
              className="text-purple-400 hover:text-purple-300"
            >
              Resend
            </button>
          </p>

          <p className="text-center text-[12px] text-white/30 mt-3">
            <button
              onClick={() => {
                setNeedsVerification(false);
                setCode("");
                setError("");
              }}
              className="text-white/40 hover:text-white/60"
            >
              ← Back
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Main sign-up screen
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-[10px] tracking-[0.3em] uppercase text-purple-400/60 mb-2 text-center">
          JOIN THE INNER CIRCLE
        </p>
        <h1
          className="text-3xl text-white font-light mb-8 text-center"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] tracking-[0.25em] uppercase text-white/50 font-semibold mb-2">
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white/5 border border-white/10 text-white/80 placeholder-white/25 px-4 py-3 text-sm outline-none focus:border-purple-400/40 transition-colors rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.25em] uppercase text-white/50 font-semibold mb-2">
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full bg-white/5 border border-white/10 text-white/80 placeholder-white/25 px-4 py-3 text-sm outline-none focus:border-purple-400/40 transition-colors rounded-md"
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-[12px] text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-[11px] tracking-[0.25em] uppercase font-bold text-white transition-all disabled:opacity-50 rounded-md"
            style={{
              background: "linear-gradient(135deg, #a855f7, #7c3aed)",
            }}
          >
            {loading ? "CREATING..." : "CREATE ACCOUNT"}
          </button>
        </form>

        <p className="text-center text-[12px] text-white/40 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-purple-400 hover:text-purple-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
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
          className="w-11 h-14 text-center text-xl font-mono text-white bg-white/5 border border-white/15 rounded-lg focus:border-purple-400/60 focus:bg-white/[0.08] outline-none transition-all"
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}
