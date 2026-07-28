/**
 * THE XI·XVI ARCANA — 22 cards.
 *
 * A house deck, written in-house. Each card is a self-empowerment /
 * material-honesty prompt rather than a fortune. The data is deliberately
 * complete enough to be licensed and manufactured as a physical deck:
 * every card carries a number, roman numeral, glyph, colorway, element,
 * numerology reduction, keywords, upright + reversed readings, a one-line
 * ritual, and a fabric/care note that ties the card to the brand's
 * made-to-order model.
 *
 * © XI Eleven XVI Sixteen L.L.C. — deck concept and card texts.
 */

export interface ArcanaCard {
  number: number;
  roman: string;
  name: string;
  subtitle: string;
  glyph: string;
  element: "Air" | "Fire" | "Water" | "Earth" | "Aether";
  reduction: number; // numerology reduction of the card number
  keywords: string[];
  upright: string;
  reversed: string;
  ritual: string;
  material: string; // the licensable "fabric note" on the card back
  colorway: [string, string]; // gradient pair used on the card face
}

export const ARCANA: ArcanaCard[] = [
  {
    number: 0,
    roman: "0",
    name: "The Unmade",
    subtitle: "Nothing exists until it is wanted",
    glyph: "○",
    element: "Aether",
    reduction: 9,
    keywords: ["potential", "restraint", "beginning"],
    upright:
      "The most powerful version of a thing is the version not yet committed. You are standing in front of an open bolt of cloth. Choose deliberately; the first cut sets every seam after it.",
    reversed:
      "Endless potential has become an excuse. Nothing is being made because nothing is being risked. Cut.",
    ritual: "Name one thing you will start today and one you will refuse.",
    material: "Undyed raw weave — the state before intention.",
    colorway: ["#f5ede6", "#e8d5d0"],
  },
  {
    number: 1,
    roman: "I",
    name: "The Maker",
    subtitle: "Will, applied to matter",
    glyph: "✦",
    element: "Fire",
    reduction: 1,
    keywords: ["initiation", "agency", "craft"],
    upright:
      "You are not waiting for permission. Skill plus intent equals authorship. Whatever you touch today takes your shape.",
    reversed:
      "Force without craft. Slow down and learn the technique before you demand the result.",
    ritual: "Do the hardest ten minutes first.",
    material: "Pressed satin — a surface that holds the mark of the hand.",
    colorway: ["#c48dff", "#7a4bd0"],
  },
  {
    number: 2,
    roman: "II",
    name: "The Mirror",
    subtitle: "Knowing before proof",
    glyph: "◐",
    element: "Water",
    reduction: 2,
    keywords: ["intuition", "privacy", "listening"],
    upright:
      "The answer already arrived; you are stalling for evidence. Sit with the quieter voice — it has a better record than your spreadsheet.",
    reversed:
      "Too much noise in the room. Mute one input source and see what you actually think.",
    ritual: "Ten minutes with no screen. Write the first sentence that surfaces.",
    material: "Liquid jersey — takes the shape of the body, then releases it.",
    colorway: ["#b1e1ff", "#5c9bcd"],
  },
  {
    number: 3,
    roman: "III",
    name: "The Bloom",
    subtitle: "Abundance without excess",
    glyph: "✤",
    element: "Earth",
    reduction: 3,
    keywords: ["creativity", "generosity", "growth"],
    upright:
      "Something you planted is producing. Share the surplus while it is fresh; hoarded abundance rots into inventory.",
    reversed:
      "Growth for the sake of the graph. More is not the goal — good is.",
    ritual: "Give one thing away today: credit, time, or a real compliment.",
    material: "Botanical-dyed cotton — colour drawn from what already grew.",
    colorway: ["#ff9eb8", "#f5c97a"],
  },
  {
    number: 4,
    roman: "IV",
    name: "The Frame",
    subtitle: "Structure is freedom",
    glyph: "▣",
    element: "Earth",
    reduction: 4,
    keywords: ["discipline", "boundaries", "foundation"],
    upright:
      "The pattern comes before the garment. Build the frame and the creativity gets somewhere to live.",
    reversed:
      "The frame has become a cage. Keep the load-bearing rules, delete the rest.",
    ritual: "Write your three non-negotiables for this week. Only three.",
    material: "Structured twill — engineered to keep its line.",
    colorway: ["#998888", "#4a3f45"],
  },
  {
    number: 5,
    roman: "V",
    name: "The Lineage",
    subtitle: "What you inherit, what you edit",
    glyph: "⌘",
    element: "Air",
    reduction: 5,
    keywords: ["tradition", "teaching", "inheritance"],
    upright:
      "You are standing on someone's technique. Honour it by improving it, not by preserving it under glass.",
    reversed:
      "Inherited rules you never audited. Ask who the rule was protecting.",
    ritual: "Thank a teacher. Then break one of their rules on purpose.",
    material: "Hand-finished hem — the oldest step we still refuse to automate.",
    colorway: ["#f5c97a", "#a67c2e"],
  },
  {
    number: 6,
    roman: "VI",
    name: "The Choosing",
    subtitle: "Two roads, one you",
    glyph: "⧖",
    element: "Air",
    reduction: 6,
    keywords: ["alignment", "partnership", "decision"],
    upright:
      "This is not a coin flip. One option makes you larger and one makes you safer, and you already know which is which.",
    reversed:
      "You are choosing by avoidance. Name the fear out loud and the choice simplifies.",
    ritual: "Decide the thing you have been deferring. Today.",
    material: "Double-faced weave — two surfaces, one cloth.",
    colorway: ["#c48dff", "#ff9eb8"],
  },
  {
    number: 7,
    roman: "VII",
    name: "The Drive",
    subtitle: "Momentum, harnessed",
    glyph: "➤",
    element: "Fire",
    reduction: 7,
    keywords: ["momentum", "focus", "victory"],
    upright:
      "You have speed. The only question is steering. Point everything at one objective for the next seven days.",
    reversed:
      "Motion mistaken for progress. Stop, check the heading, restart.",
    ritual: "Cut one commitment to free the lane.",
    material: "Four-way stretch — engineered to move first, recover fast.",
    colorway: ["#67e8f9", "#0e7490"],
  },
  {
    number: 8,
    roman: "VIII",
    name: "The Reckoning",
    subtitle: "Cost, counted honestly",
    glyph: "⚖",
    element: "Earth",
    reduction: 8,
    keywords: ["accountability", "balance", "truth"],
    upright:
      "Add it up properly — hours, waste, favours, footprint. A number you refuse to look at will bill you twice.",
    reversed:
      "Self-punishment dressed as accounting. Accuracy, not shame.",
    ritual: "Total one real cost you have been rounding down.",
    material: "Full traceability label — origin, mill, maker.",
    colorway: ["#f5ede6", "#998888"],
  },
  {
    number: 9,
    roman: "IX",
    name: "The Seeker",
    subtitle: "Alone, on purpose",
    glyph: "✧",
    element: "Aether",
    reduction: 9,
    keywords: ["solitude", "study", "completion"],
    upright:
      "Withdraw to work. Nine closes the cycle: finish the thing nobody is watching you finish.",
    reversed:
      "Isolation, not solitude. Let one person in on the project.",
    ritual: "Complete one open loop and close it fully.",
    material: "Single-piece cut — one owner, one run of one.",
    colorway: ["#1e1624", "#c48dff"],
  },
  {
    number: 10,
    roman: "X",
    name: "The Cycle",
    subtitle: "What returns, returns changed",
    glyph: "◍",
    element: "Water",
    reduction: 1,
    keywords: ["seasons", "circularity", "return"],
    upright:
      "You have been here before at a different altitude. Reuse what worked; retire what only worked once.",
    reversed:
      "A loop, not a spiral. Change one variable or you will get the same year twice.",
    ritual: "Repair something instead of replacing it.",
    material: "Closed-loop fibre — recovered, respun, reworn.",
    colorway: ["#6ee7b7", "#0f766e"],
  },
  {
    number: 11,
    roman: "XI",
    name: "The Signal",
    subtitle: "Illumination arrives early",
    glyph: "‖",
    element: "Aether",
    reduction: 2,
    keywords: ["insight", "courage", "calling"],
    upright:
      "The house card. Eleven is knowing before the proof exists — and having the nerve to move on it. Say the unpopular true thing today.",
    reversed:
      "You received the signal and filed it. Insight with no action is just entertainment.",
    ritual: "Act on your first instinct within the hour.",
    material: "Signature twin-stripe — the eleven, woven in.",
    colorway: ["#ffffff", "#c48dff"],
  },
  {
    number: 12,
    roman: "XII",
    name: "The Suspension",
    subtitle: "Held, not stuck",
    glyph: "⌇",
    element: "Water",
    reduction: 3,
    keywords: ["patience", "reframe", "surrender"],
    upright:
      "Nothing is moving because something is being made. Made-to-order requires waiting; so does the version of you being cut right now.",
    reversed:
      "Waiting has become hiding. The pause is over — pick it back up.",
    ritual: "Let one thing take longer than you want, without checking on it.",
    material: "Drape-tested silhouette — hung 72 hours before approval.",
    colorway: ["#b1e1ff", "#1e1624"],
  },
  {
    number: 13,
    roman: "XIII",
    name: "The Unstitching",
    subtitle: "Endings as technique",
    glyph: "✂",
    element: "Water",
    reduction: 4,
    keywords: ["release", "ending", "renewal"],
    upright:
      "Take the seam out. Ending a thing cleanly is a skill, and it is the only way the fabric survives to be something else.",
    reversed:
      "Clinging to a version that no longer fits anyone, including you.",
    ritual: "End one obligation this week, kindly and completely.",
    material: "Deconstructable seams — designed to come apart for remaking.",
    colorway: ["#4a3f45", "#f5ede6"],
  },
  {
    number: 14,
    roman: "XIV",
    name: "The Measure",
    subtitle: "Enough, precisely",
    glyph: "⊢",
    element: "Fire",
    reduction: 5,
    keywords: ["moderation", "precision", "craft"],
    upright:
      "Excess is imprecision. Cut to the measurement, not to the fear of coming up short.",
    reversed:
      "Over-ordering, over-explaining, over-producing. Trim ten percent off everything.",
    ritual: "Buy nothing you cannot name a use for by tonight.",
    material: "Zero-waste marker layout — pattern nested to the millimetre.",
    colorway: ["#f5c97a", "#c48dff"],
  },
  {
    number: 15,
    roman: "XV",
    name: "The Bind",
    subtitle: "The comfortable trap",
    glyph: "⛓",
    element: "Earth",
    reduction: 6,
    keywords: ["habit", "compulsion", "release"],
    upright:
      "Something you call a preference is running you. Cheap dopamine, cheap clothing, cheap agreement — all the same mechanism.",
    reversed:
      "The chain is loosening. Name what you are walking away from so it stays named.",
    ritual: "Skip one automatic purchase or scroll today.",
    material: "Anti-fast-fashion clause — no piece produced on speculation.",
    colorway: ["#1e1624", "#ef4444"],
  },
  {
    number: 16,
    roman: "XVI",
    name: "The Tower",
    subtitle: "Collapse that clears the site",
    glyph: "⌁",
    element: "Fire",
    reduction: 7,
    keywords: ["rupture", "honesty", "rebuild"],
    upright:
      "The second house card. What just fell was hollow, and its falling is information. Sixteen reduces to seven: the seeker walks out of the rubble and starts looking.",
    reversed:
      "You are propping up a structure you know is empty. Let it go before it costs more.",
    ritual: "Admit one thing that is not working. Out loud, to someone.",
    material: "Reinforced stress points — built for the day it all pulls.",
    colorway: ["#ff9eb8", "#7a1030"],
  },
  {
    number: 17,
    roman: "XVII",
    name: "The Constellation",
    subtitle: "Hope with coordinates",
    glyph: "✵",
    element: "Air",
    reduction: 8,
    keywords: ["hope", "vision", "direction"],
    upright:
      "After the tower, the sky. Pick a fixed point far enough away to steer by for years, not weeks.",
    reversed:
      "Wishing without navigating. Convert the dream into the next three moves.",
    ritual: "Write the five-year sentence. One sentence.",
    material: "Sky-dyed gradient — no two panels identical.",
    colorway: ["#b1e1ff", "#c48dff"],
  },
  {
    number: 18,
    roman: "XVIII",
    name: "The Moon Weave",
    subtitle: "Working in low light",
    glyph: "☾",
    element: "Water",
    reduction: 9,
    keywords: ["uncertainty", "instinct", "dreams"],
    upright:
      "You cannot see the whole path and you do not need to. Move by feel; verify in the morning.",
    reversed:
      "Anxiety impersonating intuition. Get one hard fact before you decide.",
    ritual: "Record the thought that keeps you up. Judge it tomorrow.",
    material: "Low-light iridescent finish — reads differently after dark.",
    colorway: ["#0e0a0f", "#b1e1ff"],
  },
  {
    number: 19,
    roman: "XIX",
    name: "The Solar",
    subtitle: "Seen, and fine with it",
    glyph: "☀",
    element: "Fire",
    reduction: 1,
    keywords: ["visibility", "vitality", "confidence"],
    upright:
      "Stop editing yourself down to a comfortable size for other people. Full light. Full posture.",
    reversed:
      "Performing brightness while running on empty. Rest is also a power move.",
    ritual: "Wear the piece you have been 'saving.' Today counts.",
    material: "UV-stable pigment — colour that does not flinch.",
    colorway: ["#f5c97a", "#ff9eb8"],
  },
  {
    number: 20,
    roman: "XX",
    name: "The Reveal",
    subtitle: "The audit you asked for",
    glyph: "⧉",
    element: "Aether",
    reduction: 2,
    keywords: ["reckoning", "clarity", "call"],
    upright:
      "Everything is on the table and it is a relief. Answer the summons: the version of you that shows up now sets the next decade.",
    reversed:
      "Avoiding a truth that has already been read aloud.",
    ritual: "Open the message, the invoice, or the file you've been avoiding.",
    material: "Full-disclosure spec sheet — every input listed.",
    colorway: ["#ffffff", "#f5c97a"],
  },
  {
    number: 21,
    roman: "XXI",
    name: "The Whole Cloth",
    subtitle: "Completion, nothing left over",
    glyph: "◉",
    element: "Earth",
    reduction: 3,
    keywords: ["completion", "integration", "arrival"],
    upright:
      "The cycle closes at nine and the piece is finished. Take the full measure of it before you start the next one.",
    reversed:
      "Rushing past your own finish line. Mark it, then move.",
    ritual: "Celebrate something you completed and told no one about.",
    material: "Signed final piece — one owner, cycle closed.",
    colorway: ["#c48dff", "#6ee7b7"],
  },
];

export const ARCANA_COUNT = ARCANA.length;
