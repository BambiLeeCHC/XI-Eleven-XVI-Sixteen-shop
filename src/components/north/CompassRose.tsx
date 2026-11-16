/** Deck-faithful XI · XVI crest — matches the gold shield on every True North card. */
export function CompassRose({ size = 88 }: { size?: number }) {
  return (
    <svg
      className="tn-crest"
      width={size}
      height={size}
      viewBox="0 0 80 96"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="crest-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8D5A3" />
          <stop offset="45%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#A88B3A" />
        </linearGradient>
        <linearGradient id="crest-fill" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#0f1c32" />
          <stop offset="100%" stopColor="#0a1424" />
        </linearGradient>
      </defs>

      {/* Shield outline */}
      <path
        d="M40 4 L72 16 L72 48 C72 68 56 84 40 92 C24 84 8 68 8 48 L8 16 Z"
        fill="url(#crest-fill)"
        stroke="url(#crest-gold)"
        strokeWidth="2.4"
      />

      {/* Inner filigree ring */}
      <path
        d="M40 14 L64 22 L64 48 C64 64 50 76 40 82 C30 76 16 64 16 48 L16 22 Z"
        fill="none"
        stroke="url(#crest-gold)"
        strokeWidth="1"
        opacity="0.55"
      />

      {/* XI */}
      <text
        x="40"
        y="42"
        textAnchor="middle"
        fill="url(#crest-gold)"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="18"
        fontWeight="700"
        letterSpacing="0.04em"
      >
        XI
      </text>

      {/* Divider */}
      <line
        x1="26"
        y1="48"
        x2="54"
        y2="48"
        stroke="url(#crest-gold)"
        strokeWidth="1.2"
        opacity="0.85"
      />

      {/* XVI */}
      <text
        x="40"
        y="66"
        textAnchor="middle"
        fill="url(#crest-gold)"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="16"
        fontWeight="700"
        letterSpacing="0.06em"
      >
        XVI
      </text>
    </svg>
  );
}
