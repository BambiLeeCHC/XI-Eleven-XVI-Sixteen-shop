/**
 * Send a support email to a customer from the admin CRM, and log it.
 */

import {
  type ApiRequest,
  type ApiResponse,
  fail,
  HttpError,
  requireAdmin,
  supabaseAdmin,
} from "./_lib/server.js";

const FROM = "XI · XVI Support <support@xixvi.shop>";

const escapeHtml = (value: string) =>
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

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const admin = await requireAdmin(req);
    const { customerId, to, subject, body } = (req.body ?? {}) as Record<
      string,
      string
    >;
    if (!customerId || !to || !subject || !body) {
      throw new HttpError(400, "Missing email fields");
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new HttpError(
        503,
        "CRM email is not connected yet: RESEND_API_KEY is missing.",
      );
    }

    const db = supabaseAdmin();
    const log = async (status: string, providerId?: string, error?: string) => {
      await db.from("crm_emails").insert({
        customer_id: customerId,
        admin_id: admin.id,
        recipient: to,
        sender: FROM,
        subject,
        body,
        status,
        provider_id: providerId ?? null,
        error: error ?? null,
      });
    };

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        reply_to: "support@xixvi.shop",
        to: [to],
        subject,
        html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#171717;line-height:1.6"><div style="font-size:12px;letter-spacing:.18em;color:#9a7b2f;margin-bottom:24px">XI · XVI SUPPORT</div><div>${escapeHtml(
          body,
        ).replace(
          /\n/g,
          "<br>",
        )}</div><hr style="border:0;border-top:1px solid #eee;margin:32px 0"><p style="font-size:12px;color:#777">Reply directly to this email to reach support@xixvi.shop.</p></div>`,
        text: body,
      }),
    });

    const result = (await response.json().catch(() => ({}))) as any;
    if (!response.ok) {
      const message =
        result?.message || `Email provider returned ${response.status}`;
      await log("failed", undefined, message);
      throw new HttpError(502, message);
    }

    await log("sent", result.id);
    return res.status(200).json({ success: true, id: result.id });
  } catch (error) {
    return fail(res, error);
  }
}
