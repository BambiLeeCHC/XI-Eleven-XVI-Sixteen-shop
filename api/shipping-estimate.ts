/**
 * Live Printful shipping rates for the cart, plus the production time that
 * Printful's own estimate leaves out (2–5 business days for all-over print).
 */

import {
  type ApiRequest,
  type ApiResponse,
  fail,
  HttpError,
  printfulRequest,
  supabaseAdmin,
} from "./_lib/server";
import { matchVariant, type PrintfulVariant } from "./_lib/variantMatch";

const FULFILLMENT_MIN = 2;
const FULFILLMENT_MAX = 5;

type Rate = {
  id: string;
  name: string;
  rate: string;
  currency?: string;
  minDeliveryDays?: number;
  maxDeliveryDays?: number;
  min_delivery_days?: number;
  max_delivery_days?: number;
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { address, items } = (req.body ?? {}) as {
      address?: {
        address1: string;
        city: string;
        stateCode: string;
        countryCode: string;
        zip: string;
      };
      items?: Array<{
        productId: string;
        size: string;
        color?: string | null;
        quantity: number;
      }>;
    };

    if (!address?.countryCode || !Array.isArray(items) || items.length === 0) {
      throw new HttpError(400, "Invalid shipping request");
    }

    const admin = supabaseAdmin();
    const ids = [...new Set(items.map(item => String(item.productId)))];
    const { data: products, error } = await admin
      .from("products")
      .select("id, name, price, images, printful_variants")
      .in("id", ids);
    if (error) throw error;

    const byId = new Map((products ?? []).map(p => [p.id, p]));
    const resolvedItems = [];
    const printfulItems: Array<{ variant_id: number; quantity: number }> = [];

    for (const item of items) {
      const product = byId.get(String(item.productId));
      if (!product) continue;
      const match = matchVariant(
        product.printful_variants as PrintfulVariant[] | null,
        item.size,
        item.color,
      );
      resolvedItems.push({
        productId: product.id,
        productName: product.name,
        size: item.size,
        color: item.color ?? null,
        quantity: item.quantity,
        price: product.price,
        image: product.images?.[0] ?? null,
        syncVariantId: match ? Math.round(match.id) : null,
        catalogVariantId: match ? Math.round(match.variant_id) : null,
      });
      // /shipping/rates needs the catalog variant id, not the sync variant id.
      if (match?.variant_id) {
        printfulItems.push({
          variant_id: Math.round(match.variant_id),
          quantity: item.quantity,
        });
      }
    }

    if (printfulItems.length === 0) {
      return res.status(200).json({
        success: false,
        error: "Could not resolve Printful variants for your cart items.",
      });
    }

    const apiResult = await printfulRequest<{ result: Rate[] }>(
      "/shipping/rates",
      {
        method: "POST",
        body: {
          recipient: {
            address1: address.address1,
            city: address.city,
            state_code: address.stateCode,
            country_code: address.countryCode,
            zip: address.zip,
          },
          items: printfulItems,
        },
      },
    );

    const normalized = (apiResult.result ?? []).map(rate => {
      const minTransit = rate.minDeliveryDays ?? rate.min_delivery_days ?? null;
      const maxTransit = rate.maxDeliveryDays ?? rate.max_delivery_days ?? null;
      const isStandard =
        rate.id === "STANDARD" ||
        rate.name.toLowerCase().includes("standard") ||
        rate.name.toLowerCase().includes("flat");
      const originalRateCents = Math.round(Number.parseFloat(rate.rate) * 100);

      return {
        id: rate.id,
        name: isStandard ? `${rate.name} — FREE` : rate.name,
        rate: isStandard ? "0.00" : rate.rate,
        rateInCents: isStandard ? 0 : originalRateCents,
        originalRateCents,
        isFreeShipping: isStandard,
        speedLabel: isStandard ? "FREE" : "EXPEDITED",
        currency: rate.currency || "USD",
        transitMinDays: minTransit,
        transitMaxDays: maxTransit,
        fulfillmentMinDays: FULFILLMENT_MIN,
        fulfillmentMaxDays: FULFILLMENT_MAX,
        totalMinDays: minTransit !== null ? FULFILLMENT_MIN + minTransit : null,
        totalMaxDays: maxTransit !== null ? FULFILLMENT_MAX + maxTransit : null,
      };
    });

    // Printful returns several names for effectively identical services.
    const unique = new Map<string, (typeof normalized)[number]>();
    for (const rate of normalized) {
      const key = `${rate.rateInCents}:${rate.totalMinDays}:${rate.totalMaxDays}`;
      if (!unique.has(key)) unique.set(key, rate);
    }

    const rates = [...unique.values()]
      .sort(
        (a, b) =>
          a.rateInCents - b.rateInCents ||
          (a.totalMaxDays ?? 999) - (b.totalMaxDays ?? 999),
      )
      .map((rate, i, all) => ({
        ...rate,
        speedLabel: rate.isFreeShipping
          ? "FREE STANDARD"
          : i === all.length - 1 && all.length > 2
            ? "FASTEST"
            : "FASTER",
      }));

    return res.status(200).json({ success: true, rates, resolvedItems });
  } catch (error) {
    return fail(res, error);
  }
}
