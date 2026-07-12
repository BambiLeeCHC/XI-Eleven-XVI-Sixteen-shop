/**
 * "Complete the Look" product pairings.
 *
 * Maps a product name prefix → array of recommended companion product name prefixes.
 * We match by prefix so "D-Slip Dress [Black]" matches the "D-Slip Dress" key.
 * At render time, we resolve these to actual product IDs from the catalog.
 *
 * Pairing logic:
 *   • Dresses pair with other dress colors + same-color accessories
 *   • Jerseys pair with matching-color shorts (same sport set)
 *   • Shorts pair with matching-color jerseys
 *   • Leggings pair with matching-color sports bras (same activewear set)
 *   • Sports bras pair with matching-color leggings
 */

/** Color-family groupings for cross-product matching */
const COLOR_FAMILIES: Record<string, string[]> = {
  dark:   ["Black", "Onyx", "Dark Cerulean"],
  light:  ["White", "Ivory", "Whisper", "Nude"],
  warm:   ["Pink", "Peach", "Pink Lace", "Red"],
  cool:   ["Ice", "Volt"],
  multi:  ["Dash"],
};

/** Get the color family for a product color */
function getColorFamily(color: string): string {
  for (const [family, colors] of Object.entries(COLOR_FAMILIES)) {
    if (colors.includes(color)) return family;
  }
  return "other";
}

/** Extract the color from a product name like "J-Glitch Jersey [Volt]" → "Volt" */
export function extractColor(name: string): string {
  const match = name.match(/\[(.+)\]/);
  return match ? match[1] : "";
}

/** Extract the product line from name like "J-Glitch Jersey [Volt]" → "J-Glitch Jersey" */
export function extractLine(name: string): string {
  return name.replace(/\s*\[.+\]/, "").trim();
}

/**
 * Hard-coded cross-category pairings (product line → recommended lines).
 * These pair complementary items across categories.
 */
const LINE_PAIRINGS: Record<string, string[]> = {
  // Jerseys ↔ Shorts (men's sport set)
  "J-Glitch Jersey":       ["S-Glitch 2.5\" Shorts", "S-Glitch 2.5\u201c Shorts"],
  "S-Glitch 2.5\" Shorts": ["J-Glitch Jersey"],
  "S-Glitch 2.5\u201c Shorts": ["J-Glitch Jersey"],

  // Leggings ↔ Sports Bras (women's activewear set)
  "L-Flow Leggings":       ["B-Lift Sports Bra"],
  "B-Lift Sports Bra":     ["L-Flow Leggings"],

  // Dresses stand alone — pair with other dress colors
  "D-Slip Dress":          [],
};

export interface PairingResult {
  /** "Complete the set" — matching color in complementary category */
  setMatches: string[];
  /** "You might also like" — same line, different colors in same family */
  colorAlternatives: string[];
}

/**
 * Given a product name and the full catalog, return recommended pairings.
 * Returns product names (not IDs) — caller resolves to products.
 */
export function getProductPairings(
  productName: string,
  allProductNames: string[]
): PairingResult {
  const color = extractColor(productName);
  const line = extractLine(productName);
  const family = getColorFamily(color);

  // 1. Set matches: same color (or same color family) in paired lines
  const pairedLines = LINE_PAIRINGS[line] || [];
  const setMatches: string[] = [];

  for (const pairedLine of pairedLines) {
    // First try exact color match
    const exactMatch = allProductNames.find(
      (n) => extractLine(n) === pairedLine && extractColor(n) === color
    );
    if (exactMatch) {
      setMatches.push(exactMatch);
    } else {
      // Fall back to same color family
      const familyMatch = allProductNames.find(
        (n) =>
          extractLine(n) === pairedLine &&
          getColorFamily(extractColor(n)) === family
      );
      if (familyMatch) setMatches.push(familyMatch);
    }
  }

  // 2. Color alternatives: same product line, different colors, prefer same family first
  const sameLine = allProductNames
    .filter((n) => extractLine(n) === line && n !== productName)
    .sort((a, b) => {
      const aFam = getColorFamily(extractColor(a)) === family ? 0 : 1;
      const bFam = getColorFamily(extractColor(b)) === family ? 0 : 1;
      return aFam - bFam;
    });

  return {
    setMatches,
    colorAlternatives: sameLine.slice(0, 3),
  };
}
