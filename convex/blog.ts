import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { SECOND_POST, THIRD_POST, WELCOME_POST } from "./blogSeed";

// ─── Helpers ────────────────────────────────────────────────────────────

async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (user?.role !== "admin") throw new Error("Not authorized");
  return user;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/['"’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function estimateReadMinutes(html: string) {
  const words = html
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

async function uniqueSlug(ctx: any, desired: string, ignoreId?: string) {
  const base = slugify(desired) || "post";
  let candidate = base;
  let n = 2;
  while (true) {
    const existing = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q: any) => q.eq("slug", candidate))
      .first();
    if (!existing || existing._id === ignoreId) return candidate;
    candidate = `${base}-${n++}`;
  }
}

// ─── Public queries ─────────────────────────────────────────────────────

export const listPublished = query({
  args: { category: v.optional(v.string()), limit: v.optional(v.number()) },
  returns: v.any(),
  handler: async (ctx, { category, limit }) => {
    let posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_status", (q: any) => q.eq("status", "published"))
      .collect();
    if (category && category !== "All") {
      posts = posts.filter((p: any) => p.category === category);
    }
    posts.sort(
      (a: any, b: any) =>
        (b.publishedAt ?? b._creationTime) - (a.publishedAt ?? a._creationTime)
    );
    return limit ? posts.slice(0, limit) : posts;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.any(),
  handler: async (ctx, { slug }) => {
    const post = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q: any) => q.eq("slug", slug))
      .first();
    if (!post || post.status !== "published") return null;
    return post;
  },
});

export const categories = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_status", (q: any) => q.eq("status", "published"))
      .collect();
    const counts: Record<string, number> = {};
    for (const p of posts) counts[p.category] = (counts[p.category] ?? 0) + 1;
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  },
});

// ─── Admin ──────────────────────────────────────────────────────────────

export const listAll = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const posts = await ctx.db.query("blogPosts").order("desc").collect();
    return posts;
  },
});

export const getById = query({
  args: { postId: v.id("blogPosts") },
  returns: v.any(),
  handler: async (ctx, { postId }) => {
    await requireAdmin(ctx);
    return await ctx.db.get(postId);
  },
});

export const createPost = mutation({
  args: {
    title: v.string(),
    excerpt: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    author: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    status: v.string(),
    featured: v.optional(v.boolean()),
    slug: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const slug = await uniqueSlug(ctx, args.slug || args.title);
    const now = Date.now();
    return await ctx.db.insert("blogPosts", {
      title: args.title,
      slug,
      excerpt: args.excerpt,
      content: args.content,
      coverImage: args.coverImage,
      category: args.category,
      tags: args.tags,
      author: args.author || "XI · XVI",
      status: args.status,
      publishedAt: args.status === "published" ? now : undefined,
      updatedAt: now,
      readMinutes: estimateReadMinutes(args.content),
      featured: args.featured ?? false,
    });
  },
});

export const updatePost = mutation({
  args: {
    postId: v.id("blogPosts"),
    title: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    author: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    status: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    slug: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { postId, ...rest }) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(postId);
    if (!existing) throw new Error("Post not found");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [k, val] of Object.entries(rest)) {
      if (val !== undefined && k !== "slug") patch[k] = val;
    }
    if (rest.slug !== undefined && slugify(rest.slug) !== existing.slug) {
      patch.slug = await uniqueSlug(ctx, rest.slug, postId);
    }
    if (rest.content !== undefined) {
      patch.readMinutes = estimateReadMinutes(rest.content);
    }
    if (
      rest.status === "published" &&
      existing.status !== "published" &&
      !existing.publishedAt
    ) {
      patch.publishedAt = Date.now();
    }
    await ctx.db.patch(postId, patch);
    return null;
  },
});

export const deletePost = mutation({
  args: { postId: v.id("blogPosts") },
  returns: v.null(),
  handler: async (ctx, { postId }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(postId);
    return null;
  },
});

/** Idempotently insert the launch posts so the feed is never empty. */
export const seedWelcomePost = mutation({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const inserted: string[] = [];
    for (const seed of [WELCOME_POST, SECOND_POST, THIRD_POST]) {
      const existing = await ctx.db
        .query("blogPosts")
        .withIndex("by_slug", (q: any) => q.eq("slug", seed.slug))
        .first();
      if (existing) continue;
      const now = Date.now();
      await ctx.db.insert("blogPosts", {
        ...seed,
        status: "published",
        publishedAt: now,
        updatedAt: now,
      });
      inserted.push(seed.slug);
    }
    return { inserted };
  },
});
