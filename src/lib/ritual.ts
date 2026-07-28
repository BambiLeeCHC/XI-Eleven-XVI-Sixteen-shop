/**
 * THE XI·XVI ALMANAC — deterministic daily ritual engine.
 *
 * Everything here is a pure function of a calendar date, so the Daily Code,
 * the Daily Draw and the Almanac agree across devices, sessions and time
 * zones without any backend state. Same date → same card, worldwide.
 */

import { ARCANA, type ArcanaCard } from "../data/arcana";
import { DAILY_CODES, type DailyCode } from "../data/dailyCodes";

/** Local calendar day key, e.g. "2026-07-28". */
export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Stable 32-bit hash of a string (FNV-1a). */
function hash(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Digit-sum reduction used across the brand (11 and 22 kept as masters). */
export function reduce(n: number): number {
  let v = Math.abs(Math.trunc(n));
  while (v > 22) {
    v = String(v)
      .split("")
      .reduce((a, c) => a + Number(c), 0);
  }
  if (v === 11 || v === 22) return v;
  while (v > 9) {
    v = String(v)
      .split("")
      .reduce((a, c) => a + Number(c), 0);
  }
  return v;
}

/** The governing number of a date: day + month + year, reduced. */
export function dateNumber(d: Date = new Date()): number {
  const digits = `${d.getDate()}${d.getMonth() + 1}${d.getFullYear()}`
    .split("")
    .reduce((a, c) => a + Number(c), 0);
  return reduce(digits);
}

export function codeOfTheDay(d: Date = new Date()): DailyCode {
  return DAILY_CODES[hash(`code:${dayKey(d)}`) % DAILY_CODES.length];
}

export interface DailyDraw {
  card: ArcanaCard;
  reversed: boolean;
}

export function drawOfTheDay(d: Date = new Date()): DailyDraw {
  const h = hash(`draw:${dayKey(d)}`);
  return {
    card: ARCANA[h % ARCANA.length],
    // ~30% reversed, stable per day
    reversed: (hash(`orientation:${dayKey(d)}`) % 100) < 30,
  };
}

/** A second, optional card for people who want a fuller reading. */
export function shadowOfTheDay(d: Date = new Date()): DailyDraw {
  const h = hash(`shadow:${dayKey(d)}`);
  const primary = drawOfTheDay(d).card.number;
  let idx = h % ARCANA.length;
  if (ARCANA[idx].number === primary) idx = (idx + 7) % ARCANA.length;
  return { card: ARCANA[idx], reversed: (hash(`shadow-o:${dayKey(d)}`) % 100) < 30 };
}

// ── 11:16 — the house hours ───────────────────────────────────────────────

export interface ElevenSixteen {
  /** ms until the next 11:16 (AM or PM, whichever is next) */
  msUntilNext: number;
  nextLabel: "11:16 AM" | "11:16 PM";
  /** true within ±1 minute of 11:16 */
  isNow: boolean;
}

export function nextElevenSixteen(now: Date = new Date()): ElevenSixteen {
  const candidates: Array<{ t: Date; label: "11:16 AM" | "11:16 PM" }> = [];
  for (const [h, label] of [
    [11, "11:16 AM"],
    [23, "11:16 PM"],
  ] as const) {
    const t = new Date(now);
    t.setHours(h, 16, 0, 0);
    candidates.push({ t, label });
    const tm = new Date(t);
    tm.setDate(tm.getDate() + 1);
    candidates.push({ t: tm, label });
  }
  candidates.sort((a, b) => a.t.getTime() - b.t.getTime());
  const next = candidates.find((c) => c.t.getTime() > now.getTime())!;
  const isNow =
    (now.getHours() === 11 || now.getHours() === 23) && now.getMinutes() === 16;
  return {
    msUntilNext: next.t.getTime() - now.getTime(),
    nextLabel: next.label,
    isNow,
  };
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── Moon phase (Conway-style approximation, ±1 day) ──────────────────────

const MOON_NAMES = [
  "New Moon",
  "Waxing Crescent",
  "First Quarter",
  "Waxing Gibbous",
  "Full Moon",
  "Waning Gibbous",
  "Last Quarter",
  "Waning Crescent",
] as const;

const MOON_GLYPHS = ["●", "◔", "◑", "◕", "○", "◒", "◐", "◓"] as const;

export interface MoonPhase {
  index: number; // 0..7
  name: (typeof MOON_NAMES)[number];
  glyph: string;
  illumination: number; // 0..1
}

export function moonPhase(d: Date = new Date()): MoonPhase {
  // Days since a known new moon: 2000-01-06 18:14 UTC
  const known = Date.UTC(2000, 0, 6, 18, 14) / 86400000;
  const days = d.getTime() / 86400000 - known;
  const synodic = 29.530588853;
  const age = ((days % synodic) + synodic) % synodic;
  const frac = age / synodic;
  const index = Math.round(frac * 8) % 8;
  const illumination = (1 - Math.cos(2 * Math.PI * frac)) / 2;
  return {
    index,
    name: MOON_NAMES[index],
    glyph: MOON_GLYPHS[index],
    illumination,
  };
}

/** Calendar grid (weeks x 7) for a month, Sunday-first. Nulls pad the edges. */
export function monthGrid(year: number, month: number): Array<Array<Date | null>> {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: Array<Array<Date | null>> = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Dates the brand marks: the 11th and 16th of every month. */
export function isMarkedDay(d: Date): "signal" | "tower" | null {
  if (d.getDate() === 11) return "signal";
  if (d.getDate() === 16) return "tower";
  return null;
}

// ── The three-card spread ─────────────────────────────────────────────────

export type SpreadSlot = "signal" | "work" | "tower";

export interface SpreadCard extends DailyDraw {
  slot: SpreadSlot;
  slotName: string;
  slotQuestion: string;
}

const SPREAD_SLOTS: Array<{ slot: SpreadSlot; slotName: string; slotQuestion: string }> = [
  { slot: "signal", slotName: "The Signal", slotQuestion: "What is true right now" },
  { slot: "work", slotName: "The Work", slotQuestion: "What to do with it today" },
  { slot: "tower", slotName: "The Tower", slotQuestion: "What it builds if you keep going" },
];

/**
 * A stable, anonymous id for this browser. The draw is personal: two people
 * opening the Journal on the same day get different spreads, and the same
 * person gets the same spread all day.
 */
export function drawerId(): string {
  const KEY = "xixvi-drawer";
  try {
    const existing = localStorage.getItem(KEY);
    if (existing) return existing;
    const fresh =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(KEY, fresh);
    return fresh;
  } catch {
    /* storage blocked — fall back to a per-session id */
    return "guest";
  }
}

/**
 * THE DRAW — three cards, one spread per person per day. Deterministic from
 * (drawer id + date), so it survives reloads and cannot be re-rolled, but it
 * is nobody else's spread. No duplicates within a spread.
 */
export function spreadOfTheDay(d: Date = new Date(), who: string = drawerId()): SpreadCard[] {
  const key = `${who}|${dayKey(d)}`;
  const used = new Set<number>();
  return SPREAD_SLOTS.map(({ slot, slotName, slotQuestion }) => {
    let idx = hash(`${slot}:${key}`) % ARCANA.length;
    let guard = 0;
    while (used.has(idx) && guard++ < ARCANA.length) idx = (idx + 5) % ARCANA.length;
    used.add(idx);
    return {
      slot,
      slotName,
      slotQuestion,
      card: ARCANA[idx],
      reversed: hash(`${slot}-o:${key}`) % 100 < 28,
    };
  });
}
