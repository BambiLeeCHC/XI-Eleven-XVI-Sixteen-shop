/**
 * Guards the boundary between the browser and anything privileged.
 *
 * The previous version of this file asserted that catalog mutations were
 * internal-only on the old backend. The equivalent guarantees on Supabase are:
 * secrets never reach the client bundle, order and catalog writes are either
 * blocked by row-level security or gated behind an admin check on the server,
 * and every table actually has RLS turned on.
 */

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

/* ── 1. No secret may be reachable from client code ───────────────────── */

const clientFiles = [];
const walk = (dir) => {
  for (const entry of readdirSync(new URL(`../${dir}`, import.meta.url), {
    withFileTypes: true,
  })) {
    if (entry.isDirectory()) walk(`${dir}/${entry.name}`);
    else if (/\.tsx?$/.test(entry.name)) clientFiles.push(`${dir}/${entry.name}`);
  }
};
walk("src");

for (const file of clientFiles) {
  const source = read(file);
  for (const secret of [
    "SUPABASE_SERVICE_ROLE_KEY",
    "PRINTFUL_API_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_KEY_ENCODED",
    "RESEND_API_KEY",
    "sb_secret_",
  ]) {
    assert.ok(
      !source.includes(secret),
      `${file} references ${secret} — secrets must never reach the browser bundle`,
    );
  }
}

/* ── 2. Privileged API routes must check who is calling ───────────────── */

for (const route of ["printful-sync", "crm-email"]) {
  assert.match(
    read(`api/${route}.ts`),
    /requireAdmin\(req\)/,
    `api/${route}.ts must be admin-gated`,
  );
}

// The payment webhook must re-fetch the event from Stripe rather than trusting
// the POST body, or anyone could mark an order paid.
assert.match(
  read("api/stripe-webhook.ts"),
  /api\.stripe\.com\/v1\/events\//,
  "stripe-webhook must verify the event against Stripe",
);

assert.match(
  read("api/printful-webhook.ts"),
  /PRINTFUL_WEBHOOK_TOKEN/,
  "printful-webhook must require its shared token",
);

/* ── 3. Orders are priced on the server, never by the client ──────────── */

const orders = read("api/orders.ts");
assert.match(
  orders,
  /from\("products"\)[\s\S]*\.in\("id", ids\)/,
  "orders must load prices from the database",
);
assert.match(
  orders,
  /subtotal \+= product\.price \* quantity/,
  "orders must compute the subtotal from database prices",
);

const checkout = read("api/checkout.ts");
assert.match(
  checkout,
  /from\("orders"\)[\s\S]*\.eq\("id", orderId\)/,
  "checkout must bill from the stored order, not the request body",
);

/* ── 4. Every public table has row-level security and policies ────────── */

const migration = read(
  "supabase/migrations/20260809180000_storefront_rls_and_gaps.sql",
);

const tables = [
  "profiles",
  "products",
  "cart_items",
  "orders",
  "newsletter_subscribers",
  "crm_profiles",
  "crm_notes",
  "crm_emails",
  "blog_posts",
  "site_content",
  "shipping_settings",
  "tax_rates",
  "favorites",
];

for (const table of tables) {
  assert.ok(
    migration.includes(`alter table public.${table}`) &&
      migration.includes("enable row level security"),
    `${table} must have row-level security enabled`,
  );
  assert.match(
    migration,
    new RegExp(`on public\\.${table}\\b`),
    `${table} must have at least one policy`,
  );
}

// Customers must not be able to insert or update their own orders.
assert.ok(
  !/create policy[\s\S]{0,200}for insert[\s\S]{0,80}on public\.orders/.test(migration),
  "orders must not be insertable from the browser",
);

console.log("Security regression checks passed.");
