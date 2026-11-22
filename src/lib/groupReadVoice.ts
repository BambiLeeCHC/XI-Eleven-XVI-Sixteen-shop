/**
 * Group-read voice: plain English, short sentences, clear next steps.
 * No poetry. No vague mysticism. Tell people what to do.
 */

import type { SpreadCard } from "./ritual.js";

export type LinkHit = {
  score: number;
  harsh: boolean;
  aspect: string;
  orb: number;
  left: string;
  leftBody: string;
  leftSign: string;
  right: string;
  rightBody: string;
  rightSign: string;
};

export type Factor = {
  score: number;
  bucket: string;
  line: string;
};

export function bondSentence(hit: LinkHit) {
  const pair = `${hit.left} (${hit.leftSign} ${hit.leftBody}) and ${hit.right} (${hit.rightSign} ${hit.rightBody})`;
  if (hit.aspect === "trine") {
    return `${pair} already work well together. Skip the long talk. Pick one decision and lock it in today.`;
  }
  if (hit.aspect === "sextile") {
    return `${pair} can team up easily. Someone still has to start. Name the next step and do it.`;
  }
  return `${pair} are pointed at the same thing. Decide whose call leads this week and follow that.`;
}

export function growthSentence(hit: LinkHit) {
  const pair = `${hit.left} (${hit.leftSign} ${hit.leftBody}) and ${hit.right} (${hit.rightSign} ${hit.rightBody})`;
  if (hit.aspect === "opposition") {
    return `${pair} see this from opposite sides. That is useful if both views go into one plan. Write the plan. Stop arguing about who is right.`;
  }
  if (hit.aspect === "quincunx") {
    return `${pair} need a different method, not a different goal. Change how you work, not what you are aiming at.`;
  }
  return `${pair} create heat. Aim that heat at one shared deadline. Heat without a target wastes time.`;
}

export function cardHope(card: SpreadCard) {
  const upright =
    card.card.upright.trim().split(/(?<=\.)\s/)[0]?.trim() ||
    "Act on what is already clear.";
  const hard = /tower|devil|death|swords|five of|ten of wands|nine of wands/i.test(
    card.card.name,
  );
  const gift = hard
    ? `${card.card.name}: keep what works, drop what does not, and move on the part you control.`
    : upright;
  if (!card.reversed) return gift;
  return `${card.card.name} reversed: same lesson, sooner. Do not wait. ${gift}`;
}

export function closingLine(transit: Factor | undefined) {
  if (!transit) {
    return "You have enough to act. Make one shared decision today with a name and a date on it.";
  }
  const match = transit.line.match(
    /Transiting ([A-Za-z]+) at [\d.]+° ([A-Za-z]+) (conjunction|sextile|square|trine|opposition|quincunx) the composite ([A-Za-z]+(?: Node)?)/,
  );
  const planet = match?.[1] ?? "Jupiter";
  const sign = match?.[2] ?? "Leo";
  const aspect = match?.[3] ?? "trine";
  const target = match?.[4] ?? "Sun";
  const charge =
    aspect === "square" || aspect === "opposition" || aspect === "quincunx"
      ? "pressure you can use"
      : "an opening you can use";
  return `Transit ${planet} in ${sign} to the group ${target}: ${charge}. One shared decision today — who owns it, and by when.`;
}

export function lensOf(hit: LinkHit | undefined, easy: boolean) {
  if (!hit) {
    return easy
      ? "No easy chart link here. Follow the card and build from that."
      : "Stop hunting for a new problem. Use the strength already in the room.";
  }
  return easy ? bondSentence(hit) : growthSentence(hit);
}

export const ELEMENT_LINE: Record<string, string> = {
  fire: "Starts things. Give them the first move.",
  earth: "Finishes things. Give them the follow-through.",
  air: "Makes it clear. Have them say the plan out loud.",
  water: "Tracks the people side. Listen when they flag what others miss.",
};

export const MODE_LINE: Record<string, string> = {
  cardinal: "Best used to begin.",
  fixed: "Best used to hold the line.",
  mutable: "Best used to adjust without dropping the goal.",
};
