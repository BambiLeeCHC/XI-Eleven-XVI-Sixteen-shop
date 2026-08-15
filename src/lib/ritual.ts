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
    reversed: hash(`orientation:${dayKey(d)}`) % 100 < 30,
  };
}

/** A second, optional card for people who want a fuller reading. */
export function shadowOfTheDay(d: Date = new Date()): DailyDraw {
  const h = hash(`shadow:${dayKey(d)}`);
  const primary = drawOfTheDay(d).card.number;
  let idx = h % ARCANA.length;
  if (ARCANA[idx].number === primary) idx = (idx + 7) % ARCANA.length;
  return {
    card: ARCANA[idx],
    reversed: hash(`shadow-o:${dayKey(d)}`) % 100 < 30,
  };
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
  const next = candidates.find(c => c.t.getTime() > now.getTime())!;
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
export function monthGrid(
  year: number,
  month: number,
): Array<Array<Date | null>> {
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
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Dates the brand marks: the 11th and 16th of every month. */
export function isMarkedDay(d: Date): "signal" | "tower" | null {
  if (d.getDate() === 11) return "signal";
  if (d.getDate() === 16) return "tower";
  return null;
}

// ── The spread — one true five-card layout ─────────────────────────────
//
// A single fixed spread, not a rotating cast of frameworks: five
// positions, each with its own real meaning, so the same card reads
// differently depending which position it lands in. This is what makes
// it a spread instead of five single-card pulls.

export type SpreadSlot = string;

export interface SpreadCard extends DailyDraw {
  slot: SpreadSlot;
  slotName: string;
  slotQuestion: string;
}

export interface SpreadType {
  id: string;
  name: string;
  /** One line describing the lens this spread reads the day through. */
  intro: string;
  slots: Array<{ slot: SpreadSlot; slotName: string; slotQuestion: string }>;
}

export const THE_SPREAD: SpreadType = {
  id: "action-support-gain-letgo-guidance",
  name: "Embracing Change",
  intro: "Five positions, one reading: the action that eases this transition, what's supporting you, what you stand to gain, what you need to let go of, and the higher guidance available to you.",
  slots: [
    {
      slot: "action",
      slotName: "Action",
      slotQuestion: "The action to ease this transition",
    },
    {
      slot: "support",
      slotName: "Support",
      slotQuestion: "What's supporting you through this",
    },
    {
      slot: "gain",
      slotName: "Gain",
      slotQuestion: "What you stand to gain",
    },
    {
      slot: "letgo",
      slotName: "Let Go",
      slotQuestion: "What you need to release",
    },
    {
      slot: "guidance",
      slotName: "Higher Guidance",
      slotQuestion: "The higher guidance available to you",
    },
  ],
};

/** The spread is fixed — one framework, always. Kept as a function for
 * call-site compatibility with the old rotating-framework API. */
export function spreadTypeOfTheDay(_d: Date = new Date()): SpreadType {
  return THE_SPREAD;
}

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
 * THE DRAW — five cards, one spread per person per day. Deterministic from
 * (drawer id + date), so it survives reloads and cannot be re-rolled, but it
 * is nobody else's spread. No duplicates within a spread.
 */
export function spreadOfTheDay(
  d: Date = new Date(),
  who: string = drawerId(),
): SpreadCard[] {
  const key = `${who}|${dayKey(d)}`;
  const slots = spreadTypeOfTheDay(d).slots;
  const used = new Set<number>();
  return slots.map(({ slot, slotName, slotQuestion }) => {
    let idx = hash(`${slot}:${key}`) % ARCANA.length;
    let guard = 0;
    while (used.has(idx) && guard++ < ARCANA.length)
      idx = (idx + 5) % ARCANA.length;
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

/**
 * THE UNDERCURRENT — a fourth, optional card revealed only after all spread
 * cards are turned. It answers a question the framework didn't ask: what's
 * moving underneath the visible reading. Reuses `shadowOfTheDay` so it never
 * duplicates a card already in the spread.
 */
export function undercurrentOfTheDay(
  d: Date = new Date(),
  who: string = drawerId(),
): DailyDraw {
  const key = `${who}|${dayKey(d)}`;
  const spreadIds = new Set(spreadOfTheDay(d, who).map(s => s.card.number));
  let idx = hash(`undercurrent:${key}`) % ARCANA.length;
  let guard = 0;
  while (spreadIds.has(ARCANA[idx].number) && guard++ < ARCANA.length) {
    idx = (idx + 3) % ARCANA.length;
  }
  return {
    card: ARCANA[idx],
    reversed: hash(`undercurrent-o:${key}`) % 100 < 28,
  };
}

// ── Synthesis — a bespoke narrative that reads the cards together ─────────

const ELEMENT_VOICE: Record<ArcanaCard["element"], string[]> = {
  Fire: [
    "Fire is doing the talking today — this is a push day, not a planning day.",
    "Everything here wants speed. Momentum is the resource on offer; don't let it idle.",
    "The energy on the table is combustible in a good way — point it before it points itself.",
  ],
  Water: [
    "Water runs through this reading — trust what you feel before you can fully explain it.",
    "This is a listening day. The instinct arrived first; the reasoning can catch up later.",
    "Something here moves by feel, not by force. Don't override it with logic too early.",
  ],
  Earth: [
    "Earth grounds this spread — the work today is structural: build, measure, finish.",
    "This is a hands-on-the-material day. Precision beats inspiration here.",
    "The cards are asking for something durable, not something exciting.",
  ],
  Air: [
    "Air moves through this one — today is about the sentence you say out loud, not the one in your head.",
    "This reading wants clarity in words: name it plainly and the rest sorts itself.",
    "Ideas outrun action today. Pick one and give it a body before it evaporates.",
  ],
  Aether: [
    "Aether threads this spread — something bigger than the to-do list is asking for attention.",
    "This is a house-card kind of day: the timing itself is the message.",
    "There's a signal underneath the practical stuff today. Don't talk yourself out of it.",
  ],
};

const REDUCTION_VOICE: Record<number, string> = {
  1: "a start — treat today like day one of something, even if it isn't.",
  2: "a pairing — whatever you're weighing, the answer involves another person.",
  3: "an overflow — something is ready to be shared, not stored.",
  4: "a frame — the structure matters more than the motivation today.",
  5: "an inheritance — old rules are up for renegotiation.",
  6: "a fork — stop treating the choice as if it weren't a choice.",
  7: "a lane — momentum is available if you stop splitting it.",
  8: "an accounting — something needs to be counted honestly.",
  9: "a close — finish the open loop before starting a new one.",
  11: "a house number — the signal is early and it's yours to act on.",
  22: "a build number — what you make today is built to last past today.",
};

function pick<T>(items: T[], seed: string): T {
  return items[hash(seed) % items.length];
}

/**
 * One synthesized paragraph reading the whole spread together — the
 * elemental mood, the numerology of the day, and the moon — rather than
 * repeating any single card's canned text. Deterministic per drawer + day,
 * so it's a genuinely different composition from yesterday's even when the
 * deck (only 22 cards) happens to repeat one.
 */
export function synthesisOfTheDay(
  d: Date = new Date(),
  who: string = drawerId(),
): { headline: string; body: string } {
  const key = `${who}|${dayKey(d)}`;
  const spread = spreadOfTheDay(d, who);
  const type = spreadTypeOfTheDay(d);

  const elementCounts = new Map<string, number>();
  for (const s of spread)
    elementCounts.set(
      s.card.element,
      (elementCounts.get(s.card.element) ?? 0) + 1,
    );
  const dominant = [...elementCounts.entries()].sort(
    (a, b) => b[1] - a[1],
  )[0][0] as ArcanaCard["element"];
  const mixed = elementCounts.size === spread.length;

  const reversedCount = spread.filter(s => s.reversed).length;
  const num = dateNumber(d);
  const moon = moonPhase(d);

  const elementLine = pick(ELEMENT_VOICE[dominant], `elem:${key}`);
  const reductionLine =
    REDUCTION_VOICE[num] ??
    "a day that resists a single number — read the cards, not the math.";

  const reversalLine =
    reversedCount === 0
      ? "Every card fell upright — nothing here is asking to be untangled first, only acted on."
      : reversedCount === spread.length
        ? "Every card fell reversed — today is more about clearing a blockage than adding something new."
        : `${reversedCount} of ${spread.length} fell reversed — part of this is ready to move, part of it is still working something out.`;

  const moonLine =
    moon.illumination > 0.85
      ? `A ${moon.name.toLowerCase()} is overhead — visibility is high; whatever you do today gets seen.`
      : moon.illumination < 0.15
        ? `A ${moon.name.toLowerCase()} is overhead — good conditions for starting something nobody's watching yet.`
        : `The moon is ${moon.name.toLowerCase()} — energy is transitional, not settled either way.`;

  const cohesionLine = mixed
    ? "The elements in this spread don't agree with each other, which is itself the reading: you're being pulled between registers today, not just directions."
    : "More than one card is speaking the same element — that's a chorus, not a coincidence. Whatever it's saying, it's saying it twice for a reason.";

  return {
    headline: `${type.name} · Day number ${num}`,
    body: [
      elementLine,
      cohesionLine,
      reversalLine,
      moonLine,
      `Numerologically, today is ${reductionLine}`,
    ].join(" "),
  };
}
