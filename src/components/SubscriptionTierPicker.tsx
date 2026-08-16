export type SubscriptionTier = "long_read" | "long_read_plus_numerology";

/**
 * The one place both tier options are explained and offered — used on the
 * Long Read paywall (DeepReadingPage) and the Chart page's Numerology tab,
 * so a reader always sees the exact same two clearly-labeled choices
 * instead of a single ambiguous "Start free trial" button. Numerology is
 * never sold standalone — it's always bundled with the Long Read at the
 * $12/week tier — so both cards are always shown together, whichever page
 * you land on this from.
 */
export function SubscriptionTierPicker({
  subscribingTier,
  onStart,
  highlight,
}: {
  subscribingTier: SubscriptionTier | null;
  onStart: (tier: SubscriptionTier) => void;
  /** Which card gets the gold border / "recommended" framing for this entry point. */
  highlight?: SubscriptionTier;
}) {
  const ctaStyle: Record<string, string | number> = {
    width: "100%", padding: "0.9rem", borderRadius: "12px", textAlign: "center",
    background: "linear-gradient(160deg, #1d2f4f, #101c33)", color: "#f3e9d2",
    border: "1px solid rgba(214,178,96,.6)", fontSize: "0.75rem", letterSpacing: "0.15em",
    textTransform: "uppercase", fontWeight: 600,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div
        style={{
          display: "flex", flexDirection: "column", gap: "0.6rem", padding: "1rem", borderRadius: "10px",
          border: highlight === "long_read" ? "1px solid rgba(214,178,96,.6)" : "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <p className="text-sm font-semibold">The Long Read — $7/week</p>
        <p className="text-sm text-muted-foreground">
          Seven cards read directly against what's actually going on for you right now, plus a
          follow-up question ($2.99). Numerology not included.
        </p>
        <button
          onClick={() => onStart("long_read")}
          disabled={subscribingTier !== null}
          style={{ ...ctaStyle, opacity: subscribingTier !== null ? 0.6 : 1 }}
        >
          {subscribingTier === "long_read" ? "Starting…" : "Start free trial ✦"}
        </button>
      </div>

      <div
        style={{
          display: "flex", flexDirection: "column", gap: "0.6rem", padding: "1rem", borderRadius: "10px",
          border: highlight !== "long_read" ? "1px solid rgba(214,178,96,.6)" : "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <p className="text-sm font-semibold">The Long Read + Numerology — $12/week</p>
        <p className="text-sm text-muted-foreground">
          Everything in The Long Read, <span className="font-semibold">plus</span> your full
          numerology profile — Life Path, Expression, Soul Urge, Personality and this year's
          Personal Year number. This is the only way to unlock Numerology — it isn't sold on its own.
        </p>
        <button
          onClick={() => onStart("long_read_plus_numerology")}
          disabled={subscribingTier !== null}
          style={{ ...ctaStyle, opacity: subscribingTier !== null ? 0.6 : 1 }}
        >
          {subscribingTier === "long_read_plus_numerology" ? "Starting…" : "Start free trial ✦"}
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground text-center">
        Both tiers start with a 7-day free trial, cancel anytime.
      </p>
    </div>
  );
}
