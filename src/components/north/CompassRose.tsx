/**
 * XI · XVI crest — matched to the shield on every True North print card.
 * Compact gold shield, dark fill, XI over XVI, thin divider.
 */
export function CompassRose({ size = 72 }: { size?: number }) {
  const h = Math.round(size * 1.15);
  return (
    <svg
      className="tn-crest"
      width={size}
      height={h}
      viewBox="0 0 64 74"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="tn-crest-gold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F0E0B0" />
          <stop offset="35%" stopColor="#D4AF55" />
          <stop offset="70%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#9A7A30" />
        </linearGradient>
        <linearGradient id="tn-crest-fill" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#121c30" />
          <stop offset="100%" stopColor="#0a1424" />
        </linearGradient>
      </defs>

      {/* Outer shield — proportions match the print crest */}
      <path
        d="M32 2.5
           C44 2.5 56 6 58 10
           L58 38
           C58 52 46 64 32 70.5
           C18 64 6 52 6 38
           L6 10
           C8 6 20 2.5 32 2.5Z"
        fill="url(#tn-crest-fill)"
        stroke="url(#tn-crest-gold)"
        strokeWidth="2"
      />

      {/* Inner edge */}
      <path
        d="M32 7
           C42 7 52 10 53.5 13
           L53.5 38
           C53.5 50 43 60 32 65.5
           C21 60 10.5 50 10.5 38
           L10.5 13
           C12 10 22 7 32 7Z"
        fill="none"
        stroke="url(#tn-crest-gold)"
        strokeWidth="0.7"
        opacity="0.5"
      />

      {/* XI */}
      <text
        x="32"
        y="32"
        textAnchor="middle"
        fill="url(#tn-crest-gold)"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="15"
        fontWeight="700"
        letterSpacing="0.08em"
      >
        XI
      </text>

      {/* Divider */}
      <line
        x1="18"
        y1="37"
        x2="46"
        y2="37"
        stroke="url(#tn-crest-gold)"
        strokeWidth="1"
        opacity="0.9"
      />

      {/* XVI */}
      <text
        x="32"
        y="54"
        textAnchor="middle"
        fill="url(#tn-crest-gold)"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="13"
        fontWeight="700"
        letterSpacing="0.1em"
      >
        XVI
      </text>
    </svg>
  );
}
