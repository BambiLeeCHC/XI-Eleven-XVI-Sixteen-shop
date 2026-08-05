/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ViktorSpacesEmail from "../ViktorSpacesEmail.js";
import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as blog from "../blog.js";
import type * as blogSeed from "../blogSeed.js";
import type * as cart from "../cart.js";
import type * as checkout from "../checkout.js";
import type * as constants from "../constants.js";
import type * as drapeImages from "../drapeImages.js";
import type * as favorites from "../favorites.js";
import type * as http from "../http.js";
import type * as newsletter from "../newsletter.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as seedTestUser from "../seedTestUser.js";
import type * as shipping from "../shipping.js";
import type * as storage from "../storage.js";
import type * as tax from "../tax.js";
import type * as testAuth from "../testAuth.js";
import type * as users from "../users.js";
import type * as viktorTools from "../viktorTools.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ViktorSpacesEmail: typeof ViktorSpacesEmail;
  admin: typeof admin;
  auth: typeof auth;
  blog: typeof blog;
  blogSeed: typeof blogSeed;
  cart: typeof cart;
  checkout: typeof checkout;
  constants: typeof constants;
  drapeImages: typeof drapeImages;
  favorites: typeof favorites;
  http: typeof http;
  newsletter: typeof newsletter;
  orders: typeof orders;
  products: typeof products;
  seedTestUser: typeof seedTestUser;
  shipping: typeof shipping;
  storage: typeof storage;
  tax: typeof tax;
  testAuth: typeof testAuth;
  users: typeof users;
  viktorTools: typeof viktorTools;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
