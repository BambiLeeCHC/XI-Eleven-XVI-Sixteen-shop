/**
 * The guest cart session id.
 *
 * It is created once per browser and kept in localStorage. It is also sent on
 * every Supabase request as `x-cart-session`, because the row-level security
 * policy on `cart_items` only lets a caller see rows whose `session_id` matches
 * the header they present — otherwise any visitor could read every other
 * visitor's cart.
 */
const STORAGE_KEY = "xi-xvi-session-id";

function generateId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getSessionId(): string {
  if (typeof localStorage === "undefined") return "";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;
  const id = generateId();
  localStorage.setItem(STORAGE_KEY, id);
  return id;
}
