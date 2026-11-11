import {
  addressHash,
  type LimitLine,
  normalizeAddress,
  normalizeEmail,
  ORDER_LIMITS,
  windowLimitHit,
} from "../../src/lib/orderLimits.js";
import type { SupabaseClient } from "@supabase/supabase-js";

type WatchOrder = {
  id?: string;
  email?: string | null;
  user_id?: string | null;
  session_id?: string | null;
  items?: LimitLine[] | null;
  shipping_address?: Record<string, unknown> | null;
  status?: string | null;
};

function linesOf(items: LimitLine[] | null | undefined): LimitLine[] {
  return (items ?? []).map(item => ({
    productId: String(item.productId ?? ""),
    productName: item.productName,
    color: item.color,
    size: item.size,
    quantity: Number(item.quantity) || 0,
  }));
}

export async function reviewRecentOrders(
  admin: SupabaseClient<any, "public", any>,
  order: WatchOrder,
) {
  const since = new Date(
    Date.now() - ORDER_LIMITS.lookbackDays * 24 * 60 * 60 * 1000,
  ).toISOString();
  const email = normalizeEmail(order.email);
  const address = normalizeAddress(order.shipping_address);
  const hash = address ? addressHash(address) : "";

  const { data, error } = await admin
    .from("orders")
    .select("id, email, user_id, session_id, items, shipping_address, status, created_at")
    .gte("created_at", since)
    .neq("status", "cancelled");
  if (error) throw error;

  const related = ((data ?? []) as WatchOrder[]).filter(row => {
    if (order.id && row.id === order.id) return false;
    if (email && normalizeEmail(row.email) === email) return true;
    if (order.user_id && row.user_id && row.user_id === order.user_id) return true;
    if (address && normalizeAddress(row.shipping_address) === address) return true;
    return false;
  });

  const hit = windowLimitHit([
    ...related.flatMap(row => linesOf(row.items)),
    ...linesOf(order.items),
  ]);

  return { hit, hash, email, relatedIds: related.map(row => row.id).filter(Boolean) };
}

export async function recordOrderFlag(
  admin: SupabaseClient<any, "public", any>,
  input: {
    orderId?: string | null;
    sessionId?: string | null;
    email?: string | null;
    userId?: string | null;
    addressHash?: string;
    reason: string;
    details?: Record<string, unknown>;
  },
) {
  const { error } = await admin.from("order_flags").insert({
    order_id: input.orderId ?? null,
    session_id: input.sessionId ?? null,
    address_hash: input.addressHash ?? null,
    email: normalizeEmail(input.email) || null,
    user_id: input.userId ?? null,
    reason: input.reason,
    details: input.details ?? {},
  });
  if (error) console.error("order flag", error.message);
}
