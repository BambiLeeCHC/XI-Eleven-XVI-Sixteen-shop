/**
 * Image uploads to Supabase Storage.
 *
 * Buckets are public-read and admin-write, so the returned URL can be dropped
 * straight into a product gallery or a journal cover.
 */

import { supabase } from "./supabase";

export const MAX_FILE_BYTES = 10 * 1024 * 1024;

function safeName(name: string) {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-60);
  const unique =
    globalThis.crypto?.randomUUID?.().slice(0, 8) ?? String(Date.now());
  return `${unique}-${cleaned || "image"}`;
}

export async function uploadImage(
  file: File,
  bucket: "product-media" | "site-media" | string = "product-media",
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error(`${file.name} is not an image.`);
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`${file.name} is larger than 10 MB.`);
  }

  const path = safeName(file.name);
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error)
    throw new Error(error.message || `Upload failed for ${file.name}.`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error(`Could not prepare ${file.name}.`);
  return data.publicUrl;
}
