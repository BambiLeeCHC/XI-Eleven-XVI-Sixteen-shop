#!/usr/bin/env node
/**
 * Convex was removed from xixvi.shop (Vite + Supabase + Vercel api/).
 *
 * Vercel project settings may still Override the build command to:
 *   npx convex deploy --cmd 'npm run build'
 * That fails with "The route directory convex doesn't exist".
 *
 * This package is installed as the `convex` binary so that leftover command
 * just runs the Vite build and exits 0.
 */
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const cmdIdx = args.indexOf("--cmd");
const cmdFromFlag = cmdIdx >= 0 ? args[cmdIdx + 1] : null;
const sub = args[0];

if (sub === "deploy" || cmdFromFlag) {
  const cmd = cmdFromFlag && cmdFromFlag.trim() ? cmdFromFlag : "npm run build";
  console.log(`[xixvi] Convex is not used. Running: ${cmd}`);
  const result = spawnSync(cmd, { stdio: "inherit", shell: true, env: process.env });
  process.exit(result.status ?? 1);
}

console.log("[xixvi] Convex CLI is a no-op. Stack is Vite + Supabase.");
process.exit(0);
