/**
 * Live Printful availability for the dial.
 *
 * One store-product read covers every size of a colourway. Results stay in
 * memory for two minutes. A missing key or a failed read returns a fallback
 * payload so the shop can use the availability stored on each variant.
 */

import { printfulRequest, supabaseAdmin } from "./server.js";

const TTL_MS = 120_000;

export type StockEntry = {
  inStock: boolean;
  status: string;
};

export type StockResponse = {
  ok: boolean;
  source: "printful" | "fallback";
  reason?: string;
  cached?: boolean;
  variants: Record<string, StockEntry>;
};

type SyncVariant = {
  id?: number | string;
  availability_status?: string | null;
};

type StoreProduct = {
  result?: {
    sync_variants?: SyncVariant[];
  };
};

let cache: { at: number; body: StockResponse } | null = null;

function storeProductId(value: unknown): string | null {
  const match = String(value ?? "").match(/^(\d+)/);
  return match?.[1] ?? null;
}

function inStock(status: string): boolean {
  const normalized = status.toLowerCase().replace(/[\s-]+/g, "_");
  return (
    normalized === "active" ||
    normalized === "in_stock" ||
    normalized === "available"
  );
}

async function eachLimited<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
) {
  let cursor = 0;
  const width = Math.min(limit, items.length);
  await Promise.all(
    Array.from({ length: width }, async () => {
      while (cursor < items.length) {
        const item = items[cursor];
        cursor += 1;
        await worker(item);
      }
    }),
  );
}

export async function loadPrintfulStock(): Promise<StockResponse> {
  if (!process.env.PRINTFUL_API_KEY) {
    return {
      ok: false,
      source: "fallback",
      reason: "missing_key",
      variants: {},
    };
  }
  if (cache && Date.now() - cache.at < TTL_MS) {
    return { ...cache.body, cached: true };
  }

  try {
    const admin = supabaseAdmin();
    const { data, error } = await admin
      .from("products")
      .select("printful_product_id")
      .eq("is_active", true);
    if (error) throw error;

    const ids = [
      ...new Set(
        (data ?? [])
          .map(row => storeProductId(row.printful_product_id))
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const variants: Record<string, StockEntry> = {};

    await eachLimited(ids, 6, async id => {
      try {
        const detail = await printfulRequest<StoreProduct>(
          `/store/products/${id}`,
        );
        for (const variant of detail.result?.sync_variants ?? []) {
          const status = String(variant.availability_status ?? "").trim();
          if (!variant.id || !status) continue;
          variants[String(variant.id)] = { status, inStock: inStock(status) };
        }
      } catch (error) {
        console.error("printful stock", id, error);
      }
    });

    if (Object.keys(variants).length === 0) {
      return {
        ok: false,
        source: "fallback",
        reason: "empty",
        variants: {},
      };
    }

    const body: StockResponse = {
      ok: true,
      source: "printful",
      cached: false,
      variants,
    };
    cache = { at: Date.now(), body };
    return body;
  } catch (error) {
    console.error("printful stock", error);
    return {
      ok: false,
      source: "fallback",
      reason: "request_failed",
      variants: {},
    };
  }
}
