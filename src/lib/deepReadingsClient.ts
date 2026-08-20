/**
 * Supabase client helpers for The Long Read (deep_readings).
 *
 * The storefront still goes through handlers/api for draws (server enforces
 * subscription + per-window quota). These helpers are for typed reads and for
 * any direct client-side listing that needs the `window` column.
 *
 * Schema (after migration 20260820180000_deep_readings_window):
 *   deep_readings.window  text  — 'morning' | 'midday' | 'evening' | null (legacy)
 */

import { supabase } from "./supabase";

export type DailyWindow = "morning" | "midday" | "evening";

export const DAILY_WINDOWS: readonly DailyWindow[] = [
  "morning",
  "midday",
  "evening",
] as const;

export function isDailyWindow(value: unknown): value is DailyWindow {
  return value === "morning" || value === "midday" || value === "evening";
}

/** Local-time window for a given clock (defaults to now). */
export function activeDailyWindow(now = new Date()): DailyWindow {
  const h = now.getHours();
  if (h < 12) return "morning";
  if (h < 17) return "midday";
  return "evening";
}

export interface DeepReadingRow {
  id: string;
  user_id: string;
  spread: unknown;
  reading: string;
  window: DailyWindow | string | null;
  created_at: string;
}

function startOfLocalDay(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function endOfLocalDay(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

/**
 * All Long Reads for the signed-in user, newest first.
 * Requires an authenticated Supabase session (RLS).
 */
export async function listMyDeepReadings(): Promise<DeepReadingRow[]> {
  const { data, error } = await supabase
    .from("deep_readings")
    .select("id, user_id, spread, reading, window, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as DeepReadingRow[];
}

/**
 * Today's readings keyed by window (local calendar day).
 * Used to mark Morning / Midday / Evening as Drawn on the Long Read page.
 */
export async function todaysDeepReadingsByWindow(
  now = new Date(),
): Promise<Partial<Record<DailyWindow, DeepReadingRow>>> {
  const start = startOfLocalDay(now).toISOString();
  const end = endOfLocalDay(now).toISOString();

  const { data, error } = await supabase
    .from("deep_readings")
    .select("id, user_id, spread, reading, window, created_at")
    .gte("created_at", start)
    .lte("created_at", end)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const map: Partial<Record<DailyWindow, DeepReadingRow>> = {};
  for (const row of (data ?? []) as DeepReadingRow[]) {
    if (!isDailyWindow(row.window)) continue;
    if (!map[row.window]) map[row.window] = row;
  }
  return map;
}

/** Whether this window already has a Long Read for the local calendar day. */
export async function hasDrawnWindowToday(
  windowId: DailyWindow,
  now = new Date(),
): Promise<boolean> {
  const map = await todaysDeepReadingsByWindow(now);
  return Boolean(map[windowId]);
}
