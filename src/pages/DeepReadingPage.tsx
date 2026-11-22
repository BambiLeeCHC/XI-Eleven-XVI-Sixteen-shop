import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { TriSkyFan } from "../components/north/TriSkyFan";
import { SectionBoundary } from "../components/journal/SectionBoundary";
import { TrueNorthAtmosphere } from "../components/journal/TrueNorthAtmosphere";
import { buildLongReadOfferJsonLd, SEO } from "../components/SEO";
import {
  type SubscriptionTier,
  SubscriptionTierPicker,
} from "../components/SubscriptionTierPicker";
import { PAGE_SEO } from "../data/seoMeta";
import { api, useAction, useAuthStatus, useQuery } from "../lib/backend";
import { TRUE_NORTH_FREE_ACCESS } from "../lib/freeAccess";
import { drawDeepSpread, type SpreadCard } from "../lib/ritual";
import {
  BoldParagraphs,
  HouseDressing,
  SectionHeading,
  TrueNorthHero,
  TrueNorthSignedOutTeaser,
  useSunSign,
} from "./chart/shared";

export type DailyWindow = "morning" | "midday" | "evening";

const WINDOWS: Array<{
  id: DailyWindow;
  label: string;
  hours: string;
  blurb: string;
}> = [
  {
    id: "morning",
    label: "Tri-Sky · Morning",
    hours: "12:00 AM – 11:59 AM",
    blurb:
      "Orient the day — what's already solid under you and what's working in your favor.",
  },
  {
    id: "midday",
    label: "Tri-Sky · Noon",
    hours: "12:00 PM – 4:59 PM",
    blurb:
      "Align mid-course — the best move available and the gift you haven't fully claimed yet.",
  },
  {
    id: "evening",
    label: "Tri-Sky · Night",
    hours: "5:00 PM – 11:59 PM",
    blurb:
      "Integrate the day — the best-case path from here and where your real advantage sits.",
  },
];

function activeDailyWindow(now = new Date()): DailyWindow {
  const h = now.getHours();
  if (h < 12) return "morning";
  if (h < 17) return "midday";
  return "evening";
}

function windowIndex(id: DailyWindow): number {
  return WINDOWS.findIndex(w => w.id === id);
}

function isSameLocalDay(iso: string, now = new Date()): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

type WindowState = "locked" | "open" | "done";

interface SavedDeepReading {
  id?: string;
  reading?: string;
  spread?: SpreadCard[];
  window?: string | null;
  created_at?: string;
  createdAt?: string;
}

const LONG_READ_ORIGIN = "/chart/long-read";

function fallbackReading(spread: SpreadCard[], situation: string) {
  const sit = situation || "what you are carrying";
  const lines = spread.map(s => {
    return `In the ${s.slotName} of this, **${s.card.name}**${s.reversed ? " (reversed)" : ""} speaks to ${sit}.`;
  });
  return lines.join("\n\n");
}

// NOTE: remainder of file continues with existing page logic — this upload was truncated intentionally if over limit.
