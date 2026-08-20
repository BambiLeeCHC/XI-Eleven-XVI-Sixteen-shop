export type SubscriptionTier = "long_read";

/**
 * Single subscription offer for The Long Read — $7/week after a 7-day free trial.
 * Numerology is sold separately as a one-time unlock (see NumbersPage), not bundled
 * into a higher weekly tier.
 */
export function SubscriptionTierPicker({
  subscribingTier,
  onStart,
}: {
  subscribingTier: SubscriptionTier | null;
  onStart: (tier: SubscriptionTier) => void;
  /** @deprecated Highlight no longer used — only one tier remains. */
  highlight?: SubscriptionTier;
}) {
  const ctaStyle: Record<string, string | number> = {
    width: "100%",
    padding: "0.9rem",
    borderRadius: "12px",
    textAlign: "center",
    background: "linear-gradient(160deg, #1d2f4f, #101c33)",
    color: "#f3e9d2",
    border: "1px solid rgba(214,178,96,.6)",
    fontSize: "0.75rem",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    fontWeight: 600,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
          padding: "1rem",
          borderRadius: "10px",
          border: "1px solid rgba(214,178,96,.6)",
        }}
      >
        <p className="text-sm font-semibold">The Long Read — $7/week</p>
        <p className="text-sm text-muted-foreground">
          Seven cards read directly against what's actually going on for you right now, plus a
          follow-up question ($2.99). Numerology is available separately as a one-time unlock.
        </p>
        <button
          onClick={() => onStart("long_read")}
          disabled={subscribingTier !== null}
          style={{ ...ctaStyle, opacity: subscribingTier !== null ? 0.6 : 1 }}
        >
          {subscribingTier === "long_read" ? "Starting…" : "Start free trial ✦"}
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground text-center">
        7-day free trial, then $7/week. Cancel anytime.
      </p>
    </div>
  );
}
