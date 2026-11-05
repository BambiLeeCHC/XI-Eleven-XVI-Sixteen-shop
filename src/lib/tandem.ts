import { NORTH_FOCUSES, type NorthFocus } from "./northProfile.js";

export type ConnectionStatus = "pending" | "accepted" | "declined" | "revoked";
export type SessionStatus = "invited" | "active" | "declined" | "closed";

export type Decision =
  | { ok: true }
  | { ok: false; code: string; message: string };

function deny(
  code: string,
  message: string,
): { ok: false; code: string; message: string } {
  return { ok: false, code, message };
}

export const allow: Decision = { ok: true };

/** In-app only. Tandem must never send email or SMS from this flow. */
export const TANDEM_SENDS_EMAIL = false;

export function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function parseFocus(value: unknown): NorthFocus | null {
  const focus = typeof value === "string" ? value.trim() : "";
  return NORTH_FOCUSES.includes(focus as NorthFocus)
    ? (focus as NorthFocus)
    : null;
}

export function canInvite(input: {
  actorId: string;
  targetId: string;
  existingStatus: ConnectionStatus | null;
  actorIsAddressee: boolean;
}): Decision {
  if (!input.actorId || !input.targetId)
    return deny("missing", "Choose someone to invite.");
  if (input.actorId === input.targetId) {
    return deny("self", "You can't open a tandem with yourself.");
  }
  if (input.existingStatus === "accepted") {
    return deny("already_connected", "You're already connected.");
  }
  if (input.existingStatus === "pending") {
    if (input.actorIsAddressee) {
      return deny(
        "awaiting_you",
        "They already invited you. Accept it from your invitations.",
      );
    }
    return deny("already_pending", "That invitation is already waiting.");
  }
  return allow;
}

export function canRespondConnection(input: {
  actorId: string;
  addresseeId: string;
  status: ConnectionStatus;
}): Decision {
  if (input.actorId !== input.addresseeId) {
    return deny("not_addressee", "Only the person invited can answer.");
  }
  if (input.status !== "pending") {
    return deny("not_pending", "This invitation is no longer open.");
  }
  return allow;
}

export function canRevokeConnection(input: {
  actorId: string;
  requesterId: string;
  addresseeId: string;
  status: ConnectionStatus;
}): Decision {
  const party =
    input.actorId === input.requesterId || input.actorId === input.addresseeId;
  if (!party) return deny("not_party", "You aren't part of this connection.");
  if (input.status !== "accepted") {
    return deny("not_accepted", "Only an accepted connection can be ended.");
  }
  return allow;
}

export function canOpenSession(input: {
  actorId: string;
  requesterId: string;
  addresseeId: string;
  connectionStatus: ConnectionStatus;
  openSession: boolean;
}): Decision {
  const party =
    input.actorId === input.requesterId || input.actorId === input.addresseeId;
  if (!party) return deny("not_party", "You aren't part of this connection.");
  if (input.connectionStatus !== "accepted") {
    return deny(
      "not_accepted",
      "Tandem opens after you both accept the connection.",
    );
  }
  if (input.openSession) {
    return deny("session_open", "Finish the tandem that's already open.");
  }
  return allow;
}

export function canAnswerSession(input: {
  actorId: string;
  guestId: string;
  status: SessionStatus;
}): Decision {
  if (input.actorId !== input.guestId) {
    return deny(
      "not_guest",
      "Only the person invited into this tandem can answer.",
    );
  }
  if (input.status !== "invited") {
    return deny("not_invited", "This tandem invitation is no longer open.");
  }
  return allow;
}

export function canContribute(input: {
  actorId: string;
  hostId: string;
  guestId: string;
  status: SessionStatus;
  alreadyContributed: boolean;
}): Decision {
  const party =
    input.actorId === input.hostId || input.actorId === input.guestId;
  if (!party)
    return deny("not_party", "This tandem is private to the two people in it.");
  if (input.status !== "active") {
    return deny(
      "not_active",
      "Writing opens after the invitation is accepted.",
    );
  }
  if (input.alreadyContributed) {
    return deny(
      "already_contributed",
      "You already added your side of this tandem.",
    );
  }
  return allow;
}

export function canCloseSession(input: {
  actorId: string;
  hostId: string;
  guestId: string;
  status: SessionStatus;
}): Decision {
  const party =
    input.actorId === input.hostId || input.actorId === input.guestId;
  if (!party)
    return deny("not_party", "This tandem is private to the two people in it.");
  if (input.status === "closed" || input.status === "declined") {
    return deny("finished", "This tandem is already finished.");
  }
  if (input.status === "invited" && input.actorId !== input.hostId) {
    return deny(
      "not_host",
      "Only the host can withdraw an invitation. You can decline it instead.",
    );
  }
  if (input.status === "invited" || input.status === "active") return allow;
  return deny("finished", "This tandem is already finished.");
}

export function parseTandemText(
  value: unknown,
  max: number,
  label: string,
): { ok: true; value: string } | { ok: false; code: string; message: string } {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return deny("empty", `Add ${label} before sending.`);
  if (text.length > max)
    return deny("too_long", `Keep ${label} under ${max} characters.`);
  return { ok: true, value: text };
}

export function composeTandemReading(input: {
  focus: string;
  prompt: string;
  hostName: string;
  hostBody: string;
  guestName: string;
  guestBody: string;
}) {
  return [
    `Tandem · ${input.focus}`,
    input.prompt.trim(),
    "",
    input.hostName.trim() || "Host",
    input.hostBody.trim(),
    "",
    input.guestName.trim() || "Guest",
    input.guestBody.trim(),
  ].join("\n");
}
