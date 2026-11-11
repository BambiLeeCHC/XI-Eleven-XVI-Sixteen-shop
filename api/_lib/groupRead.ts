/**
 * Server tandem and group reads. Same Tri-Sky writer as a morning read.
 * Stays inside /api/chart so the project stays at 12 functions.
 */

import { composeGroupReading, type GroupPerson, type GroupReading } from "../../src/lib/groupSky.js";
import { buildLongReadPrompt, LONG_READ_SYSTEM_PROMPT } from "../../src/lib/longRead.js";
import { generateWithGroq } from "./groq.js";
import { computeNatalChart, geocodeLocation } from "./natalChart.js";
import {
  type ApiRequest,
  type ApiResponse,
  currentUser,
  HttpError,
  supabaseAdmin,
} from "./server.js";

type BirthRow = {
  id: string;
  name: string | null;
  birth_date: string | null;
  birth_time: string | null;
  birth_location: string | null;
  birth_lat: number | string | null;
  birth_lng: number | string | null;
  gender_identity: string | null;
};

async function chartFor(row: BirthRow): Promise<GroupPerson["chart"] | null> {
  if (!row.birth_date || !row.birth_location) return null;
  let lat = row.birth_lat != null ? Number(row.birth_lat) : null;
  let lng = row.birth_lng != null ? Number(row.birth_lng) : null;
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    const geo = await geocodeLocation(row.birth_location);
    if (!geo) return null;
    lat = geo.lat;
    lng = geo.lng;
  }
  const chart = computeNatalChart(row.birth_date, row.birth_time, { lat, lng });
  return {
    ascendant: chart.ascendant,
    placements: chart.placements.map(item => ({
      body: item.body,
      sign: item.sign,
      degree: item.degree,
      degreeInSign: item.degreeInSign,
      house: item.house ?? 1,
    })),
    houses: chart.houses,
  };
}

async function voiceGroupReading(reading: GroupReading): Promise<GroupReading> {
  const situation = reading.question.trim() || "not specified";
  const result = await generateWithGroq(
    LONG_READ_SYSTEM_PROMPT,
    buildLongReadPrompt(
      reading.cards,
      reading.roles.map(role => role.name).filter(Boolean).join(" and ") || reading.title,
      situation,
      undefined,
      undefined,
      reading.privateNote,
    ),
    5000,
  );
  if (!result.success) return reading;
  return { ...reading, body: result.text };
}

export async function handleGroupRead(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    throw new HttpError(405, "Method not allowed");
  }
  const user = await currentUser(req);
  if (!user) throw new HttpError(401, "Please sign in first");

  const raw = (req.body as { participantIds?: unknown } | undefined)?.participantIds;
  const ids = Array.isArray(raw)
    ? [...new Set(raw.map(item => String(item)).filter(Boolean))]
    : [];
  if (!ids.includes(user.id)) ids.unshift(user.id);
  if (ids.length < 2 || ids.length > 8) {
    throw new HttpError(400, "A group read needs you plus 1 to 7 connected people.");
  }

  const admin = supabaseAdmin();
  const others = ids.filter(id => id !== user.id);
  const { data: links, error: linkError } = await admin
    .from("north_connections")
    .select("requester_id, addressee_id, status")
    .eq("status", "accepted")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);
  if (linkError) throw new HttpError(500, "Couldn't check your connections.");
  const allowed = new Set<string>([user.id]);
  for (const link of links ?? []) {
    const other = link.requester_id === user.id ? link.addressee_id : link.requester_id;
    if (other) allowed.add(other);
  }
  const blocked = others.filter(id => !allowed.has(id));
  if (blocked.length) {
    throw new HttpError(403, "Group reads only include people you are already connected to.");
  }

  const { data: rows, error } = await admin
    .from("profiles")
    .select("id, name, birth_date, birth_time, birth_location, birth_lat, birth_lng, gender_identity")
    .in("id", ids);
  if (error) throw new HttpError(500, "Couldn't load charts for this group.");

  const people: GroupPerson[] = [];
  for (const id of ids) {
    const row = (rows ?? []).find(item => item.id === id) as BirthRow | undefined;
    if (!row) continue;
    const chart = await chartFor(row);
    if (!chart) continue;
    people.push({
      id: row.id,
      name: row.name?.trim() || "Unnamed",
      chart,
      gender: row.gender_identity ?? undefined,
    });
  }
  if (people.length < 2) {
    throw new HttpError(400, "At least two people in this group need a birth date and place.");
  }

  const body = (req.body ?? {}) as {
    question?: string;
  };
  const reading = await voiceGroupReading(composeGroupReading(people, new Date(), {
    question: body.question,
  }));
  let saved = false;
  const insert = await admin.from("group_reads").insert({
    host_id: user.id,
    title: reading.title,
    body: reading.body,
    participant_ids: people.map(person => person.id),
    participant_names: people.map(person => person.name),
    question: reading.question || null,
    connection: null,
    connection_note: null,
  });
  if (!insert.error) saved = true;

  return res.status(200).json({
    success: true,
    saved,
    title: reading.title,
    kindLabel: reading.kindLabel,
    body: reading.body,
    bond: reading.bond,
    names: people.map(person => person.name),
  });
}
