export const NORTH_FOCUSES = ["general", "career", "love", "money"] as const;

export type NorthFocus = (typeof NORTH_FOCUSES)[number];

export type NorthProfileInput = {
  name: string;
  focus: NorthFocus;
  note: string | null;
  birthDate: string | null;
  birthTime: string | null;
  birthLocation: string | null;
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}(:\d{2})?$/;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function parseNorthProfile(input: {
  name?: unknown;
  focus?: unknown;
  note?: unknown;
  birthDate?: unknown;
  birthTime?: unknown;
  birthLocation?: unknown;
}): { ok: true; value: NorthProfileInput } | { ok: false; message: string } {
  const name = text(input.name);
  if (!name)
    return { ok: false, message: "Add the name you want people to see." };
  if (name.length > 80)
    return { ok: false, message: "Keep your name under 80 characters." };

  const focus = text(input.focus) || "general";
  if (!NORTH_FOCUSES.includes(focus as NorthFocus)) {
    return { ok: false, message: "Choose general, career, love, or money." };
  }

  const noteRaw = text(input.note);
  if (noteRaw.length > 280) {
    return { ok: false, message: "Keep your note under 280 characters." };
  }

  const birthDate = text(input.birthDate);
  if (birthDate && !DATE.test(birthDate)) {
    return {
      ok: false,
      message: "Birth date needs to be a real calendar date.",
    };
  }

  const birthTime = text(input.birthTime);
  if (birthTime && !TIME.test(birthTime)) {
    return { ok: false, message: "Birth time needs hours and minutes." };
  }

  const birthLocation = text(input.birthLocation);
  if (birthLocation.length > 160) {
    return { ok: false, message: "Keep the birth place under 160 characters." };
  }

  return {
    ok: true,
    value: {
      name,
      focus: focus as NorthFocus,
      note: noteRaw || null,
      birthDate: birthDate || null,
      birthTime: birthTime || null,
      birthLocation: birthLocation || null,
    },
  };
}

/** Fields a connected person may see. Birth data and email stay off this shape. */
export type PublicNorthProfile = {
  id: string;
  name: string;
  focus: NorthFocus;
  note: string | null;
  sign: string | null;
};

export function toPublicNorthProfile(input: {
  id: string;
  name?: string | null;
  focus?: string | null;
  note?: string | null;
  sign?: string | null;
}): PublicNorthProfile {
  const focus = NORTH_FOCUSES.includes(input.focus as NorthFocus)
    ? (input.focus as NorthFocus)
    : "general";
  const name = (input.name ?? "").trim() || "Member";
  const note = (input.note ?? "").trim();
  return {
    id: input.id,
    name: name.slice(0, 80),
    focus,
    note: note ? note.slice(0, 280) : null,
    sign: input.sign?.trim() || null,
  };
}
