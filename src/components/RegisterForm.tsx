import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LocationAutocomplete } from "./LocationAutocomplete";
import { useAuthActions } from "../lib/backend";

const inputClass = "fld-lock light";
const labelClass = "label-lock block mb-2";
const primaryButtonClass = "cta-pist-block";
const primaryButtonStyle = { boxShadow: "6px 6px 0 #0B0B0C", color: "#142010" };

/**
 * Live signup fields. Birth date AND location are required for the natal
 * chart; birth time is optional. Shared by /signup and True North so the
 * restyle cannot drop the registration card again.
 */
export function RegisterForm({
  redirectTo = "/chart",
  showSignInLink = true,
}: {
  redirectTo?: string;
  showSignInLink?: boolean;
}) {
  const { signIn } = useAuthActions();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!birthDate.trim() || !birthLocation.trim()) {
      setError("Birth date and location are required for your natal chart.");
      return;
    }
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
        navigate(redirectTo, { replace: true });
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
      <div className="space-y-3">
        <p className="text-[13px] leading-relaxed" style={{ color: "#0B0B0C" }}>
          We sent a confirmation link to <strong>{email}</strong>. Open it to
          finish setting up your account.
        </p>
        {showSignInLink && (
          <p className="text-[12px]" style={{ color: "#0B0B0C" }}>
            Already confirmed?{" "}
            <Link to="/login" className="underline font-semibold">
              Sign in
            </Link>
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>NAME</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
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
          onChange={e => setEmail(e.target.value)}
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
          onChange={e => setPassword(e.target.value)}
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
          onChange={e => setBirthDate(e.target.value)}
          className={inputClass}
          required
        />
      </div>
      <div>
        <label className={labelClass}>BIRTH TIME (optional)</label>
        <input
          type="time"
          value={birthTime}
          onChange={e => setBirthTime(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>BIRTH LOCATION</label>
        <LocationAutocomplete
          value={birthLocation}
          onChange={setBirthLocation}
          inputClassName={inputClass}
          required
        />
      </div>
      {error && <p className="text-[12px] text-red-500 text-center">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className={primaryButtonClass}
        style={primaryButtonStyle}
      >
        {loading ? "Creating…" : "Create account"}
      </button>
      {showSignInLink && (
        <p className="serif-quiet text-center text-sm" style={{ color: "#0B0B0C" }}>
          Already have an account?{" "}
          <Link to="/login" className="underline font-semibold">
            Sign in
          </Link>
        </p>
      )}
    </form>
  );
}
