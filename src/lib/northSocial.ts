export type ReactionKey = "claim" | "felt" | "sync" | "save";

export type SocialComment = {
  id: string;
  author: string;
  body: string;
  at: number;
};

export type SocialPost = {
  id: string;
  author: string;
  handle: string;
  sign: string;
  kind: "pull" | "spread" | "chart" | "tandem" | "bulletin";
  title: string;
  body: string;
  cards: string[];
  createdAt: number;
  reactions: Record<ReactionKey, number>;
  mine: ReactionKey[];
  comments: SocialComment[];
};

export type TopFriend = {
  id: string;
  name: string;
  handle: string;
  sun: string;
  moon: string;
  rising: string;
  vibe: string;
};

export type AvatarMode = "ai" | "original";

export type SpaceProfile = {
  name: string;
  manifesto: string;
  mood: string;
  anthem: string;
  altar: string;
  aura: string;
  sun: string;
  moon: string;
  rising: string;
  lifePath: string;
  /** Optional @handle. Older saved profiles omit it and still load. */
  handle: string;
  /** Square data URL of the uploaded photo. Empty until the person adds one. */
  photoUrl: string;
  /** Square data URL of the generated True North portrait. */
  aiAvatarUrl: string;
  avatarMode: AvatarMode;
};

export type TrueNorthDestination = "feed" | "sky" | "readings";
export type SkyPanel = "chart" | "numbers" | "constellation";
export type ReadingMode = "quick" | "deep" | "tandem";

export type SocialState = {
  posts: SocialPost[];
  top: TopFriend[];
  space: SpaceProfile;
};

export const REACTION_LABEL: Record<ReactionKey, string> = {
  claim: "Claiming",
  felt: "Felt",
  sync: "Synchronicity",
  save: "Save",
};

/** Profile space on The Circle. User-facing name only. */
export const MY_SKY_LABEL = "My Sky";
/** Ranked eight-seat circle. User-facing name only. */
export const MY_CONSTELLATION_LABEL = "My Constellation";
export const NORTH_SOCIAL_SKY_TAB = `${MY_SKY_LABEL} & ${MY_CONSTELLATION_LABEL}`;
/**
 * Saved browser state. Keep this key so existing profiles still load.
 * Table names in applied migrations stay as they are.
 */
export const NORTH_SOCIAL_STORAGE_KEY = "xixvi-north-social-v1";

const emptyReactions = (): Record<ReactionKey, number> => ({
  claim: 0,
  felt: 0,
  sync: 0,
  save: 0,
});

export function starterSpace(): SpaceProfile {
  return {
    name: "You",
    manifesto: "Oriented, not predicted. The work is the way home.",
    mood: "Clear signal",
    anthem: "Night drive, windows down",
    altar: "The Star",
    aura: "lilac",
    sun: "Aries",
    moon: "Cancer",
    rising: "Libra",
    lifePath: "11",
    handle: "you",
    photoUrl: "",
    aiAvatarUrl: "",
    avatarMode: "ai",
  };
}

export function starterTop(): TopFriend[] {
  return [
    ["Nova", "nova", "Leo", "Aries", "Sagittarius", "Sun Trine Moon"],
    ["Ivo", "ivo", "Scorpio", "Pisces", "Cancer", "Soul Catalyst"],
    ["Maren", "maren", "Libra", "Gemini", "Aquarius", "Venusian Mirror"],
    ["Sol", "sol", "Aries", "Leo", "Sagittarius", "Mars Sextile Sun"],
    ["Kei", "kei", "Virgo", "Capricorn", "Taurus", "Earth Trine"],
    ["Rue", "rue", "Pisces", "Scorpio", "Cancer", "Moon Conjunction"],
    ["Ash", "ash", "Aquarius", "Gemini", "Libra", "Air Trine"],
    ["Juno", "juno", "Taurus", "Virgo", "Capricorn", "Venus Trine"],
  ].map(([name, handle, sun, moon, rising, vibe], index) => ({
    id: `starter-${index + 1}`,
    name: name ?? "Friend",
    handle: handle ?? "friend",
    sun: sun ?? "Aries",
    moon: moon ?? "Cancer",
    rising: rising ?? "Libra",
    vibe: vibe ?? "Kindred",
  }));
}

export function starterPosts(now = Date.now()): SocialPost[] {
  return [
    {
      id: "starter-sky",
      author: "Collective Sky",
      handle: "sky",
      sign: "Aquarius",
      kind: "bulletin",
      title: "Today's collective sky",
      body: "The room is bright and a little restless. Take one true step before noon.",
      cards: ["The Star", "Ace of Wands", "Temperance"],
      createdAt: now - 1000 * 60 * 40,
      reactions: { claim: 12, felt: 9, sync: 4, save: 3 },
      mine: [],
      comments: [],
    },
    {
      id: "starter-nova",
      author: "Nova",
      handle: "nova",
      sign: "Leo",
      kind: "pull",
      title: "Morning pull",
      body: "The Sun upright. I am done shrinking the work so other people stay comfortable.",
      cards: ["The Sun"],
      createdAt: now - 1000 * 60 * 90,
      reactions: { claim: 6, felt: 8, sync: 2, save: 1 },
      mine: [],
      comments: [
        { id: "c1", author: "Ivo", body: "Felt that in the chest.", at: now - 1000 * 60 * 80 },
      ],
    },
  ];
}

export function blankState(now = Date.now()): SocialState {
  return { posts: starterPosts(now), top: starterTop(), space: starterSpace() };
}

export function promoteTop(list: TopFriend[], index: number): TopFriend[] {
  if (index <= 0 || index >= list.length) return list.slice();
  const next = list.slice();
  const [picked] = next.splice(index, 1);
  if (!picked) return list.slice();
  next.unshift(picked);
  return next;
}

export function moveTop(list: TopFriend[], index: number, direction: -1 | 1): TopFriend[] {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list.slice();
  const next = list.slice();
  const current = next[index];
  const other = next[target];
  if (!current || !other) return list.slice();
  next[index] = other;
  next[target] = current;
  return next;
}

function emptySeat(index: number): TopFriend {
  return {
    id: `empty-${index + 1}`,
    name: "Open seat",
    handle: "open",
    sun: "—",
    moon: "—",
    rising: "—",
    vibe: "Waiting",
  };
}

/** Always eight ranked seats, padding older saved lists that came up short. */
export function rankedEight(list: TopFriend[] | null | undefined): TopFriend[] {
  const source = Array.isArray(list) ? list.slice(0, 8) : [];
  const next = source.map(friend => ({ ...friend }));
  while (next.length < 8) next.push(emptySeat(next.length));
  return next;
}

export function upsertFriend(list: TopFriend[], friend: TopFriend, slot: number): TopFriend[] {
  const next = rankedEight(list);
  const index = Math.min(7, Math.max(0, slot));
  next[index] = friend;
  return next;
}

export function toggleReaction(post: SocialPost, key: ReactionKey): SocialPost {
  const on = post.mine.includes(key);
  const count = post.reactions[key] + (on ? -1 : 1);
  return {
    ...post,
    mine: on ? post.mine.filter(item => item !== key) : [...post.mine, key],
    reactions: { ...post.reactions, [key]: Math.max(0, count) },
  };
}

export function addComment(post: SocialPost, author: string, body: string, now = Date.now()): SocialPost {
  const text = body.trim();
  if (!text) return post;
  return {
    ...post,
    comments: [
      ...post.comments,
      { id: `c-${now}`, author: author.trim() || "You", body: text.slice(0, 280), at: now },
    ],
  };
}

export function createPost(input: {
  author: string;
  handle: string;
  sign: string;
  kind: SocialPost["kind"];
  title: string;
  body: string;
  cards?: string[];
  now?: number;
}): SocialPost {
  const now = input.now ?? Date.now();
  return {
    id: `post-${now}`,
    author: input.author.trim() || "You",
    handle: input.handle.trim() || "you",
    sign: input.sign || "Aries",
    kind: input.kind,
    title: input.title.trim() || "A note",
    body: input.body.trim(),
    cards: input.cards ?? [],
    createdAt: now,
    reactions: emptyReactions(),
    mine: [],
    comments: [],
  };
}

function skyFromHash(hash: string): SkyPanel {
  if (hash === "numbers") return "numbers";
  if (hash === "constellation" || hash === "friends") return "constellation";
  return "chart";
}

/** One reading of every True North URL. Almanac and the old extra tabs fold in here. */
export function resolveTrueNorthView(pathname: string, hash = ""): {
  destination: TrueNorthDestination;
  sky: SkyPanel;
  reading: ReadingMode;
} {
  const h = hash.replace(/^#/, "");
  if (pathname.startsWith("/chart/long-read") || h === "deep" || h === "long-read") {
    return { destination: "readings", sky: skyFromHash(h), reading: "deep" };
  }
  if (pathname.startsWith("/chart/circle") || h === "tandem") {
    return { destination: "readings", sky: "chart", reading: "tandem" };
  }
  if (h === "readings" || h === "quick") {
    return { destination: "readings", sky: "chart", reading: "quick" };
  }
  if (
    pathname.startsWith("/profile") ||
    h === "sky" ||
    h === "chart" ||
    h === "numbers" ||
    h === "constellation" ||
    h === "friends" ||
    h === "profile" ||
    h === "details" ||
    h === "birth"
  ) {
    return { destination: "sky", sky: skyFromHash(h), reading: "quick" };
  }
  return { destination: "feed", sky: "chart", reading: "quick" };
}

/** Backwards-compatible load of xixvi-north-social-v1, including profiles saved before avatars. */
export function upgradeSocialState(raw: unknown, now = Date.now()): SocialState {
  if (!raw || typeof raw !== "object") return blankState(now);
  const parsed = raw as Partial<SocialState>;
  if (!Array.isArray(parsed.posts) || !parsed.top || !parsed.space || typeof parsed.space !== "object") {
    return blankState(now);
  }
  const space = parsed.space as Partial<SpaceProfile>;
  const base = starterSpace();
  return {
    posts: parsed.posts,
    top: rankedEight(parsed.top),
    space: {
      ...base,
      ...space,
      name: typeof space.name === "string" && space.name.trim() ? space.name : base.name,
      manifesto: typeof space.manifesto === "string" ? space.manifesto : base.manifesto,
      mood: typeof space.mood === "string" ? space.mood : base.mood,
      anthem: typeof space.anthem === "string" ? space.anthem : base.anthem,
      altar: typeof space.altar === "string" ? space.altar : base.altar,
      aura: typeof space.aura === "string" ? space.aura : base.aura,
      sun: typeof space.sun === "string" ? space.sun : base.sun,
      moon: typeof space.moon === "string" ? space.moon : base.moon,
      rising: typeof space.rising === "string" ? space.rising : base.rising,
      lifePath: typeof space.lifePath === "string" ? space.lifePath : base.lifePath,
      handle: typeof space.handle === "string" ? space.handle : base.handle,
      photoUrl: typeof space.photoUrl === "string" ? space.photoUrl : "",
      aiAvatarUrl: typeof space.aiAvatarUrl === "string" ? space.aiAvatarUrl : "",
      avatarMode: space.avatarMode === "original" ? "original" : "ai",
    },
  };
}

export function activeAvatarUrl(space: Partial<SpaceProfile> | null | undefined): string {
  const photo = typeof space?.photoUrl === "string" ? space.photoUrl : "";
  const ai = typeof space?.aiAvatarUrl === "string" ? space.aiAvatarUrl : "";
  if (space?.avatarMode === "original") return photo || ai;
  return ai || photo;
}

type AvatarSyncClient = {
  from: (table: string) => {
    update: (patch: Record<string, unknown>) => {
      eq: (column: string, value: string) => Promise<{ error: { message?: string } | null }>;
    };
  };
};

/** Best-effort profile sync. Missing columns (migration not applied) are not an error. */
export async function syncNorthAvatar(
  client: AvatarSyncClient,
  userId: string,
  space: SpaceProfile,
): Promise<boolean> {
  try {
    const { error } = await client
      .from("profiles")
      .update({
        north_photo_url: space.photoUrl || null,
        north_ai_avatar_url: space.aiAvatarUrl || null,
        north_avatar_mode: space.avatarMode || "ai",
      })
      .eq("id", userId);
    if (!error) return true;
    const message = error.message ?? "";
    if (/north_photo_url|north_ai_avatar_url|north_avatar_mode|schema cache|column/i.test(message)) {
      return false;
    }
    return false;
  } catch {
    return false;
  }
}
