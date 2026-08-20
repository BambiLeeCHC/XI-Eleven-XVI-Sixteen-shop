/**
 * Shared Groq text-generation call, used by every AI reading endpoint
 * (free daily reading, deep paid reading, pay-per-question follow-up,
 * numerology, natal profile, brand concierge).
 *
 * Requires GROQ_API_KEY on the Vercel project (Production + Preview).
 * Without it every reading returns { success: false, reason: "no_key" }.
 */
export type GroqFailure = {
  success: false;
  reason: "no_key" | "upstream_error" | "empty";
  detail?: string;
};

export type GroqResult = { success: true; text: string } | GroqFailure;

/** Primary + fallback — if Groq retires a model id, the second still works. */
const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-70b-versatile",
  "llama-3.1-8b-instant",
] as const;

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

async function callGroqOnce(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  maxTokens: number,
): Promise<GroqResult> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.95,
      max_tokens: maxTokens,
    }),
  });

  const bodyText = await response.text().catch(() => "");
  if (!response.ok) {
    console.error("Groq call failed", model, response.status, bodyText.slice(0, 500));
    return {
      success: false,
      reason: "upstream_error",
      detail: `HTTP ${response.status}${bodyText ? `: ${bodyText.slice(0, 200)}` : ""}`,
    };
  }

  let json: any;
  try {
    json = JSON.parse(bodyText);
  } catch {
    return { success: false, reason: "empty", detail: "Invalid JSON from Groq" };
  }

  const text = json?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) {
    return { success: false, reason: "empty", detail: "Empty completion" };
  }
  return { success: true, text: text.trim() };
}

async function callGroq(messages: ChatMessage[], maxTokens: number): Promise<GroqResult> {
  const apiKey = (process.env.GROQ_API_KEY || "").trim();
  if (!apiKey) {
    console.error(
      "GROQ_API_KEY is missing — set it in Vercel → Project → Settings → Environment Variables (Production + Preview), then redeploy.",
    );
    return {
      success: false,
      reason: "no_key",
      detail: "GROQ_API_KEY is not configured on the server",
    };
  }

  let lastFailure: GroqResult = {
    success: false,
    reason: "upstream_error",
    detail: "No models attempted",
  };

  for (const model of GROQ_MODELS) {
    const result = await callGroqOnce(apiKey, model, messages, maxTokens);
    if (result.success) return result;
    lastFailure = result;
    // Only fall through to the next model on upstream/model errors, not empty.
    if (result.reason === "empty") return result;
  }

  return lastFailure;
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

/** Multi-turn variant for the brand concierge chat widget. */
export async function generateWithGroqChat(
  systemPrompt: string,
  history: ChatMessage[],
  maxOutputTokens: number,
): Promise<GroqResult> {
  return callGroq([{ role: "system", content: systemPrompt }, ...history], maxOutputTokens);
}
