export interface LandingContent {
  hero: { womenLabel: string; womenLink: string; menLabel: string; menLink: string };
  categories: { visible: boolean; eyebrow: string };
  bra: { visible: boolean; eyebrow: string; title: string; accent: string; description: string };
  shorts: { visible: boolean; eyebrow: string; title: string; accent: string; description: string };
  howItWorks: { visible: boolean; eyebrow: string; title: string; accent: string; description: string };
  newsletter: { visible: boolean; eyebrow: string; title: string; accent: string; description: string; button: string; success: string };
  trust: { visible: boolean };
}

export const DEFAULT_LANDING_CONTENT: LandingContent = {
  hero: { womenLabel: "SHOP WOMEN", womenLink: "/shop?gender=women", menLabel: "SHOP MEN", menLink: "/shop?gender=men" },
  categories: { visible: true, eyebrow: "Shop by Category" },
  bra: { visible: true, eyebrow: "Engineered for Movement", title: "B-Lift", accent: "Sports Bra", description: "Removable cups. Moisture-wicking fabric. Your fit, your way." },
  shorts: { visible: true, eyebrow: "Built Different", title: "S-Glitch", accent: "Shorts", description: "Statement performance shorts engineered for movement." },
  howItWorks: { visible: true, eyebrow: "Made for You", title: "Your Piece,", accent: "Your Way", description: "Every XI · XVI piece is created on demand — less waste, more intention." },
  newsletter: { visible: true, eyebrow: "Join the Movement", title: "Stay in the", accent: "Loop", description: "Early access to new drops, exclusive offers, and behind-the-scenes looks at what's coming next.", button: "Join", success: "✦ Welcome to the family. Stay tuned." },
  trust: { visible: true },
};

export function mergeLandingContent(value: any): LandingContent {
  const d = DEFAULT_LANDING_CONTENT;
  return {
    hero: { ...d.hero, ...value?.hero },
    categories: { ...d.categories, ...value?.categories },
    bra: { ...d.bra, ...value?.bra },
    shorts: { ...d.shorts, ...value?.shorts },
    howItWorks: { ...d.howItWorks, ...value?.howItWorks },
    newsletter: { ...d.newsletter, ...value?.newsletter },
    trust: { ...d.trust, ...value?.trust },
  };
}
