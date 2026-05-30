import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Extend the default users table with a role field
const extendedAuthTables = {
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(v.string()), // "admin" | "customer" (default)
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),
};

const schema = defineSchema({
  ...extendedAuthTables,

  // Products synced from Printful
  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(), // in cents
    currency: v.string(),
    category: v.string(), // "Tops", "Bottoms", "Dresses", "Activewear"
    gender: v.string(), // "women", "men", "unisex"
    images: v.array(v.string()), // URLs
    sizes: v.array(v.string()),
    printfulProductId: v.optional(v.string()),
    printfulVariants: v.optional(v.any()), // variant details from Printful
    stripeProductId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
    isActive: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_gender", ["gender", "isActive"])
    .index("by_category", ["category", "isActive"])
    .index("by_printful_id", ["printfulProductId"]),

  // Shopping cart items
  cartItems: defineTable({
    sessionId: v.string(), // anonymous or userId
    productId: v.id("products"),
    size: v.string(),
    quantity: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_product_size", ["sessionId", "productId", "size"]),

  // Orders
  orders: defineTable({
    userId: v.optional(v.id("users")),
    email: v.string(),
    sessionId: v.string(),
    items: v.array(
      v.object({
        productId: v.id("products"),
        productName: v.string(),
        size: v.string(),
        quantity: v.number(),
        priceAtPurchase: v.number(),
        image: v.optional(v.string()),
      })
    ),
    subtotal: v.number(),
    tax: v.optional(v.number()), // Tax amount in cents
    taxRate: v.optional(v.number()), // Tax rate applied (decimal)
    taxRegion: v.optional(v.string()), // Region tax was calculated for
    shipping: v.number(),
    total: v.number(),
    currency: v.string(),
    status: v.string(), // "pending", "paid", "fulfilled", "shipped", "delivered", "cancelled"
    stripePaymentIntentId: v.optional(v.string()),
    stripeCheckoutSessionId: v.optional(v.string()),
    printfulOrderId: v.optional(v.string()),
    shippingAddress: v.optional(
      v.object({
        name: v.string(),
        address1: v.string(),
        address2: v.optional(v.string()),
        city: v.string(),
        stateCode: v.string(),
        countryCode: v.string(),
        zip: v.string(),
        phone: v.optional(v.string()),
      })
    ),
    trackingUrl: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
    trackingCarrier: v.optional(v.string()),
    shippingMethod: v.optional(v.string()),
    // Fulfillment stage tracking
    fulfillmentStage: v.optional(v.string()), // "payment_received" | "sent_to_printful" | "printful_processing" | "printful_fulfilled" | "shipped" | "delivered"
    fulfillmentHistory: v.optional(v.array(v.object({
      stage: v.string(),
      timestamp: v.number(),
      note: v.optional(v.string()),
    }))),
    printfulStatus: v.optional(v.string()),
  })
    .index("by_session", ["sessionId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_stripe_session", ["stripeCheckoutSessionId"]),

  // Newsletter subscribers
  newsletter: defineTable({
    email: v.string(),
    subscribedAt: v.number(),
  }).index("by_email", ["email"]),

  // CRM: Notes & interactions per customer
  crmNotes: defineTable({
    customerId: v.id("users"),
    adminId: v.id("users"),
    adminName: v.string(),
    note: v.string(),
    type: v.string(), // "note", "call", "email", "issue", "follow_up"
    createdAt: v.number(),
  }).index("by_customer", ["customerId"]),

  // CRM: Customer profiles with tags
  crmProfiles: defineTable({
    customerId: v.id("users"),
    tags: v.array(v.string()),
  }).index("by_customer", ["customerId"]),

  // Shipping settings — admin-configurable shipping rules
  shippingSettings: defineTable({
    key: v.string(), // "free_standard", "standard_label", "expedited_enabled", "expedited_markup", etc.
    value: v.string(), // JSON-stringified value
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  // Tax settings — admin-configurable tax rates by region
  taxSettings: defineTable({
    region: v.string(), // US state code ("CA", "NY") or country code ("GB", "AU")
    regionType: v.string(), // "us_state" | "country"
    label: v.string(), // Display name ("California", "United Kingdom")
    rate: v.number(), // Tax rate as decimal (0.0725 = 7.25%)
    enabled: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_region", ["region"])
    .index("by_region_type", ["regionType"]),
});

export default schema;
