const FRAME_COUNT = 8;

function dSlipFrames(color: string): string[] {
  return Array.from(
    { length: FRAME_COUNT },
    (_, index) =>
      `/rotations/d-slip/${color}/frame-${String(index + 1).padStart(2, "0")}.webp`,
  );
}

const PRODUCT_ROTATIONS: Record<string, string[]> = {
  "D-SLIP DRESS [BLACK]": dSlipFrames("black"),
  "D-SLIP DRESS [NUDE]": dSlipFrames("nude"),
  "D-SLIP DRESS [RED]": dSlipFrames("red"),
  "D-SLIP DRESS [WHISPER]": dSlipFrames("whisper"),
  "D-SLIP DRESS [PINK LACE]": dSlipFrames("pink-lace"),
  "D-SLIP DRESS [DARK CERULEAN]": dSlipFrames("dark-cerulean"),
};

/**
 * Returns an approved, ordered product rotation without altering the product's
 * ordinary face-out gallery. Database-provided rotations can still override
 * this catalog mapping when supplied.
 */
export function getProductRotation(productName: string): string[] | undefined {
  return PRODUCT_ROTATIONS[productName.trim().toUpperCase()];
}
