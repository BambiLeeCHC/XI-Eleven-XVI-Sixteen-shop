/**
 * Shared Groq text-generation call, used by every AI reading endpoint
 * (free daily reading, deep paid reading, pay-per-question follow-up,
 * numerology, natal profile, brand concierge).
 *
 * Replaces the previous Gemini free-tier integration, which was hard-capped
 * at 20 requests/day/model shared across every AI feature on the site and
 * was the recurring cause of "AI feature is broken" reports. Groq's paid
 * key has no such shared daily cap.
 */
export type GroqFailure = {
  success: false;
  reason: "no_key" | "upstream_error" | "empty";
};

export type GroqResult = { success: true; text: string } | GroqFailure;

const GROQ_MODEL = "llama-3.3-70b-versatile";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

async function callGroq(messages: ChatMessage[], maxTokens: number): Promise<GroqResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { success: false, reason: "no_key" };

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.95,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    console.error("Groq call failed", response.status, await response.text().catch(() => ""));
    return { success: false, reason: "upstream_error" };
  }

  const json = await response.json();
  const text = json?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) {
    return { success: false, reason: "empty" };
  }
  return { success: true, text: text.trim() };
}

/** Single system+user prompt call — the shape every reading endpoint uses. */
export async function generateWithGroq(
  systemPrompt: string,
  userPrompt: string,
  maxOutputTokens: number,
): Promise<GroqResult> {
  return callGroq(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    maxOutputTokens,
  );
}

/** Multi-turn variant for the brand concierge chat widget, which carries
 * conversation history rather than a single user prompt. */
export async function generateWithGroqChat(
  systemPrompt: string,
  history: ChatMessage[],
  maxOutputTokens: number,
): Promise<GroqResult> {
  return callGroq([{ role: "system", content: systemPrompt }, ...history], maxOutputTokens);
}
