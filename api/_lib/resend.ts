/**
 * Shared Resend email-sending helper.
 *
 * Used by the admin CRM support-email feature and by the Long Read keepsake
 * email. Failures here are logged and swallowed by callers where email is a
 * nice-to-have (the reading itself is always saved to the account first).
 */

export const SUPPORT_FROM = "XI · XVI Support <support@xixvi.shop>";

export const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    character =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );

export type SendEmailResult =
  | { success: true; providerId: string }
  | { success: false; error: string };

export async function sendResendEmail(params: {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { success: false, error: "RESEND_API_KEY is missing" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: params.from,
        reply_to: params.replyTo ?? "support@xixvi.shop",
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    const result = (await response.json().catch(() => ({}))) as any;
    if (!response.ok) {
      return {
        success: false,
        error: result?.message ?? `Resend responded with ${response.status}`,
      };
    }
    return { success: true, providerId: result?.id ?? "" };
  } catch (error: any) {
    return { success: false, error: error?.message ?? "Unknown email error" };
  }
}

/** Turn a Long Read's markdown-ish **bold** text into simple HTML paragraphs. */
export function readingTextToHtml(text: string): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean);
  return paragraphs
    .map(p => {
      const withBold = escapeHtml(p).replace(
        /\*\*(.+?)\*\*/g,
        "<strong>$1</strong>",
      );
      return `<p style="margin:0 0 18px">${withBold}</p>`;
    })
    .join("\n");
}

export function buildKeepsakeEmailHtml(params: {
  name: string;
  readingHtml: string;
}): string {
  return `<div style="font-family:Georgia,'Times New Roman',serif;max-width:600px;margin:auto;color:#171717;line-height:1.7;padding:8px">
<div style="font-size:12px;letter-spacing:.18em;color:#9a7b2f;margin-bottom:8px;font-family:Arial,sans-serif">XI · XVI — THE LONG READ</div>
<h1 style="font-size:20px;font-weight:400;margin:0 0 24px;color:#171717">A reading for ${escapeHtml(params.name)}</h1>
${params.readingHtml}
<hr style="border:0;border-top:1px solid #eee;margin:32px 0">
<p style="font-size:12px;color:#777;font-family:Arial,sans-serif">This reading is also saved to your account at xixvi.shop.</p>
</div>`;
}
