import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ─── Auth guard ─────────────────────────────────────────────────────────

async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (user?.role !== "admin") throw new Error("Not authorized");
  return user;
}

// ─── Default US state tax rates ─────────────────────────────────────────

export const US_STATE_TAX_RATES: Record<string, { label: string; rate: number }> = {
  AL: { label: "Alabama", rate: 0.04 },
  AK: { label: "Alaska", rate: 0 },
  AZ: { label: "Arizona", rate: 0.056 },
  AR: { label: "Arkansas", rate: 0.065 },
  CA: { label: "California", rate: 0.0725 },
  CO: { label: "Colorado", rate: 0.029 },
  CT: { label: "Connecticut", rate: 0.0635 },
  DE: { label: "Delaware", rate: 0 },
  DC: { label: "District of Columbia", rate: 0.06 },
  FL: { label: "Florida", rate: 0.06 },
  GA: { label: "Georgia", rate: 0.04 },
  HI: { label: "Hawaii", rate: 0.04 },
  ID: { label: "Idaho", rate: 0.06 },
  IL: { label: "Illinois", rate: 0.0625 },
  IN: { label: "Indiana", rate: 0.07 },
  IA: { label: "Iowa", rate: 0.06 },
  KS: { label: "Kansas", rate: 0.065 },
  KY: { label: "Kentucky", rate: 0.06 },
  LA: { label: "Louisiana", rate: 0.0445 },
  ME: { label: "Maine", rate: 0.055 },
  MD: { label: "Maryland", rate: 0.06 },
  MA: { label: "Massachusetts", rate: 0.0625 },
  MI: { label: "Michigan", rate: 0.06 },
  MN: { label: "Minnesota", rate: 0.06875 },
  MS: { label: "Mississippi", rate: 0.07 },
  MO: { label: "Missouri", rate: 0.04225 },
  MT: { label: "Montana", rate: 0 },
  NE: { label: "Nebraska", rate: 0.055 },
  NV: { label: "Nevada", rate: 0.0685 },
  NH: { label: "New Hampshire", rate: 0 },
  NJ: { label: "New Jersey", rate: 0.06625 },
  NM: { label: "New Mexico", rate: 0.05125 },
  NY: { label: "New York", rate: 0.04 },
  NC: { label: "North Carolina", rate: 0.0475 },
  ND: { label: "North Dakota", rate: 0.05 },
  OH: { label: "Ohio", rate: 0.0575 },
  OK: { label: "Oklahoma", rate: 0.045 },
  OR: { label: "Oregon", rate: 0 },
  PA: { label: "Pennsylvania", rate: 0.06 },
  RI: { label: "Rhode Island", rate: 0.07 },
  SC: { label: "South Carolina", rate: 0.06 },
  SD: { label: "South Dakota", rate: 0.042 },
  TN: { label: "Tennessee", rate: 0.07 },
  TX: { label: "Texas", rate: 0.0625 },
  UT: { label: "Utah", rate: 0.0485 },
  VT: { label: "Vermont", rate: 0.06 },
  VA: { label: "Virginia", rate: 0.043 },
  WA: { label: "Washington", rate: 0.065 },
  WV: { label: "West Virginia", rate: 0.06 },
  WI: { label: "Wisconsin", rate: 0.05 },
  WY: { label: "Wyoming", rate: 0.04 },
};

// ─── Default international VAT/GST rates ────────────────────────────────

export const COUNTRY_TAX_RATES: Record<string, { label: string; rate: number }> = {
  GB: { label: "United Kingdom (VAT)", rate: 0.20 },
  AU: { label: "Australia (GST)", rate: 0.10 },
  CA: { label: "Canada (GST)", rate: 0.05 },
  DE: { label: "Germany (VAT)", rate: 0.19 },
  FR: { label: "France (VAT)", rate: 0.20 },
  IT: { label: "Italy (VAT)", rate: 0.22 },
  ES: { label: "Spain (VAT)", rate: 0.21 },
  NL: { label: "Netherlands (VAT)", rate: 0.21 },
  SE: { label: "Sweden (VAT)", rate: 0.25 },
  JP: { label: "Japan (CT)", rate: 0.10 },
  KR: { label: "South Korea (VAT)", rate: 0.10 },
  NZ: { label: "New Zealand (GST)", rate: 0.15 },
  MX: { label: "Mexico (IVA)", rate: 0.16 },
  BR: { label: "Brazil (ICMS)", rate: 0.17 },
  IN: { label: "India (GST)", rate: 0.18 },
  SG: { label: "Singapore (GST)", rate: 0.09 },
};

// ─── Calculate tax for a given address ──────────────────────────────────

export const calculateTax = query({
  args: {
    countryCode: v.string(),
    stateCode: v.optional(v.string()),
    subtotalCents: v.number(),
  },
  returns: v.any(),
  handler: async (ctx, { countryCode, stateCode, subtotalCents }) => {
    // Check for admin-configured rate first
    let setting = null;

    if (countryCode === "US" && stateCode) {
      setting = await ctx.db
        .query("taxSettings")
        .withIndex("by_region", (q: any) => q.eq("region", stateCode))
        .first();
    }

    if (!setting) {
      setting = await ctx.db
        .query("taxSettings")
        .withIndex("by_region", (q: any) => q.eq("region", countryCode))
        .first();
    }

    let rate = 0;
    let label = "No tax";
    let region = "";

    if (setting && setting.enabled) {
      rate = setting.rate;
      label = setting.label;
      region = setting.region;
    } else if (!setting) {
      // Fall back to defaults if no admin setting exists
      if (countryCode === "US" && stateCode) {
        const stateInfo = US_STATE_TAX_RATES[stateCode];
        if (stateInfo && stateInfo.rate > 0) {
          rate = stateInfo.rate;
          label = `${stateInfo.label} Sales Tax`;
          region = stateCode;
        }
      } else if (countryCode !== "US") {
        const countryInfo = COUNTRY_TAX_RATES[countryCode];
        if (countryInfo && countryInfo.rate > 0) {
          rate = countryInfo.rate;
          label = countryInfo.label;
          region = countryCode;
        }
      }
    }

    const taxCents = Math.round(subtotalCents * rate);

    return {
      rate,
      ratePercent: (rate * 100).toFixed(2),
      taxCents,
      label,
      region,
    };
  },
});

// ─── Admin: List all tax settings ───────────────────────────────────────

export const listSettings = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("taxSettings").collect();
  },
});

// ─── Admin: Upsert a tax rate ───────────────────────────────────────────

export const upsertRate = mutation({
  args: {
    region: v.string(),
    regionType: v.string(),
    label: v.string(),
    rate: v.number(),
    enabled: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, { region, regionType, label, rate, enabled }) => {
    await requireAdmin(ctx);

    const existing = await ctx.db
      .query("taxSettings")
      .withIndex("by_region", (q: any) => q.eq("region", region))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { rate, label, enabled, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("taxSettings", {
        region,
        regionType,
        label,
        rate,
        enabled,
        updatedAt: Date.now(),
      });
    }
    return null;
  },
});

// ─── Admin: Delete a tax rate ───────────────────────────────────────────

export const deleteRate = mutation({
  args: { settingId: v.id("taxSettings") },
  returns: v.null(),
  handler: async (ctx, { settingId }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(settingId);
    return null;
  },
});

// ─── Admin: Seed default US tax rates ───────────────────────────────────

export const seedDefaults = mutation({
  args: { type: v.string() }, // "us_states" | "international"
  returns: v.number(), // count of rates seeded
  handler: async (ctx, { type }) => {
    await requireAdmin(ctx);
    let count = 0;

    if (type === "us_states") {
      for (const [code, info] of Object.entries(US_STATE_TAX_RATES)) {
        const existing = await ctx.db
          .query("taxSettings")
          .withIndex("by_region", (q: any) => q.eq("region", code))
          .first();
        if (!existing && info.rate > 0) {
          await ctx.db.insert("taxSettings", {
            region: code,
            regionType: "us_state",
            label: `${info.label} Sales Tax`,
            rate: info.rate,
            enabled: true,
            updatedAt: Date.now(),
          });
          count++;
        }
      }
    } else if (type === "international") {
      for (const [code, info] of Object.entries(COUNTRY_TAX_RATES)) {
        const existing = await ctx.db
          .query("taxSettings")
          .withIndex("by_region", (q: any) => q.eq("region", code))
          .first();
        if (!existing) {
          await ctx.db.insert("taxSettings", {
            region: code,
            regionType: "country",
            label: info.label,
            rate: info.rate,
            enabled: true,
            updatedAt: Date.now(),
          });
          count++;
        }
      }
    }

    return count;
  },
});
