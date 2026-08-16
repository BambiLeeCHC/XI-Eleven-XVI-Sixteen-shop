/**
 * Row ⇄ document mapping.
 *
 * Postgres columns are snake_case; every component in this app was written
 * against the previous backend's camelCase documents (`isActive`, `_id`,
 * `_creationTime`). Mapping in one place keeps the UI untouched and means a
 * column rename only ever has to be fixed here.
 */

export type Row = Record<string, any>;

const iso = (value: string | null | undefined): number =>
  value ? new Date(value).getTime() : 0;

export function mapProduct(row: Row | null | undefined) {
  if (!row) return null;
  return {
    _id: row.id,
    _creationTime: iso(row.created_at),
    name: row.name,
    description: row.description ?? "",
    price: row.price,
    currency: row.currency ?? "USD",
    category: row.category,
    gender: row.gender,
    images: row.images ?? [],
    rotationImages: row.rotation_images ?? undefined,
    sizes: row.sizes ?? [],
    printfulProductId: row.printful_product_id ?? undefined,
    printfulVariants: row.printful_variants ?? undefined,
    stripeProductId: row.stripe_product_id ?? undefined,
    stripePriceId: row.stripe_price_id ?? undefined,
    isActive: row.is_active,
    sortOrder: row.sort_order ?? 0,
  };
}

export function productPatchToRow(fields: Row): Row {
  const patch: Row = {};
  const map: Record<string, string> = {
    name: "name",
    description: "description",
    price: "price",
    currency: "currency",
    category: "category",
    gender: "gender",
    images: "images",
    rotationImages: "rotation_images",
    sizes: "sizes",
    printfulProductId: "printful_product_id",
    printfulVariants: "printful_variants",
    stripeProductId: "stripe_product_id",
    stripePriceId: "stripe_price_id",
    isActive: "is_active",
    sortOrder: "sort_order",
  };
  for (const [key, column] of Object.entries(map)) {
    if (fields[key] !== undefined) patch[column] = fields[key];
  }
  return patch;
}

export function mapOrder(row: Row | null | undefined) {
  if (!row) return null;
  return {
    _id: row.id,
    _creationTime: iso(row.created_at),
    userId: row.user_id ?? undefined,
    email: row.email,
    sessionId: row.session_id,
    items: row.items ?? [],
    subtotal: row.subtotal ?? 0,
    tax: row.tax ?? 0,
    taxRate: row.tax_rate ?? undefined,
    taxRegion: row.tax_region ?? undefined,
    shipping: row.shipping ?? 0,
    total: row.total ?? 0,
    currency: row.currency ?? "USD",
    status: row.status,
    stripePaymentIntentId: row.stripe_payment_intent_id ?? undefined,
    stripeCheckoutSessionId: row.stripe_checkout_session_id ?? undefined,
    printfulOrderId: row.printful_order_id ?? undefined,
    printfulStatus: row.printful_status ?? undefined,
    shippingAddress: row.shipping_address ?? undefined,
    shippingMethod:
      typeof row.shipping_method === "string"
        ? row.shipping_method
        : (row.shipping_method?.name ?? undefined),
    trackingUrl: row.tracking_url ?? undefined,
    trackingNumber: row.tracking_number ?? undefined,
    trackingCarrier: row.tracking_carrier ?? undefined,
    fulfillmentStage: row.fulfillment_stage ?? undefined,
    fulfillmentHistory: row.fulfillment_history ?? [],
    fulfillmentException: row.fulfillment_exception ?? undefined,
    giftMessage: row.gift_message ?? undefined,
  };
}

export function mapBlogPost(row: Row | null | undefined) {
  if (!row) return null;
  return {
    _id: row.id,
    _creationTime: iso(row.created_at),
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? "",
    content: row.content ?? "",
    coverImage: row.cover_image ?? undefined,
    category: row.category,
    tags: row.tags ?? [],
    author: row.author ?? "XI · XVI",
    status: row.status,
    publishedAt: row.published_at ? iso(row.published_at) : undefined,
    updatedAt: iso(row.updated_at),
    readMinutes: row.read_minutes ?? 1,
    featured: row.featured ?? false,
  };
}

export function mapCartItem(row: Row) {
  return {
    _id: row.id,
    _creationTime: iso(row.created_at),
    sessionId: row.session_id,
    productId: row.product_id,
    size: row.size,
    color: row.color ?? undefined,
    quantity: row.quantity,
  };
}

export function mapProfile(row: Row | null | undefined) {
  if (!row) return null;
  return {
    _id: row.id,
    _creationTime: iso(row.created_at),
    name: row.name ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    role: row.role ?? "customer",
    birthDate: row.birth_date ?? undefined,
    situation: row.situation ?? undefined,
    genderIdentity: row.gender_identity ?? undefined,
    sexualOrientation: row.sexual_orientation ?? undefined,
  };
}

export function mapCrmNote(row: Row) {
  return {
    _id: row.id,
    _creationTime: iso(row.created_at),
    customerId: row.customer_id,
    adminId: row.admin_id,
    adminName: row.admin_name,
    note: row.note,
    type: row.type,
    createdAt: iso(row.created_at),
  };
}

export function mapCrmEmail(row: Row) {
  return {
    _id: row.id,
    _creationTime: iso(row.sent_at),
    customerId: row.customer_id,
    adminId: row.admin_id,
    to: row.recipient,
    from: row.sender,
    subject: row.subject,
    body: row.body,
    status: row.status,
    providerId: row.provider_id ?? undefined,
    error: row.error ?? undefined,
    sentAt: iso(row.sent_at),
  };
}

export function mapSubscriber(row: Row) {
  return {
    _id: row.id,
    _creationTime: iso(row.subscribed_at),
    email: row.email,
    subscribedAt: iso(row.subscribed_at),
  };
}

export function mapTaxRate(row: Row) {
  return {
    _id: row.id,
    _creationTime: iso(row.updated_at),
    region: row.region,
    regionType: row.region_type,
    label: row.label,
    rate: Number(row.rate),
    enabled: row.enabled,
    updatedAt: iso(row.updated_at),
  };
}
