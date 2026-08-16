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
import { escapeHtml, sendResendEmail, SUPPORT_FROM } from "./_lib/resend.js";

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

    if (!process.env.RESEND_API_KEY) {
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
        sender: SUPPORT_FROM,
        subject,
        body,
        status,
        provider_id: providerId ?? null,
        error: error ?? null,
      });
    };

    const html = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#171717;line-height:1.6"><div style="font-size:12px;letter-spacing:.18em;color:#9a7b2f;margin-bottom:24px">XI · XVI SUPPORT</div><div>${escapeHtml(
      body,
    ).replace(
      /\n/g,
      "<br>",
    )}</div><hr style="border:0;border-top:1px solid #eee;margin:32px 0"><p style="font-size:12px;color:#777">Reply directly to this email to reach support@xixvi.shop.</p></div>`;

    const result = await sendResendEmail({
      from: SUPPORT_FROM,
      to,
      subject,
      html,
      text: body,
    });

    if (!result.success) {
      await log("failed", undefined, result.error);
      throw new HttpError(502, `Email failed to send: ${result.error}`);
    }

    await log("sent", result.providerId);
    return res.status(200).json({ success: true, id: result.providerId });
  } catch (error) {
    return fail(res, error);
  }
}
