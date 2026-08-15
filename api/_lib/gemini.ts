/**
 * Shared Gemini text-generation call, used by every AI reading endpoint
 * (free daily reading, deep paid reading, pay-per-question follow-up).
 *
 * Gemini's "thinking" tokens are billed against maxOutputTokens before any
 * visible text is produced, so callers must pass a generous headroom above
 * their target output length or the response gets cut off mid-sentence.
 */
export type GeminiResult =
  | { success: true; text: string }
  | { success: false; reason: "no_key" | "upstream_error" | "empty" };

export async function generateWithGemini(
  systemPrompt: string,
  userPrompt: string,
  maxOutputTokens: number,
): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { success: false, reason: "no_key" };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.95, maxOutputTokens },
      }),
    },
  );

  if (!response.ok) {
    console.error(
      "Gemini call failed",
      response.status,
      await response.text().catch(() => ""),
    );
    return { success: false, reason: "upstream_error" };
  }

  const json = await response.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string" || !text.trim()) {
    return { success: false, reason: "empty" };
  }
  return { success: true, text: text.trim() };
}
