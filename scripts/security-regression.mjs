import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const products = readFileSync(new URL("../convex/products.ts", import.meta.url), "utf8");

function exportedFunction(name) {
  const start = products.indexOf(`export const ${name} = `);
  assert.notEqual(start, -1, `${name} must exist`);
  const next = products.indexOf("\nexport const ", start + 1);
  return products.slice(start, next === -1 ? products.length : next);
}

for (const name of [
  "upsertFromPrintful",
  "createManual",
  "remapPrintfulIds",
  "updateImages",
  "updateProduct",
  "remove",
]) {
  assert.match(
    exportedFunction(name),
    /internalMutation\(/,
    `${name} must not be callable from an untrusted client`,
  );
}

assert.match(
  exportedFunction("syncFromPrintful"),
  /internalAction\(/,
  "Printful sync must not be callable from an untrusted client",
);

console.log("Catalog authorization regression checks passed.");
