/**
 * Daily Three — True North cadence (Morning / Midday / Evening).
 *
 * Three readings per calendar day. Each is a distinct three-card spread.
 * Deterministic from (drawer id + date + window). Windows open by local
 * clock; once open, a reading remains available until midnight.
 */

import { ARCANA } from "../data/arcana";
import {
  dayKey,
  drawerId,
  type SpreadCard,
  type SpreadType,
} from "./ritual";

/** Stable 32-bit hash of a string (FNV-1a) — matches ritual.ts. */
function hash(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export type DailyWindowId = "morning" | "midday" | "evening";

export interface DailyWindow {
  id: DailyWindowId;
  name: string;
  label: string;
  intro: string;
  /** Local-hour range [startInclusive, endExclusive). */
  hours: [number, number];
  spread: SpreadType;
}

export const DAILY_THREE: Record<DailyWindowId, DailyWindow> = {
  morning: {
    id: "morning",
    name: "Orientation",
    label: "Morning",
    intro:
      "Three cards that set the day's direction: the energy in play, the stance that supports you, and one practical point of focus before the day accelerates.",
    hours: [0, 12],
    spread: {
      id: "daily-morning-orientation",
      name: "Orientation",
      intro:
        "Tone · Approach · Focus — orient toward True North before the noise starts.",
      slots: [
        {
          slot: "tone",
          slotName: "Tone",
          slotQuestion: "The primary energy governing this day",
        },
        {
          slot: "approach",
          slotName: "Approach",
          slotQuestion: "The most supportive stance available to you",
        },
        {
          slot: "focus",
          slotName: "Focus",
          slotQuestion: "One practical point of attention for the day ahead",
        },
      ],
    },
  },
  midday: {
    id: "midday",
    name: "Alignment",
    label: "Midday",
    intro:
      "A mid-course check: where you may be drifting from center, what is asking for attention or release, and how to realign with your deeper values.",
    hours: [12, 17],
    spread: {
      id: "daily-midday-alignment",
      name: "Alignment",
      intro: "Drift · Attention · Realign — a correction, not a restart.",
      slots: [
        {
          slot: "drift",
          slotName: "Drift",
          slotQuestion: "Where you may be leaving your center",
        },
        {
          slot: "attention",
          slotName: "Attention",
          slotQuestion: "What is asking to be seen or released",
        },
        {
          slot: "realign",
          slotName: "Realign",
          slotQuestion: "How to return toward True North from here",
        },
      ],
    },
  },
  evening: {
    id: "evening",
    name: "Integration",
    label: "Evening",
    intro:
      "Close the arc: the day's lesson, what moved or resisted, and what to carry into rest so the insight becomes embodied rather than fleeting.",
    hours: [17, 24],
    spread: {
      id: "daily-evening-integration",
      name: "Integration",
      intro: "Lesson · Progress · Carry — anchor the day before sleep.",
      slots: [
        {
          slot: "lesson",
          slotName: "Lesson",
          slotQuestion: "What this day taught you",
        },
        {
          slot: "progress",
          slotName: "Progress",
          slotQuestion: "What moved forward or met resistance",
        },
        {
          slot: "carry",
          slotName: "Carry",
          slotQuestion: "What to take into rest or the next cycle",
        },
      ],
    },
  },
};

export const DAILY_WINDOW_ORDER: DailyWindowId[] = [
  "morning",
  "midday",
  "evening",
];

export function activeDailyWindow(now: Date = new Date()): DailyWindowId {
  const h = now.getHours();
  if (h >= 0 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "midday";
  return "evening";
}

export function isDailyWindowOpen(
  windowId: DailyWindowId,
  now: Date = new Date(),
): boolean {
  const [start, end] = DAILY_THREE[windowId].hours;
  const h = now.getHours();
  return h >= start && h < end;
}

export function dailyThreeOfTheDay(
  windowId: DailyWindowId,
  d: Date = new Date(),
  who: string = drawerId(),
): SpreadCard[] {
  const key = `${who}|${dayKey(d)}|${windowId}`;
  const slots = DAILY_THREE[windowId].spread.slots;
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

export function allDailyThreeOfTheDay(
  d: Date = new Date(),
  who: string = drawerId(),
): Record<DailyWindowId, SpreadCard[]> {
  return {
    morning: dailyThreeOfTheDay("morning", d, who),
    midday: dailyThreeOfTheDay("midday", d, who),
    evening: dailyThreeOfTheDay("evening", d, who),
  };
}

export interface DailyThreeStatus {
  windowId: DailyWindowId;
  window: DailyWindow;
  open: boolean;
  isActive: boolean;
  spread: SpreadCard[];
}

export function dailyThreeStatus(
  d: Date = new Date(),
  who: string = drawerId(),
  now: Date = new Date(),
): DailyThreeStatus[] {
  const active = activeDailyWindow(now);
  return DAILY_WINDOW_ORDER.map((id) => ({
    windowId: id,
    window: DAILY_THREE[id],
    open: isDailyWindowOpen(id, now),
    isActive: id === active,
    spread: dailyThreeOfTheDay(id, d, who),
  }));
}

export const DAILY_THREE_QUOTA = 3;

export function dailyThreeUnlockedCount(now: Date = new Date()): number {
  return DAILY_WINDOW_ORDER.filter((id) => isDailyWindowOpen(id, now)).length;
}
