import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";

const http = httpRouter();
auth.addHttpRoutes(http);

// ─── Stripe Webhook — payment confirmation + auto-fulfillment ──────────

http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const rawBody = await request.text();
      const signature = request.headers.get("stripe-signature");
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!signature || !webhookSecret) {
        return new Response("Webhook authentication is not configured", { status: 401 });
      }
      const verified = await verifyStripeSignature(rawBody, signature, webhookSecret);
      if (!verified) return new Response("Invalid signature", { status: 401 });
      const body = JSON.parse(rawBody);
      const eventType = body?.type;

      if (eventType === "checkout.session.completed") {
        const session = body.data?.object;
        if (!session?.id) {
          return new Response("Missing session ID", { status: 400 });
        }

        // Find the order by Stripe checkout session ID
        const order: any = await ctx.runQuery(
          // @ts-ignore
          "orders:getByStripeSession" as any,
          { stripeCheckoutSessionId: session.id }
        );

        if (order) {
          // Update order status to paid
          await ctx.runMutation(
            // @ts-ignore
            "orders:updateStatus" as any,
            {
              orderId: order._id,
              status: "paid",
              stripePaymentIntentId: session.payment_intent || undefined,
              fulfillmentStage: "payment_received",
            }
          );

          // Auto-trigger Printful fulfillment
          try {
            await ctx.runAction(
              // @ts-ignore
              "orders:fulfillWithPrintful" as any,
              { orderId: order._id }
            );
          } catch (e) {
            console.error("Auto-fulfillment failed:", e);
            // Non-fatal — order is still marked as paid
          }
        }
      }

      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Stripe webhook error:", error);
      return new Response("Webhook processing error", { status: 500 });
    }
  }),
});

// Image proxy — serves Convex storage images with Google-friendly headers
http.route({
  path: "/img",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const storageId = url.searchParams.get("id");
    if (!storageId) {
      return new Response("Missing id parameter", { status: 400 });
    }

    // Get the storage URL from Convex
    const storageUrl = await ctx.storage.getUrl(storageId as any);
    if (!storageUrl) {
      return new Response("Image not found", { status: 404 });
    }

    // Fetch the actual image bytes
    const imgResponse = await fetch(storageUrl);
    if (!imgResponse.ok) {
      return new Response("Failed to fetch image", { status: 502 });
    }

    const contentType = imgResponse.headers.get("content-type") || "image/png";
    const body = await imgResponse.arrayBuffer();

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

// Dynamic sitemap.xml — includes all active product URLs
http.route({
  path: "/sitemap.xml",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const SITE = "https://xixvi.shop";
    const today = new Date().toISOString().split("T")[0];

    // Static pages
    const staticPages = [
      { loc: "/", priority: "1.0", changefreq: "weekly" },
      { loc: "/shop", priority: "0.9", changefreq: "weekly" },
      { loc: "/shop?gender=women", priority: "0.9", changefreq: "weekly" },
      { loc: "/shop?gender=men", priority: "0.9", changefreq: "weekly" },
      { loc: "/size-guide", priority: "0.5", changefreq: "monthly" },
      { loc: "/privacy", priority: "0.2", changefreq: "yearly" },
      { loc: "/terms", priority: "0.2", changefreq: "yearly" },
      { loc: "/shipping-policy", priority: "0.3", changefreq: "yearly" },
      { loc: "/returns", priority: "0.3", changefreq: "yearly" },
    ];

    // Get all active products
    const products = await ctx.runQuery("products:list" as any, {});

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const page of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${SITE}${page.loc}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    for (const product of products as Array<{ _id: string }>) {
      xml += `  <url>\n`;
      xml += `    <loc>${SITE}/product/${product._id}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }),
});

export default http;

async function verifyStripeSignature(body: string, header: string, secret: string) {
  const parts = Object.fromEntries(header.split(",").map((part) => part.split("=")));
  const timestamp = parts.t;
  const expected = parts.v1;
  if (!timestamp || !expected || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${body}`),
  );
  const actual = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  if (actual.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < actual.length; i++) mismatch |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  return mismatch === 0;
}
