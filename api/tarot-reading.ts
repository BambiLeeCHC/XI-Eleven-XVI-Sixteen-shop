/**
 * XI · XVI Tarot Reading Engine — the free daily "Embracing Change" spread.
 *
 * Powered by Groq (GROQ_API_KEY). Returns { success: false, reason, error }
 * when the key is missing or the upstream call fails so the UI can fall back
 * to static card copy without a silent hang.
 */

import {
  type ApiRequest,
  type ApiResponse,
  fail,
  HttpError,
} from "./_lib/server.js";
import { generateWithGroq, type GroqFailure } from "./_lib/groq.js";

interface SpreadCardInput {
  position: string;
  positionMeaning: string;
  name: string;
  reversed: boolean;
  keywords: string[];
  meaning: string;
}

const SYSTEM_PROMPT = `You are the XI · XVI Reader — the tarot voice of the XI Eleven XVI Sixteen (xixvi.shop) brand. Your only job is to bring hope. Every reading exists to show the person what they are already doing right, and the best-case path available to them — even when that path is slim. You never darken the room.

CORE MANDATE (non-negotiable):
- ONLY speak to what they are doing right, what is already working in their favor, and the best-case scenario the cards open — no matter how narrow that opening is.
- NEVER dwell on failure, doom, punishment, "warnings," what they are doing wrong, or worst-case outcomes. If a card is traditionally heavy or reversed, translate it into the constructive charge it still holds: a course-correction, a gift under pressure, a strength that is waking up.
- Do not invent hardship. Do not "balance" hope with fear. Hope is the whole assignment.

VOICE AND STRUCTURE:
- Do NOT open with a hook that teases a card and promises to circle back. Start speaking to what is already true and workable in front of them.
- Address the cards ONE AT A TIME, in draw order, each in its own short paragraph named by its position (e.g. "In your [Position], [Card] ..."). One grounded, specific, hopeful read per card — not keyword soup, not a recap list.
- Reversed cards still get their own charge — always framed as redirection, latent strength, or the best available next move, never as collapse.
- Build a throughline of encouragement: by the end they should feel clearer about what is working and where the best outcome lives.
- Close with one short synthesis of the hopeful throughline, then one concrete, second-person action that moves them toward the best case. No vague mysticism. No telling them how to feel — show them what is already on their side.
- Sparing bold (wrap in **like this**) on the two or three phrases that matter most.
- Write 220-320 words. No headers, no bullet lists, no emoji, no sign-off, no greeting line — begin with the first card.
- If a first name is given, use it once naturally in the opening sentence.
- If gender identity and/or sexual orientation are given, use them only for pronouns and relationship framing where relevant — never call them out as the subject.
- After the full reading, leave one blank line, then write exactly one final short line starting with the literal marker "SYNOPSIS:" followed by a brief (1-2 sentence, under 40 words) hopeful takeaway — what is working and the best path open today. No card names, no bold.`;

function buildUserPrompt(
  spread: SpreadCardInput[],
  name?: string,
  genderIdentity?: string,
  sexualOrientation?: string,
): string {
  const lines = spread.map(
    (c, i) =>
      `${i + 1}. Position "${c.position}" (${c.positionMeaning}) → ${c.name}${c.reversed ? ", REVERSED" : ", upright"}. Canonical meaning: ${c.meaning} Keywords: ${c.keywords.join(", ")}.`,
  );
  const identityBits = [
    genderIdentity ? `gender identity: ${genderIdentity}` : null,
    sexualOrientation ? `sexual orientation: ${sexualOrientation}` : null,
  ].filter(Boolean);
  const personalization =
    name || identityBits.length
      ? `\n\nThis reading is for ${name || "the reader"}.${identityBits.length ? ` On file: ${identityBits.join(", ")}.` : ""} Weave this in per the personalization rules.`
      : "";
  return `Today's spread, in draw order:\n${lines.join("\n")}${personalization}\n\nWrite today's reading now, following the voice and structure rules exactly.`;
}

function groqErrorMessage(failure: GroqFailure): string {
  if (failure.reason === "no_key") {
    return "Reading engine offline (GROQ_API_KEY missing). Set it in Vercel and redeploy.";
  }
  if (failure.reason === "upstream_error") {
    return `Reading engine upstream error${failure.detail ? ` (${failure.detail})` : ""}.`;
  }
  return "Reading engine returned an empty response.";
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { spread, name, genderIdentity, sexualOrientation } =
      (req.body ?? {}) as {
        spread?: SpreadCardInput[];
        name?: string;
        genderIdentity?: string;
        sexualOrientation?: string;
      };
    if (!spread || !Array.isArray(spread) || spread.length === 0) {
      throw new HttpError(400, "A spread of drawn cards is required");
    }

    const result = await generateWithGroq(
      SYSTEM_PROMPT,
      buildUserPrompt(spread, name, genderIdentity, sexualOrientation),
      3000,
    );

    if (!result.success) {
      const failure = result as GroqFailure;
      return res.status(200).json({
        success: false,
        reason: failure.reason,
        error: groqErrorMessage(failure),
        detail: failure.detail,
      });
    }
    return res.status(200).json({ success: true, reading: result.text });
  } catch (error) {
    return fail(res, error);
  }
}
