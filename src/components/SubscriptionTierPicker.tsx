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
    padding: "18px",
    textAlign: "center",
    background: "#D8F0C4",
    color: "#142010",
    border: 0,
    boxShadow: "6px 6px 0 #E4D4F4",
    fontSize: "13px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    fontWeight: 800,
    cursor: "pointer",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <button
        onClick={() => onStart("long_read")}
        disabled={subscribingTier !== null}
        style={{ ...ctaStyle, opacity: subscribingTier !== null ? 0.6 : 1 }}
      >
        {subscribingTier === "long_read" ? "Starting…" : "Get the Long Read — $7/week"}
      </button>
      <p className="text-[11px] text-muted-foreground text-center">
        Seven days free. Then $7/week. Cancel anytime.
      </p>
    </div>
  );
}
