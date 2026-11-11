/**
 * True North is closed to the public until VITE_TRUE_NORTH_ENABLED is on.
 * An admin profile, or an email / user id on the allowlist, still gets in.
 */

export function trueNorthFlagOn(raw: string | undefined | null): boolean {
  const value = (raw ?? "").trim().toLowerCase();
  return value === "1" || value === "true" || value === "on" || value === "yes";
}

export function parseTrueNorthAllowlist(raw: string | undefined | null): string[] {
  return (raw ?? "")
    .split(",")
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);
}

export function canSeeTrueNorth(input: {
  enabled: boolean;
  role?: string | null;
  email?: string | null;
  userId?: string | null;
  allowlist: string[];
}): boolean {
  if (input.enabled) return true;
  if ((input.role ?? "").toLowerCase() === "admin") return true;
  const email = (input.email ?? "").trim().toLowerCase();
  const userId = (input.userId ?? "").trim().toLowerCase();
  if (email && input.allowlist.includes(email)) return true;
  if (userId && input.allowlist.includes(userId)) return true;
  return false;
}
