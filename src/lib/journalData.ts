// Journal data access with a static fallback.
//
// The Journal reads admin-authored posts from Supabase. If that read fails
// (network, or the table empty on a fresh environment), a plain `useQuery`
// would throw and take the whole page down. So we query imperatively, catch
// the failure, and serve the seeded launch entries bundled with the app.
// Whenever the database answers, its posts win.

import { useEffect, useMemo, useState } from "react";
import { SECOND_POST, THIRD_POST, WELCOME_POST } from "../data/journalSeed";
import { api, useBackend } from "../lib/backend";

export interface JournalPost {
  _id: string;
  _creationTime: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt?: number;
  readMinutes: number;
  featured: boolean;
}

const LAUNCH_DAY = Date.UTC(2026, 6, 28, 15, 16, 0);
const SUBLIMATION_DAY = Date.UTC(2026, 7, 1, 15, 16, 0);

function toPost(
  seed: typeof WELCOME_POST | typeof THIRD_POST,
  offsetMinutes: number,
  day: number = LAUNCH_DAY,
): JournalPost {
  const ts = day - offsetMinutes * 60_000;
  return {
    _id: `seed-${seed.slug}`,
    _creationTime: ts,
    publishedAt: ts,
    coverImage: undefined,
    ...seed,
  } as JournalPost;
}

/** Seeded launch entries, newest first. */
export const STATIC_POSTS: JournalPost[] = [
  toPost(THIRD_POST, 0, SUBLIMATION_DAY),
  toPost(WELCOME_POST, 0),
  toPost(SECOND_POST, 60),
];

type Source = "database" | "static";

/** Published posts, from the database when reachable, else the bundled entries. */
export function usePublishedPosts(limit?: number): {
  posts: JournalPost[] | undefined;
  source: Source;
} {
  const backend = useBackend();
  const [posts, setPosts] = useState<JournalPost[] | undefined>(undefined);
  const [source, setSource] = useState<Source>("database");

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const rows = (await backend.query(api.blog.listPublished, {
          limit,
        })) as JournalPost[];
        if (!live) return;
        if (rows && rows.length > 0) {
          setPosts(rows);
          setSource("database");
          return;
        }
        throw new Error("empty");
      } catch {
        if (!live) return;
        setPosts(limit ? STATIC_POSTS.slice(0, limit) : STATIC_POSTS);
        setSource("static");
      }
    })();
    return () => {
      live = false;
    };
  }, [backend, limit]);

  return { posts, source };
}

/** One published post by slug: `undefined` while loading, `null` if unknown. */
export function usePostBySlug(slug: string): JournalPost | null | undefined {
  const backend = useBackend();
  const [post, setPost] = useState<JournalPost | null | undefined>(undefined);
  const fallback = useMemo(
    () => STATIC_POSTS.find(p => p.slug === slug) ?? null,
    [slug],
  );

  useEffect(() => {
    let live = true;
    setPost(undefined);
    (async () => {
      try {
        const row = (await backend.query(api.blog.getBySlug, {
          slug,
        })) as JournalPost | null;
        if (!live) return;
        setPost(row ?? fallback);
      } catch {
        if (!live) return;
        setPost(fallback);
      }
    })();
    return () => {
      live = false;
    };
  }, [backend, slug, fallback]);

  return post;
}
