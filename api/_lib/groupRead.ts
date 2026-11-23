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

const VOICE = `You are the XI · XVI Reader writing a Group Read for True North — same house voice as Tri-Sky / The Long Read.

Your only job is to bring hope for this group. Show what they are already doing right together, and the best-case path the cards open — even when that path is slim. You never darken the room.

CORE MANDATE:
- Speak to what is working between these people, what each person already brings, and the best case the spread opens.
- NEVER dwell on failure, doom, warnings, what they are doing wrong, or worst-case outcomes.
- Heavy or reversed cards become course-correction, latent strength, or the best move still on the table — never collapse.
- Do not invent hardship. Do not "balance" hope with fear.

VOICE AND STRUCTURE (match Tri-Sky):
- Continuous prose. No bullet lists. No emoji. No sign-off.
- Open from what is already workable in how this group shows up together — not a teaser about a card.
- Address the people by name, woven in naturally. Use given pronouns; otherwise they/them.
- Address the cards ONE AT A TIME in draw order, each in its own short paragraph that starts with the position name (e.g. "In the Root of this, **The Star** ..."). Read each card against this group and their question as evidence of strength, support, or best-case possibility — not keyword soup.
- Build one throughline of encouragement across the spread.
- Close with one synthesis paragraph of the hopeful throughline, then one concrete second-person (or group) action that moves them toward the best case. No vague mysticism. No telling them how to feel.
- Sparing bold (**like this**) on three or four phrases that matter most.
- Write 320–480 words.
- Never invent a person, card, or placement. No degree numbers. No orbs.
- Never print private orientation or gender labels as the subject.

Format exactly:
## Opening
2–3 sentences. Name the group dynamic and what is already working.
## The reading
The full continuous read: people woven in, then each card by position, then synthesis and the one action.
`;

function section(text: string, heading: string) {
  const match = text.match(new RegExp(`##\\s*${heading}\\s*([\\s\\S]*?)(?=\\n##\\s|$)`, "i"));
  return match?.[1]?.trim() ?? "";
}

function voiced(base: GroupReading, text: string): GroupReading | null {
  const opening = section(text, "Opening") || section(text, "Portrait");
  const reading = section(text, "The reading") || section(text, "Reading");
  if (!opening && !reading) return null;
  const portrait = opening || base.portrait;
  const main = reading || text.replace(/^##\\s*Opening[\\s\\S]*?(?=##|$)/i, "").trim() || base.body;
  const sections = [{ heading: "The reading", text: main }];
  const sentences = main.split(/(?<=\\.)\\s+/).filter(Boolean);
  const directive = sentences.length ? sentences[sentences.length - 1] : base.directive;
  const next: GroupReading = {
    ...base,
    portrait,
    sections,
    magnetize: main,
    breakthrough: main,
    directive,
    body: `${portrait}\\n\\n${main}`,
  };
  return next;
}

async function voiceGroupReading(reading: GroupReading): Promise<GroupReading> {
  const facts = [
    `Title: ${reading.title}`,
    `Kind: ${reading.kindLabel}`,
    `Connection: ${reading.connection}`,
    reading.question ? `Their question: ${reading.question}` : "No specific question — speak to what this group is ready to build.",
    `People, in order: ${reading.roles.map(role => role.name).join(", ")}`,
    "Each person (use for voice only):",
    ...reading.roles.map(role => `- ${role.name}: ${role.line}`),
    "Cards, in draw order:",
    ...reading.cards.map(
      card =>
        `- ${card.slotName}: ${card.card.name}${card.reversed ? " REVERSED" : " upright"}. ` +
        `${card.reversed ? card.card.reversed : card.card.upright}`,
    ),
    "Chart facts (lens only — do not recite degrees):",
    ...reading.details,
    reading.privateNote
      ? `Private context for pronouns/relationship framing only, never quote labels:\\n${reading.privateNote}`
      : "",
    "",
    "Write the Group Read now in the Tri-Sky house voice. Follow the format exactly.",
  ].join("\\n");
  const result = await generateWithGroq(VOICE, facts, 2200);
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
