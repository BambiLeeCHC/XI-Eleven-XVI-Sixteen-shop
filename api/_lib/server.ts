/**
 * Shared server-side helpers for the Vercel API routes.
 *
 * These routes are the only place the storefront is allowed to write orders,
 * talk to Stripe or talk to Printful. Row-level security blocks the browser
 * from touching `orders` at all, so a customer can never invent an order,
 * change a price, or mark their own order paid.
 */

import { createClient } from "@supabase/supabase-js";

export type ApiRequest = {
  method?: string;
  body: any;
  query?: Record<string, string | string[]>;
  headers?: Record<string, string | string[] | undefined>;
};

export type ApiResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): ApiResponse;
  json(body: unknown): void;
  send(body: string): void;
};

/* ── Supabase (service role) ──────────────────────────────────────────── */

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function supabaseAdmin() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error(
      "Supabase is not configured on the server (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
    );
  }
  return createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Resolve the caller from their bearer token, or null when unauthenticated. */
export async function currentUser(req: ApiRequest) {
  const raw = req.headers?.authorization ?? req.headers?.Authorization;
  const header = Array.isArray(raw) ? raw[0] : raw;
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7);
  const admin = supabaseAdmin();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return null;
  const { data: profile } = await admin
    .from("profiles")
    .select("id, email, name, role")
    .eq("id", data.user.id)
    .maybeSingle();
  return {
    id: data.user.id,
    email: data.user.email ?? profile?.email ?? "",
    name: profile?.name ?? null,
    role: profile?.role ?? "customer",
  };
}

export async function requireAdmin(req: ApiRequest) {
  const user = await currentUser(req);
  if (!user) throw new HttpError(401, "Not authenticated");
  if (user.role !== "admin") throw new HttpError(403, "Not authorized");
  return user;
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function fail(res: ApiResponse, error: unknown) {
  const status = error instanceof HttpError ? error.status : 500;
  const message =
    error instanceof HttpError
      ? error.message
      : "Something went wrong. Please try again.";
  if (!(error instanceof HttpError)) console.error("API error", error);
  return res.status(status).json({ success: false, error: message });
}

/* ── Stripe ───────────────────────────────────────────────────────────── */

/**
 * The Stripe secret has been stored under five different env var names across
 * this project's history, and the plain `STRIPE_SECRET_KEY` is currently empty
 * on Vercel — which is why the payment webhook silently stopped working. Resolve
 * every known name so one missing variable can't break fulfillment again.
 */
export function stripeSecret(): string {
  const encoded =
    process.env.STRIPE_KEY_ENCODED_V2 ||
    process.env.STRIPE_KEY_ENCODED ||
    process.env.STRIPE_KEY_B64;
  const raw = encoded
    ? Buffer.from(encoded, "base64").toString("utf8")
    : process.env.STRIPE_API_KEY || process.env.STRIPE_SECRET_KEY || "";
  const key = raw
    .replace(/^['"]|['"]$/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
  if (!key) throw new HttpError(500, "Payment service is not configured");
  return key;
}

export async function stripePost(path: string, params: Record<string, string>) {
  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecret()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params).toString(),
  });
  const data = await response.json();
  if (!response.ok) {
    console.error("Stripe error", data?.error?.type, data?.error?.message);
    throw new HttpError(502, "Unable to reach the payment provider");
  }
  return data;
}

/* ── Printful ─────────────────────────────────────────────────────────── */

export function printfulKey(): string {
  const key = process.env.PRINTFUL_API_KEY || "";
  if (!key) throw new HttpError(500, "Fulfillment service is not configured");
  return key;
}

export async function printfulRequest<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const response = await fetch(`https://api.printful.com${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${printfulKey()}`,
      "Content-Type": "application/json",
      "X-PF-Store-Id": process.env.PRINTFUL_STORE_ID || "17855930",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (!response.ok) {
    throw new HttpError(
      502,
      `Printful ${response.status}: ${(await response.text()).slice(0, 300)}`,
    );
  }
  return (await response.json()) as T;
}

/* ── Order helpers ────────────────────────────────────────────────────── */

export function fulfillmentNote(stage: string): string {
  switch (stage) {
    case "awaiting_payment":
      return "Order placed — awaiting payment confirmation";
    case "payment_received":
      return "Payment confirmed";
    case "sent_to_printful":
      return "Order sent to production partner";
    case "printful_processing":
      return "Your piece is being crafted — made exclusively for you";
    case "printful_fulfilled":
      return "Production complete — preparing for shipment";
    case "shipped":
      return "On its way to you";
    case "delivered":
      return "Delivered — enjoy your one-of-a-kind piece";
    default:
      return stage;
  }
}

/** Apply an order update, keeping the fulfillment timeline append-only. */
export async function updateOrder(
  orderId: string,
  updates: Record<string, unknown>,
  stage?: { stage: string; note?: string },
) {
  const admin = supabaseAdmin();
  const { data: order, error } = await admin
    .from("orders")
    .select("id, fulfillment_stage, fulfillment_history")
    .eq("id", orderId)
    .maybeSingle();
  if (error) throw error;
  if (!order) throw new HttpError(404, "Order not found");

  const patch: Record<string, unknown> = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (stage && stage.stage !== order.fulfillment_stage) {
    const history = Array.isArray(order.fulfillment_history)
      ? order.fulfillment_history
      : [];
    patch.fulfillment_stage = stage.stage;
    patch.fulfillment_history = [
      ...history,
      {
        stage: stage.stage,
        timestamp: Date.now(),
        note: stage.note ?? fulfillmentNote(stage.stage),
      },
    ];
  }

  const { error: updateError } = await admin
    .from("orders")
    .update(patch)
    .eq("id", orderId);
  if (updateError) throw updateError;
}
