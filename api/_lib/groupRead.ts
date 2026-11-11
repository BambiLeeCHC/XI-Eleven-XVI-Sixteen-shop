/**
 * Server group read. Same chart math as a natal chart, then the group
 * synastry layer. Stays inside /api/chart so the project stays at 12 functions.
 */

import { composeGroupReading, type GroupPerson, type GroupReading } from "../../src/lib/groupSky.js";
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

const VOICE = `You are the XI · XVI reader. Every reading is a tarot pull, interpreted through the charts as a lens. Magnetic, specific, poignant, and always uplifting.

Tone, non-negotiable:
- Positive, forward, best-case. Strengths, growth, mending, progress.
- Never write friction, challenge, tension, warning, doom, or a section called "where you spark".
- Reversed cards and hard cards (Tower, Ten of Swords, Death, the Devil) are breakthroughs and invitations to move. Never warnings.
- Squares and oppositions are growth edges that push the people forward. Never problems.
- The close is an empowering directive.
- Use the pronouns given. If none are given, use they/them and the person's name.
- Never write husband, wife, or assumed masculine/feminine roles.
- A private identity note may be included so you can affirm chosen family, visibility, or building a life on their own terms. Never print the orientation or gender label itself in the reading.

Use only the facts given. Do not invent a placement, a person, a card, or an aspect. No degree numbers. No orbs.

Write exactly the headings you are given, each as "## Heading", and nothing else.
## Portrait
Two or three sentences. Open on the core card by name. Say what these people are together, at their best.
Then one "## " section for every heading listed after Portrait, in that order, each a short paragraph that names the card and weaves one real placement.`;

function section(text: string, heading: string) {
  const match = text.match(new RegExp(`##\\s*${heading}\\s*([\\s\\S]*?)(?=\\n##\\s|$)`, "i"));
  return match?.[1]?.trim() ?? "";
}

function voiced(base: GroupReading, text: string): GroupReading | null {
  const portrait = section(text, "Portrait");
  if (!portrait) return null;
  const sections = base.sections.map(item => {
    const body = section(text, item.heading);
    return { heading: item.heading, text: body || item.text };
  });
  if (sections.some(item => !item.text)) return null;
  const magnetize = sections.find(item => item.heading === "Where you magnetize")?.text ?? base.magnetize;
  const breakthrough = sections.find(item => item.heading === "Breakthrough")?.text ?? base.breakthrough;
  const directive = sections.find(item => /move|next step/i.test(item.heading))?.text ?? base.directive;
  const next = { ...base, portrait, sections, magnetize, breakthrough, directive };
  next.body = [portrait, ...sections.map(item => `${item.heading}. ${item.text}`)].join("\n\n");
  return next;
}

async function voiceGroupReading(reading: GroupReading): Promise<GroupReading> {
  const facts = [
    `Title: ${reading.title}`,
    `Kind: ${reading.kindLabel}`,
    `People, in order: ${reading.roles.map(role => role.name).join(", ")}`,
    `Section headings after Portrait, in order: ${reading.sections.map(item => item.heading).join(" | ")}`,
    "Cards, in order:",
    ...reading.cards.map(card => `${card.slotName}: ${card.card.name}${card.reversed ? " reversed" : ""}. ${card.reversed ? card.card.reversed : card.card.upright}`),
    "Chart facts (for the lens only — do not recite degrees):",
    ...reading.details,
    reading.privateNote ? `Private context, never quote these labels:\n${reading.privateNote}` : "",
  ].join("\n");
  const result = await generateWithGroq(VOICE, facts, 1800);
  if (!result.success) return reading;
  return voiced(reading, result.text) ?? reading;
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
    .select("id, name, birth_date, birth_time, birth_location, birth_lat, birth_lng")
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
    });
  }
  if (people.length < 2) {
    throw new HttpError(400, "At least two people in this group need a birth date and place.");
  }

  const body = (req.body ?? {}) as {
    question?: string;
    connectionId?: string;
    connectionLabel?: string;
    otherText?: string;
    leadId?: string;
  };
  const reading = await voiceGroupReading(composeGroupReading(people, new Date(), {
    question: body.question,
    connectionId: body.connectionId,
    connectionLabel: body.connectionLabel,
    otherText: body.otherText,
    leadId: body.leadId,
  }));
  let saved = false;
  const insert = await admin.from("group_reads").insert({
    host_id: user.id,
    title: reading.title,
    body: reading.body,
    participant_ids: people.map(person => person.id),
    participant_names: people.map(person => person.name),
    question: reading.question || null,
    connection: reading.connection || null,
    connection_note: body.otherText?.trim() || null,
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
