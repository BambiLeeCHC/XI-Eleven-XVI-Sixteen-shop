/**
 * Function registry for the Supabase backend.
 *
 * The storefront was built against Convex's generated `api` object, where every
 * call site reads `api.<module>.<function>`. Keeping that exact shape means the
 * migration is a change of *implementation*, not a rewrite of forty components —
 * far less surface area for a regression on a live store.
 *
 * Each reference is just a string key; `handlers.ts` maps keys to Supabase work.
 */

export type FunctionRef = string & { __brand?: "FunctionRef" };

const ref = (name: string): FunctionRef => name as FunctionRef;

export const api = {
  auth: {
    currentUser: ref("auth.currentUser"),
  },
  users: {
    isAdmin: ref("users.isAdmin"),
    deleteAccount: ref("users.deleteAccount"),
  },
  profile: {
    updateBirthDetails: ref("profile.updateBirthDetails"),
  },
  subscription: {
    status: ref("subscription.status"),
    startTrial: ref("subscription.startTrial"),
  },
  deepReadings: {
    mine: ref("deepReadings.mine"),
    draw: ref("deepReadings.draw"),
  },
  readingQuestions: {
    mine: ref("readingQuestions.mine"),
    checkout: ref("readingQuestions.checkout"),
  },
  natalChart: {
    get: ref("natalChart.get"),
  },
  natalProfile: {
    get: ref("natalProfile.get"),
  },
  numerology: {
    get: ref("numerology.get"),
  },
  geocode: {
    search: ref("geocode.search"),
  },
  products: {
    list: ref("products.list"),
    getById: ref("products.getById"),
    getCount: ref("products.getCount"),
  },
  cart: {
    getItems: ref("cart.getItems"),
    getCount: ref("cart.getCount"),
    addItem: ref("cart.addItem"),
    updateQuantity: ref("cart.updateQuantity"),
    removeItem: ref("cart.removeItem"),
    clearCart: ref("cart.clearCart"),
  },
  favorites: {
    list: ref("favorites.list"),
    getIds: ref("favorites.getIds"),
    getCount: ref("favorites.getCount"),
    toggle: ref("favorites.toggle"),
  },
  orders: {
    create: ref("orders.create"),
    listByUser: ref("orders.listByUser"),
    listBySession: ref("orders.listBySession"),
    listAll: ref("orders.listAll"),
    getById: ref("orders.getById"),
    getByStripeSession: ref("orders.getByStripeSession"),
    updateStatus: ref("orders.updateStatus"),
  },
  newsletter: {
    subscribe: ref("newsletter.subscribe"),
    list: ref("newsletter.list"),
  },
  blog: {
    listPublished: ref("blog.listPublished"),
    getBySlug: ref("blog.getBySlug"),
    categories: ref("blog.categories"),
    listAll: ref("blog.listAll"),
    getById: ref("blog.getById"),
    createPost: ref("blog.createPost"),
    updatePost: ref("blog.updatePost"),
    deletePost: ref("blog.deletePost"),
    seedWelcomePost: ref("blog.seedWelcomePost"),
  },
  siteContent: {
    getLanding: ref("siteContent.getLanding"),
    saveLanding: ref("siteContent.saveLanding"),
  },
  shipping: {
    getSetting: ref("shipping.getSetting"),
    getAll: ref("shipping.getAll"),
    listSettings: ref("shipping.listSettings"),
    upsertSetting: ref("shipping.upsertSetting"),
  },
  tax: {
    calculateTax: ref("tax.calculateTax"),
    listSettings: ref("tax.listSettings"),
    upsertRate: ref("tax.upsertRate"),
    deleteRate: ref("tax.deleteRate"),
    seedDefaults: ref("tax.seedDefaults"),
  },
  storage: {
    generateUploadUrl: ref("storage.generateUploadUrl"),
    getUrl: ref("storage.getUrl"),
    uploadFile: ref("storage.uploadFile"),
  },
  checkout: {
    estimateShipping: ref("checkout.estimateShipping"),
    createCheckoutSession: ref("checkout.createCheckoutSession"),
  },
  crmEmail: {
    send: ref("crmEmail.send"),
    listForCustomer: ref("crmEmail.listForCustomer"),
  },
  viktorTools: {
    brandChat: ref("viktorTools.brandChat"),
  },
  admin: {
    listOrders: ref("admin.listOrders"),
    getOrder: ref("admin.getOrder"),
    updateOrderStatus: ref("admin.updateOrderStatus"),
    listAllProducts: ref("admin.listAllProducts"),
    updateProduct: ref("admin.updateProduct"),
    deleteProduct: ref("admin.deleteProduct"),
    listCustomers: ref("admin.listCustomers"),
    setUserRole: ref("admin.setUserRole"),
    listSubscribers: ref("admin.listSubscribers"),
    removeSubscriber: ref("admin.removeSubscriber"),
    listCrmNotes: ref("admin.listCrmNotes"),
    addCrmNote: ref("admin.addCrmNote"),
    deleteCrmNote: ref("admin.deleteCrmNote"),
    updateCustomerTags: ref("admin.updateCustomerTags"),
    getCrmProfile: ref("admin.getCrmProfile"),
    dashboardStats: ref("admin.dashboardStats"),
    syncPrintful: ref("admin.syncPrintful"),
  },
} as const;

export default api;
