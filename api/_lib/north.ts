/**
 * Consented True North tandem.
 *
 * Writes go through the service role only after these checks. The browser
 * cannot insert a connection, accept on someone else's behalf, or read a
 * session it is not in. Invitations are stored for the recipient's next
 * visit. This module does not send email or any other message.
 */

import {
  type PublicNorthProfile,
  toPublicNorthProfile,
} from "../../src/lib/northProfile.js";
import {
  type ConnectionStatus,
  canAnswerSession,
  canCloseSession,
  canContribute,
  canInvite,
  canOpenSession,
  canRespondConnection,
  canRevokeConnection,
  composeTandemReading,
  normalizeEmail,
  parseFocus,
  parseTandemText,
  type SessionStatus,
} from "../../src/lib/tandem.js";
import { computeNatalChart } from "./natalChart.js";
import {
  type ApiRequest,
  type ApiResponse,
  currentUser,
  HttpError,
  supabaseAdmin,
} from "./server.js";

type ProfileRow = {
  id: string;
  name: string | null;
  email?: string | null;
  north_focus: string | null;
  north_note: string | null;
  birth_date: string | null;
  birth_time: string | null;
  birth_lat: number | string | null;
  birth_lng: number | string | null;
};

type ConnectionRow = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: ConnectionStatus;
  created_at: string;
  responded_at: string | null;
};

type SessionRow = {
  id: string;
  connection_id: string;
  host_id: string;
  guest_id: string;
  status: SessionStatus;
  focus: string;
  prompt: string;
  shared_reading: string | null;
  created_at: string;
  accepted_at: string | null;
  closed_at: string | null;
};

type EntryRow = {
  id: string;
  session_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

const PROFILE_FIELDS =
  "id, name, north_focus, north_note, birth_date, birth_time, birth_lat, birth_lng";

function dbOrThrow(error: { message?: string; code?: string } | null) {
  if (!error) return;
  console.error("north tandem db", error.code, error.message);
  const missing =
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    /north_connections|tandem_sessions|tandem_entries|schema cache|does not exist/i.test(
      error.message ?? "",
    );
  if (missing) {
    throw new HttpError(
      503,
      "Tandem isn't available until the True North migration is applied. Nothing was sent.",
    );
  }
  throw new HttpError(500, "Couldn't update tandem just now.");
}

function sunSign(profile: ProfileRow): string | null {
  if (
    !profile.birth_date ||
    profile.birth_lat == null ||
    profile.birth_lng == null
  )
    return null;
  try {
    const chart = computeNatalChart(
      String(profile.birth_date).slice(0, 10),
      profile.birth_time,
      {
        lat: Number(profile.birth_lat),
        lng: Number(profile.birth_lng),
      },
    );
    return chart.placements.find(p => p.body === "Sun")?.sign ?? null;
  } catch (error) {
    console.error("north sun sign", error);
    return null;
  }
}

function present(profile: ProfileRow): PublicNorthProfile {
  return toPublicNorthProfile({
    id: profile.id,
    name: profile.name,
    focus: profile.north_focus,
    note: profile.north_note,
    sign: sunSign(profile),
  });
}

async function loadProfiles(ids: string[]) {
  const unique = [...new Set(ids)];
  const map = new Map<string, ProfileRow>();
  if (unique.length === 0) return map;
  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("profiles")
    .select(PROFILE_FIELDS)
    .in("id", unique);
  dbOrThrow(error);
  for (const row of (data ?? []) as ProfileRow[]) map.set(row.id, row);
  return map;
}

function requireDecision(decision: { ok: boolean; message?: string }) {
  if (!decision.ok)
    throw new HttpError(403, decision.message || "Not allowed.");
}

export async function handleNorth(req: ApiRequest, res: ApiResponse) {
  const user = await currentUser(req);
  if (!user) throw new HttpError(401, "Please sign in first");

  const body = (req.body ?? {}) as Record<string, unknown>;
  const op = typeof body.op === "string" ? body.op : "";

  if (op === "list") return res.status(200).json(await listRoom(user.id));
  if (op === "person")
    return res
      .status(200)
      .json(await viewPerson(user.id, String(body.userId ?? "")));
  if (op === "invite")
    return res.status(200).json(await invite(user.id, body.email));
  if (op === "respond") {
    return res
      .status(200)
      .json(
        await respond(user.id, String(body.connectionId ?? ""), body.decision),
      );
  }
  if (op === "revoke")
    return res
      .status(200)
      .json(await revoke(user.id, String(body.connectionId ?? "")));
  if (op === "open") {
    return res
      .status(200)
      .json(
        await openSession(
          user.id,
          String(body.connectionId ?? ""),
          body.focus,
          body.prompt,
        ),
      );
  }
  if (op === "answer") {
    return res
      .status(200)
      .json(
        await answerSession(
          user.id,
          String(body.sessionId ?? ""),
          body.decision,
        ),
      );
  }
  if (op === "contribute") {
    return res
      .status(200)
      .json(await contribute(user.id, String(body.sessionId ?? ""), body.body));
  }
  if (op === "close")
    return res
      .status(200)
      .json(await closeSession(user.id, String(body.sessionId ?? "")));

  throw new HttpError(400, "Unknown tandem action.");
}

async function listRoom(actorId: string) {
  const admin = supabaseAdmin();
  const { data: connections, error: connectionError } = await admin
    .from("north_connections")
    .select("id, requester_id, addressee_id, status, created_at, responded_at")
    .or(`requester_id.eq.${actorId},addressee_id.eq.${actorId}`)
    .order("created_at", { ascending: false });
  dbOrThrow(connectionError);

  const visible = ((connections ?? []) as ConnectionRow[]).filter(
    row => row.status === "pending" || row.status === "accepted",
  );
  const { data: sessions, error: sessionError } = await admin
    .from("tandem_sessions")
    .select(
      "id, connection_id, host_id, guest_id, status, focus, prompt, shared_reading, created_at, accepted_at, closed_at",
    )
    .or(`host_id.eq.${actorId},guest_id.eq.${actorId}`)
    .order("created_at", { ascending: false })
    .limit(40);
  dbOrThrow(sessionError);
  const sessionRows = (sessions ?? []) as SessionRow[];
  const sessionIds = sessionRows.map(row => row.id);
  let entries: EntryRow[] = [];
  if (sessionIds.length) {
    const { data, error } = await admin
      .from("tandem_entries")
      .select("id, session_id, author_id, body, created_at")
      .in("session_id", sessionIds);
    dbOrThrow(error);
    entries = (data ?? []) as EntryRow[];
  }

  const ids = [
    actorId,
    ...visible.flatMap(row => [row.requester_id, row.addressee_id]),
    ...sessionRows.flatMap(row => [row.host_id, row.guest_id]),
    ...entries.map(row => row.author_id),
  ];
  const profiles = await loadProfiles(ids);

  return {
    success: true,
    connections: visible.map(row => {
      const otherId =
        row.requester_id === actorId ? row.addressee_id : row.requester_id;
      const person = profiles.get(otherId);
      return {
        id: row.id,
        status: row.status,
        direction: row.requester_id === actorId ? "outgoing" : "incoming",
        createdAt: row.created_at,
        respondedAt: row.responded_at,
        person: person
          ? present(person)
          : toPublicNorthProfile({ id: otherId, name: "Member" }),
      };
    }),
    sessions: sessionRows.map(row =>
      sessionView(actorId, row, entries, profiles),
    ),
  };
}

function sessionView(
  actorId: string,
  row: SessionRow,
  entries: EntryRow[],
  profiles: Map<string, ProfileRow>,
) {
  const mine = entries.filter(entry => entry.session_id === row.id);
  const partnerId = row.host_id === actorId ? row.guest_id : row.host_id;
  const partner = profiles.get(partnerId);
  return {
    id: row.id,
    connectionId: row.connection_id,
    status: row.status,
    focus: row.focus,
    prompt: row.prompt,
    role: row.host_id === actorId ? "host" : "guest",
    partner: partner
      ? present(partner)
      : toPublicNorthProfile({ id: partnerId, name: "Member" }),
    sharedReading: row.shared_reading,
    createdAt: row.created_at,
    acceptedAt: row.accepted_at,
    closedAt: row.closed_at,
    mineSubmitted: mine.some(entry => entry.author_id === actorId),
    entries: mine.map(entry => ({
      authorId: entry.author_id,
      name: profiles.get(entry.author_id)?.name?.trim() || "Member",
      body: entry.body,
      createdAt: entry.created_at,
    })),
  };
}

async function assertConnected(actorId: string, otherId: string) {
  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("north_connections")
    .select("id, status")
    .or(
      `and(requester_id.eq.${actorId},addressee_id.eq.${otherId}),and(requester_id.eq.${otherId},addressee_id.eq.${actorId})`,
    )
    .maybeSingle();
  dbOrThrow(error);
  if (!data || data.status !== "accepted") {
    throw new HttpError(
      403,
      "Profiles open between people who have accepted a connection.",
    );
  }
}

async function viewPerson(actorId: string, userId: string) {
  if (!userId) throw new HttpError(400, "A profile is required.");
  if (userId === actorId) {
    const self = await loadProfiles([actorId]);
    const row = self.get(actorId);
    if (!row) throw new HttpError(404, "Profile not found.");
    return { success: true, person: present(row) };
  }
  await assertConnected(actorId, userId);
  const profiles = await loadProfiles([userId]);
  const row = profiles.get(userId);
  if (!row) throw new HttpError(404, "Profile not found.");
  return { success: true, person: present(row) };
}

async function findPair(actorId: string, targetId: string) {
  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("north_connections")
    .select("id, requester_id, addressee_id, status, created_at, responded_at")
    .or(
      `and(requester_id.eq.${actorId},addressee_id.eq.${targetId}),and(requester_id.eq.${targetId},addressee_id.eq.${actorId})`,
    )
    .maybeSingle();
  dbOrThrow(error);
  return (data ?? null) as ConnectionRow | null;
}

async function invite(actorId: string, email: unknown) {
  const normalized = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new HttpError(400, "Enter the email on their True North profile.");
  }
  const admin = supabaseAdmin();
  const { data: target, error } = await admin
    .from("profiles")
    .select("id, email")
    .ilike("email", normalized)
    .maybeSingle();
  dbOrThrow(error);
  if (!target?.id) {
    throw new HttpError(
      404,
      "No True North profile uses that email. Nothing was emailed.",
    );
  }
  const existing = await findPair(actorId, target.id);
  requireDecision(
    canInvite({
      actorId,
      targetId: target.id,
      existingStatus: existing?.status ?? null,
      actorIsAddressee: existing?.addressee_id === actorId,
    }),
  );

  const now = new Date().toISOString();
  if (existing) {
    const { error: updateError } = await admin
      .from("north_connections")
      .update({
        requester_id: actorId,
        addressee_id: target.id,
        status: "pending",
        responded_at: null,
        created_at: now,
      })
      .eq("id", existing.id);
    dbOrThrow(updateError);
  } else {
    const { error: insertError } = await admin
      .from("north_connections")
      .insert({
        requester_id: actorId,
        addressee_id: target.id,
        status: "pending",
      });
    dbOrThrow(insertError);
  }
  return {
    success: true,
    sent: false,
    message: "Invitation saved in the app. No email was sent.",
  };
}

async function loadConnection(id: string) {
  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("north_connections")
    .select("id, requester_id, addressee_id, status, created_at, responded_at")
    .eq("id", id)
    .maybeSingle();
  dbOrThrow(error);
  if (!data) throw new HttpError(404, "That connection is not available.");
  return data as ConnectionRow;
}

async function respond(
  actorId: string,
  connectionId: string,
  decision: unknown,
) {
  if (decision !== "accepted" && decision !== "declined") {
    throw new HttpError(400, "Accept or decline the invitation.");
  }
  const row = await loadConnection(connectionId);
  requireDecision(
    canRespondConnection({
      actorId,
      addresseeId: row.addressee_id,
      status: row.status,
    }),
  );
  const admin = supabaseAdmin();
  const { error } = await admin
    .from("north_connections")
    .update({ status: decision, responded_at: new Date().toISOString() })
    .eq("id", row.id)
    .eq("status", "pending");
  dbOrThrow(error);
  return { success: true, status: decision };
}

async function revoke(actorId: string, connectionId: string) {
  const row = await loadConnection(connectionId);
  requireDecision(
    canRevokeConnection({
      actorId,
      requesterId: row.requester_id,
      addresseeId: row.addressee_id,
      status: row.status,
    }),
  );
  const admin = supabaseAdmin();
  const { error } = await admin
    .from("north_connections")
    .update({ status: "revoked", responded_at: new Date().toISOString() })
    .eq("id", row.id);
  dbOrThrow(error);
  const { error: closeError } = await admin
    .from("tandem_sessions")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("connection_id", row.id)
    .in("status", ["invited", "active"]);
  dbOrThrow(closeError);
  return { success: true, status: "revoked" };
}

async function openSession(
  actorId: string,
  connectionId: string,
  focusRaw: unknown,
  promptRaw: unknown,
) {
  const focus = parseFocus(focusRaw);
  if (!focus)
    throw new HttpError(400, "Choose general, career, love, or money.");
  const prompt = parseTandemText(promptRaw, 280, "a prompt");
  if ("message" in prompt) throw new HttpError(400, prompt.message);

  const row = await loadConnection(connectionId);
  const admin = supabaseAdmin();
  const { data: openRows, error: openError } = await admin
    .from("tandem_sessions")
    .select("id")
    .eq("connection_id", row.id)
    .in("status", ["invited", "active"])
    .limit(1);
  dbOrThrow(openError);
  requireDecision(
    canOpenSession({
      actorId,
      requesterId: row.requester_id,
      addresseeId: row.addressee_id,
      connectionStatus: row.status,
      openSession: (openRows ?? []).length > 0,
    }),
  );
  const guestId =
    row.requester_id === actorId ? row.addressee_id : row.requester_id;
  const { data, error } = await admin
    .from("tandem_sessions")
    .insert({
      connection_id: row.id,
      host_id: actorId,
      guest_id: guestId,
      status: "invited",
      focus,
      prompt: prompt.value,
    })
    .select("id")
    .single();
  dbOrThrow(error);
  return { success: true, sessionId: data?.id ?? null, sent: false };
}

async function loadSession(id: string) {
  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("tandem_sessions")
    .select(
      "id, connection_id, host_id, guest_id, status, focus, prompt, shared_reading, created_at, accepted_at, closed_at",
    )
    .eq("id", id)
    .maybeSingle();
  dbOrThrow(error);
  if (!data) throw new HttpError(404, "That tandem is not available.");
  return data as SessionRow;
}

async function answerSession(
  actorId: string,
  sessionId: string,
  decision: unknown,
) {
  if (decision !== "active" && decision !== "declined") {
    throw new HttpError(400, "Accept or decline the tandem.");
  }
  const row = await loadSession(sessionId);
  requireDecision(
    canAnswerSession({ actorId, guestId: row.guest_id, status: row.status }),
  );
  const admin = supabaseAdmin();
  const patch =
    decision === "active"
      ? { status: "active", accepted_at: new Date().toISOString() }
      : { status: "declined", closed_at: new Date().toISOString() };
  const { error } = await admin
    .from("tandem_sessions")
    .update(patch)
    .eq("id", row.id)
    .eq("status", "invited");
  dbOrThrow(error);
  return { success: true, status: decision };
}

async function contribute(actorId: string, sessionId: string, body: unknown) {
  const text = parseTandemText(body, 2000, "your side");
  if ("message" in text) throw new HttpError(400, text.message);
  const row = await loadSession(sessionId);
  const admin = supabaseAdmin();
  const { data: existing, error: existingError } = await admin
    .from("tandem_entries")
    .select("id, author_id, body")
    .eq("session_id", row.id);
  dbOrThrow(existingError);
  const entries = (existing ?? []) as {
    id: string;
    author_id: string;
    body: string;
  }[];
  requireDecision(
    canContribute({
      actorId,
      hostId: row.host_id,
      guestId: row.guest_id,
      status: row.status,
      alreadyContributed: entries.some(entry => entry.author_id === actorId),
    }),
  );
  const { error } = await admin.from("tandem_entries").insert({
    session_id: row.id,
    author_id: actorId,
    body: text.value,
  });
  dbOrThrow(error);

  const mine = [...entries, { author_id: actorId, body: text.value }];
  const hostEntry = mine.find(entry => entry.author_id === row.host_id);
  const guestEntry = mine.find(entry => entry.author_id === row.guest_id);
  if (hostEntry && guestEntry) {
    const profiles = await loadProfiles([row.host_id, row.guest_id]);
    const shared = composeTandemReading({
      focus: row.focus,
      prompt: row.prompt,
      hostName: profiles.get(row.host_id)?.name || "Host",
      hostBody: hostEntry.body,
      guestName: profiles.get(row.guest_id)?.name || "Guest",
      guestBody: guestEntry.body,
    });
    const { error: shareError } = await admin
      .from("tandem_sessions")
      .update({ shared_reading: shared })
      .eq("id", row.id);
    dbOrThrow(shareError);
  }
  return { success: true };
}

async function closeSession(actorId: string, sessionId: string) {
  const row = await loadSession(sessionId);
  requireDecision(
    canCloseSession({
      actorId,
      hostId: row.host_id,
      guestId: row.guest_id,
      status: row.status,
    }),
  );
  const admin = supabaseAdmin();
  const { error } = await admin
    .from("tandem_sessions")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("id", row.id);
  dbOrThrow(error);
  return { success: true, status: "closed" };
}
