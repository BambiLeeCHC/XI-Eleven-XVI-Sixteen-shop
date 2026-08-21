export interface LandingCategoryHighlight {
  name: string;
  baseName: string;
  gender: "women" | "men";
  /** Optional override image path under /mockups or product URL */
  image?: string;
}

export interface LandingContent {
  hero: {
    womenLabel: string;
    womenLink: string;
    menLabel: string;
    menLink: string;
    womenImage?: string;
    menImage?: string;
    eyebrow?: string;
    headline?: string;
    subhead?: string;
  };
  categories: {
    visible: boolean;
    eyebrow: string;
    highlights: LandingCategoryHighlight[];
  };
  bra: { visible: boolean; eyebrow: string; title: string; accent: string; description: string };
  shorts: { visible: boolean; eyebrow: string; title: string; accent: string; description: string };
  howItWorks: { visible: boolean; eyebrow: string; title: string; accent: string; description: string };
  newsletter: {
    visible: boolean;
    eyebrow: string;
    title: string;
    accent: string;
    description: string;
    button: string;
    success: string;
  };
  trust: { visible: boolean };
}

export const DEFAULT_CATEGORY_HIGHLIGHTS: LandingCategoryHighlight[] = [
  { name: "Dresses", baseName: "D-Slip", gender: "women" },
  { name: "Sports Bras", baseName: "B-Lift", gender: "women" },
  { name: "Leggings", baseName: "L-Flow", gender: "women" },
  { name: "Jerseys", baseName: "J-Glitch", gender: "men" },
  { name: '2.5" Shorts', baseName: "S-Glitch 2.5", gender: "men" },
  { name: '6.3" Shorts', baseName: "S-Glitch 6.3", gender: "men" },
  { name: "Oversized Tees", baseName: "T-Icon Oversized", gender: "men" },
  { name: "Tie-Dye Tees", baseName: "T-Icon Tie-Dye", gender: "men" },
];

export const DEFAULT_LANDING_CONTENT: LandingContent = {
  hero: {
    womenLabel: "SHOP WOMEN",
    womenLink: "/shop?gender=women",
    menLabel: "SHOP MEN",
    menLink: "/shop?gender=men",
    womenImage: "/mockups/B-Lift_Sports_Bra_Dash_Black_front.png",
    menImage: "/mockups/J-Glitch_Jersey_Black_0.png",
    eyebrow: "XI · XVI SHOWROOM",
    headline: "Precision Fit. Made to Order.",
    subhead: "Engineered pieces for movement — less waste, more intention.",
  },
  categories: {
    visible: true,
    eyebrow: "Shop by Category",
    highlights: DEFAULT_CATEGORY_HIGHLIGHTS,
  },
  bra: {
    visible: true,
    eyebrow: "Engineered for Movement",
    title: "B-Lift",
    accent: "Sports Bra",
    description: "Removable cups. Moisture-wicking fabric. Your fit, your way.",
  },
  shorts: {
    visible: true,
    eyebrow: "Built Different",
    title: "S-Glitch",
    accent: "Shorts",
    description: "Statement performance shorts engineered for movement.",
  },
  howItWorks: {
    visible: true,
    eyebrow: "Made for You",
    title: "Your Piece,",
    accent: "Your Way",
    description: "Every XI · XVI piece is created on demand — less waste, more intention.",
  },
  newsletter: {
    visible: true,
    eyebrow: "Join the Movement",
    title: "Stay in the",
    accent: "Loop",
    description:
      "Early access to new drops, exclusive offers, and behind-the-scenes looks at what's coming next.",
    button: "Join",
    success: "✦ Welcome to the family. Stay tuned.",
  },
  trust: { visible: true },
};

export function mergeLandingContent(value: any): LandingContent {
  const d = DEFAULT_LANDING_CONTENT;
  return {
    hero: { ...d.hero, ...value?.hero },
    categories: {
      ...d.categories,
      ...value?.categories,
      highlights:
        Array.isArray(value?.categories?.highlights) && value.categories.highlights.length
          ? value.categories.highlights
          : d.categories.highlights,
    },
    bra: { ...d.bra, ...value?.bra },
    shorts: { ...d.shorts, ...value?.shorts },
    howItWorks: { ...d.howItWorks, ...value?.howItWorks },
    newsletter: { ...d.newsletter, ...value?.newsletter },
    trust: { ...d.trust, ...value?.trust },
  };
}
