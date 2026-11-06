/**
 * Reversible open access for True North.
 *
 * Flip this to false to restore subscription, quota, and paid-question gates.
 * The flag does not cancel, refund, delete, or rewrite subscription rows.
 */
export const TRUE_NORTH_FREE_ACCESS = true;

export type EntitlementVia =
  | "open_access"
  | "admin"
  | "subscription"
  | "free_quota"
  | "paywall";

export function longReadEntitled(input: {
  freeAccess?: boolean;
  isAdmin: boolean;
  subscriptionStatus: string | null;
  readingsThisWeek: number;
  freeLimit?: number;
}): { entitled: boolean; via: EntitlementVia; openAccess: boolean } {
  const openAccess = input.freeAccess ?? TRUE_NORTH_FREE_ACCESS;
  if (openAccess)
    return { entitled: true, via: "open_access", openAccess: true };
  if (input.isAdmin) return { entitled: true, via: "admin", openAccess: false };
  const status = input.subscriptionStatus;
  if (status === "active" || status === "trialing") {
    return { entitled: true, via: "subscription", openAccess: false };
  }
  const limit = input.freeLimit ?? 3;
  if (input.readingsThisWeek < limit) {
    return { entitled: true, via: "free_quota", openAccess: false };
  }
  return { entitled: false, via: "paywall", openAccess: false };
}

/** Paid checkout is skipped while open access is on. No charge is created. */
export function shouldStartPaidCheckout(freeAccess = TRUE_NORTH_FREE_ACCESS) {
  return !freeAccess;
}
