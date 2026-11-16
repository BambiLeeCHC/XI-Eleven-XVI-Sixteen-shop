/**
 * Group-read voice: sensible, clear, momentum-first.
 * Easy to understand. Built to move a life forward.
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
  const pair = `${hit.left}'s ${hit.leftSign} ${hit.leftBody} and ${hit.right}'s ${hit.rightSign} ${hit.rightBody}`;
  if (hit.aspect === "trine") {
    return `${pair} work well together. You already share a rhythm — use it. Agree on one decision today without another long discussion.`;
  }
  if (hit.aspect === "sextile") {
    return `${pair} open a useful door. Collaboration is available; someone still has to walk through it. Name the next concrete step and take it.`;
  }
  return `${pair} sit in the same seat. That focus helps if you say whose priority is leading. Align on one shared goal and protect it.`;
}

export function growthSentence(hit: LinkHit) {
  const pair = `${hit.left}'s ${hit.leftSign} ${hit.leftBody} and ${hit.right}'s ${hit.rightSign} ${hit.rightBody}`;
  if (hit.aspect === "opposition") {
    return `${pair} pull in different directions. Each of you holds something the other needs. Combine both views into one clearer plan instead of picking sides.`;
  }
  if (hit.aspect === "quincunx") {
    return `${pair} do not fit the usual way. Change the method, not the goal. A small process fix will move this faster than another debate about intent.`;
  }
  return `${pair} create friction that can become progress. Put the effort into one shared plan with a deadline. Effort without a target wastes time.`;
}

export function cardHope(card: SpreadCard) {
  const upright = card.card.upright.trim().split(/(?<=\.)\s/)[0] ?? card.card.upright;
  const hard = /tower|devil|death|swords|five of|ten of wands|nine of wands/i.test(card.card.name);
  const gift = hard
    ? `${card.card.name} points at a hard truth you can use. Keep what works, cut what does not, and move on the part you control.`
    : upright;
  if (!card.reversed) return gift;
  return `Reversed means the same lesson, sooner: act before it hardens. ${gift}`;
}

export function closingLine(transit: Factor | undefined) {
  if (!transit) {
    return "Conditions are clear enough to act. Use the strength you already have and make one decision today that moves the group forward.";
  }
  const match = transit.line.match(/Transiting ([A-Za-z]+) at [\d.]+° ([A-Za-z]+) (conjunction|sextile|square|trine|opposition|quincunx) the composite ([A-Za-z]+(?: Node)?)/);
  const planet = match?.[1] ?? "Jupiter";
  const sign = match?.[2] ?? "Leo";
  const aspect = match?.[3] ?? "trine";
  const target = match?.[4] ?? "Sun";
  const charge = aspect === "square" || aspect === "opposition" || aspect === "quincunx"
    ? "pressure you can aim into progress"
    : "an opening you can use";
  return `Transiting ${planet} in ${sign} meets the composite ${target}. That is ${charge}. Make one shared decision today — concrete, dated, and owned.`;
}

export function lensOf(hit: LinkHit | undefined, easy: boolean) {
  if (!hit) {
    return easy
      ? "The charts do not hand you an easy link here, so lean on the card: do what it names and build from that."
      : "You already have enough strength in the room. Use it. Looking for a new problem will not move you forward.";
  }
  return easy ? bondSentence(hit) : growthSentence(hit);
}

export const ELEMENT_LINE: Record<string, string> = {
  fire: "You start. Momentum comes from the first clear step, not from waiting for perfect timing.",
  earth: "You finish. Progress sticks because someone stays with the work until it is real.",
  air: "You clarify. The group moves when the idea is spoken plainly and shared.",
  water: "You notice what others skip. Care keeps the plan human enough to last.",
};

export const MODE_LINE: Record<string, string> = {
  cardinal: "Your tempo is to begin. Start before the room is fully ready.",
  fixed: "Your tempo is to hold. Protect the plan long enough for it to work.",
  mutable: "Your tempo is to adapt. Change the approach without losing the goal.",
};
