/**
 * Group-read helpers. Keep short. Long prose lives in groupSky + groupRead VOICE.
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

export function cardHope(card: SpreadCard) {
  const line =
    card.card.upright.trim().split(/(?<=\.)\s/)[0]?.trim() ||
    "Something workable is already on the table.";
  if (card.reversed) {
    return `${card.card.name} reversed still carries a charge — a redirection, not a shutdown. ${line}`;
  }
  return `${card.card.name}: ${line}`;
}

export const ELEMENT_LINE: Record<string, string> = {
  fire: "brings the start",
  earth: "brings the follow-through",
  air: "brings the clear language",
  water: "brings the read on the room",
};

export const MODE_LINE: Record<string, string> = {
  cardinal: "begins",
  fixed: "holds",
  mutable: "adjusts",
};
