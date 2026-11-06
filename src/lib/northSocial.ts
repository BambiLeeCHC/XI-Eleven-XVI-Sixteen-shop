import { lifePathNumber } from "./numerology";

export type ReactionKey = "claim" | "felt" | "sync" | "save";

export type PostKind =
  | "pull"
  | "spread"
  | "chart"
  | "tandem"
  | "bulletin"
  | "note"
  | "number";

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
  kind: PostKind;
  title: string;
  body: string;
  cards: string[];
  createdAt: number;
  reactions: Record<ReactionKey, number>;
  mine: ReactionKey[];
  comments: SocialComment[];
  authorId?: string;
  partnerId?: string;
  partnerName?: string;
  partnerHandle?: string;
  bond?: string;
  reflection?: string;
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

export type SocialFriend = TopFriend & {
  note?: string;
  birthDate?: string;
  lifePath?: string;
  mood?: string;
  anthem?: string;
  altar?: string;
  manifesto?: string;
  focus?: string;
};

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
  birthDate?: string;
  focus?: string;
};

export type TrueNorthDestination = "feed" | "sky" | "readings";
export type SkyPanel = "chart" | "numbers" | "constellation" | "posts";
export type ReadingMode = "quick" | "deep" | "tandem";

export type SocialState = {
  posts: SocialPost[];
  top: TopFriend[];
  space: SpaceProfile;
  friends?: SocialFriend[];
  suggested?: SocialFriend[];
  seededSuggestions?: boolean;
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
/**
 * Retired combined tab label. Kept so older notes still name the same key.
 * The circle nav says My Sky. Constellation is a category inside it.
 */
export const NORTH_SOCIAL_SKY_TAB = `${MY_SKY_LABEL} & ${MY_CONSTELLATION_LABEL}`;
/**
 * Saved browser state. Keep this key so existing profiles still load.
 * Table names in applied migrations stay as they are.
 */
export const NORTH_SOCIAL_STORAGE_KEY = "xixvi-north-social-v1";

export const VIEWER_ID = "me";

export const PROFILE_CATEGORIES = [
  { id: "chart", label: "Chart", hash: "chart" },
  { id: "numbers", label: "Numbers", hash: "numbers" },
  { id: "constellation", label: MY_CONSTELLATION_LABEL, hash: "constellation" },
] as const;

export type ProfileCategory = (typeof PROFILE_CATEGORIES)[number]["id"];

export const FEED_FILTERS = [
  { id: "all", label: "All" },
  { id: "posts", label: "Posts & Pulls" },
  { id: "tandem", label: "Tandem Readings" },
] as const;

export type FeedFilter = (typeof FEED_FILTERS)[number]["id"];

const POST_KINDS = new Set<PostKind>([
  "pull",
  "spread",
  "chart",
  "tandem",
  "bulletin",
  "note",
  "number",
]);

const REACTION_KEYS: ReactionKey[] = ["claim", "felt", "sync", "save"];

const VIEWER_BIRTH = "1994-09-12";

const emptyReactions = (): Record<ReactionKey, number> => ({
  claim: 0,
  felt: 0,
  sync: 0,
  save: 0,
});

function slug(value: string) {
  const next = value.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24);
  return next || "you";
}

function reactionsFor(partial: Partial<Record<ReactionKey, number>>): Record<ReactionKey, number> {
  return { ...emptyReactions(), ...partial };
}

export function starterSpace(): SpaceProfile {
  return {
    name: "Avery Quinn",
    handle: "north",
    manifesto: "Oriented, not predicted. The work is the way home.",
    mood: "Clear signal",
    anthem: "Night drive, windows down",
    altar: "The Star",
    aura: "lilac",
    sun: "Aries",
    moon: "Cancer",
    rising: "Libra",
    lifePath: String(lifePathNumber(VIEWER_BIRTH)),
    birthDate: VIEWER_BIRTH,
    focus: "career",
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

export function starterSuggested(): SocialFriend[] {
  return [
    {
      id: "suggest-ori",
      name: "Ori",
      handle: "ori",
      sun: "Gemini",
      moon: "Aquarius",
      rising: "Libra",
      vibe: "Quick silver",
      note: "A mind that leaves the light on.",
      manifesto: "Say the true thing once, then let it stand.",
      birthDate: "1996-06-03",
      lifePath: "7",
      mood: "Bright static",
      anthem: "Kitchen radio",
      altar: "The Magician",
      focus: "career",
    },
    {
      id: "suggest-sable",
      name: "Sable",
      handle: "sable",
      sun: "Scorpio",
      moon: "Cancer",
      rising: "Pisces",
      vibe: "Held water",
      note: "Few rooms, all of them honest.",
      manifesto: "Depth without the performance.",
      birthDate: "1988-11-02",
      lifePath: "9",
      mood: "Low tide",
      anthem: "Piano in the next room",
      altar: "The High Priestess",
      focus: "love",
    },
    {
      id: "suggest-wren",
      name: "Wren",
      handle: "wren",
      sun: "Capricorn",
      moon: "Taurus",
      rising: "Virgo",
      vibe: "Slow build",
      note: "Shows up with the useful thing.",
      manifesto: "Make it sturdy, then make it kind.",
      birthDate: "1991-01-19",
      lifePath: "4",
      mood: "Even keel",
      anthem: "Morning work song",
      altar: "The Emperor",
      focus: "money",
    },
  ];
}

function post(input: SocialPost): SocialPost {
  return input;
}

export function starterSuggestedPosts(now = Date.now()): SocialPost[] {
  return [
    post({
      id: "starter-ori",
      author: "Ori",
      authorId: "suggest-ori",
      handle: "ori",
      sign: "Gemini",
      kind: "pull",
      title: "Hallway light",
      body: "Ori left a light on in the hallway.",
      cards: ["The Hermit"],
      createdAt: now - 1000 * 60 * 55,
      reactions: reactionsFor({ claim: 2, felt: 3, sync: 1, save: 0 }),
      mine: [],
      comments: [],
    }),
    post({
      id: "starter-ori-tandem",
      author: "Ori",
      authorId: "suggest-ori",
      handle: "ori",
      sign: "Gemini",
      kind: "tandem",
      title: "Ori × Sable",
      body: "Two cards, one hallway. We did not tidy the meaning.",
      reflection: "Two cards, one hallway. We did not tidy the meaning.",
      cards: ["The Magician", "The High Priestess"],
      partnerId: "suggest-sable",
      partnerName: "Sable",
      partnerHandle: "sable",
      bond: "Quick silver",
      createdAt: now - 1000 * 60 * 50,
      reactions: reactionsFor({ claim: 1, felt: 4, sync: 2, save: 1 }),
      mine: [],
      comments: [],
    }),
    post({
      id: "starter-sable",
      author: "Sable",
      authorId: "suggest-sable",
      handle: "sable",
      sign: "Scorpio",
      kind: "note",
      title: "After the pull",
      body: "Sable kept the second card face down until morning.",
      cards: [],
      createdAt: now - 1000 * 60 * 70,
      reactions: reactionsFor({ claim: 1, felt: 2, sync: 0, save: 1 }),
      mine: [],
      comments: [],
    }),
  ];
}

export function starterPosts(now = Date.now()): SocialPost[] {
  return [
    post({
      id: "starter-sky",
      author: "Collective Sky",
      authorId: "sky",
      handle: "sky",
      sign: "Aquarius",
      kind: "bulletin",
      title: "Today's collective sky",
      body: "The room is bright and a little restless. Take one true step before noon.",
      cards: ["The Star", "Ace of Wands", "Temperance"],
      createdAt: now - 1000 * 60 * 15,
      reactions: reactionsFor({ claim: 12, felt: 9, sync: 4, save: 3 }),
      mine: [],
      comments: [],
    }),
    post({
      id: "starter-tandem-nova",
      author: "Avery Quinn",
      authorId: VIEWER_ID,
      handle: "north",
      sign: "Aries",
      kind: "tandem",
      title: "You × Nova",
      body: "We stayed with the quiet card. Neither of us rushed the meaning.",
      reflection: "We stayed with the quiet card. Neither of us rushed the meaning.",
      cards: ["The Star", "The Moon"],
      partnerId: "starter-1",
      partnerName: "Nova",
      partnerHandle: "nova",
      bond: "Sun Trine Moon",
      createdAt: now - 1000 * 60 * 25,
      reactions: reactionsFor({ claim: 4, felt: 7, sync: 3, save: 2 }),
      mine: [],
      comments: [
        {
          id: "c-tandem",
          author: "Nova",
          body: "The Moon was the true one.",
          at: now - 1000 * 60 * 20,
        },
      ],
    }),
    post({
      id: "starter-note",
      author: "Avery Quinn",
      authorId: VIEWER_ID,
      handle: "north",
      sign: "Aries",
      kind: "note",
      title: "A note from the desk",
      body: "The work wants a cleaner edge. I am leaving the rest of the day alone.",
      cards: [],
      createdAt: now - 1000 * 60 * 80,
      reactions: reactionsFor({ claim: 3, felt: 2, sync: 0, save: 1 }),
      mine: [],
      comments: [],
    }),
    post({
      id: "starter-pull",
      author: "Avery Quinn",
      authorId: VIEWER_ID,
      handle: "north",
      sign: "Aries",
      kind: "pull",
      title: "Morning pull",
      body: "The Star, upright. Enough light to keep going without announcing it.",
      cards: ["The Star"],
      createdAt: now - 1000 * 60 * 140,
      reactions: reactionsFor({ claim: 5, felt: 4, sync: 1, save: 2 }),
      mine: [],
      comments: [],
    }),
    post({
      id: "starter-chart",
      author: "Avery Quinn",
      authorId: VIEWER_ID,
      handle: "north",
      sign: "Aries",
      kind: "chart",
      title: "Chart highlight",
      body: "Sun Aries · Moon Cancer · Rising Libra.",
      cards: [],
      createdAt: now - 1000 * 60 * 200,
      reactions: reactionsFor({ claim: 2, felt: 1, sync: 1, save: 3 }),
      mine: [],
      comments: [],
    }),
    post({
      id: "starter-number",
      author: "Avery Quinn",
      authorId: VIEWER_ID,
      handle: "north",
      sign: "Aries",
      kind: "number",
      title: "Number note",
      body: "Life Path 8. Power, ambition, the number of real-world results.",
      cards: [],
      createdAt: now - 1000 * 60 * 260,
      reactions: reactionsFor({ claim: 1, felt: 1, sync: 0, save: 2 }),
      mine: [],
      comments: [],
    }),
    post({
      id: "starter-nova",
      author: "Nova",
      authorId: "starter-1",
      handle: "nova",
      sign: "Leo",
      kind: "pull",
      title: "Morning pull",
      body: "The Sun upright. I am done shrinking the work so other people stay comfortable.",
      cards: ["The Sun"],
      createdAt: now - 1000 * 60 * 90,
      reactions: reactionsFor({ claim: 6, felt: 8, sync: 2, save: 1 }),
      mine: [],
      comments: [
        { id: "c1", author: "Ivo", body: "Felt that in the chest.", at: now - 1000 * 60 * 80 },
      ],
    }),
    post({
      id: "starter-ivo",
      author: "Ivo",
      authorId: "starter-2",
      handle: "ivo",
      sign: "Scorpio",
      kind: "note",
      title: "From the deep seat",
      body: "A small promise kept is louder than a new plan.",
      cards: [],
      createdAt: now - 1000 * 60 * 160,
      reactions: reactionsFor({ claim: 3, felt: 5, sync: 1, save: 0 }),
      mine: [],
      comments: [],
    }),
    post({
      id: "starter-maren",
      author: "Maren",
      authorId: "starter-3",
      handle: "maren",
      sign: "Libra",
      kind: "tandem",
      title: "Maren × Sol",
      body: "We named the thing we both keep postponing. It got smaller.",
      reflection: "We named the thing we both keep postponing. It got smaller.",
      cards: ["Justice", "The Lovers"],
      partnerId: "starter-4",
      partnerName: "Sol",
      partnerHandle: "sol",
      bond: "Venusian Mirror",
      createdAt: now - 1000 * 60 * 110,
      reactions: reactionsFor({ claim: 2, felt: 6, sync: 2, save: 1 }),
      mine: [],
      comments: [],
    }),
    ...starterSuggestedPosts(now),
  ];
}

const FRIEND_FLAVOR: Record<string, Partial<SocialFriend>> = {
  nova: {
    birthDate: "1991-07-14",
    mood: "Full watt",
    anthem: "Brass and daylight",
    altar: "The Sun",
    manifesto: "I am done shrinking the work so other people stay comfortable.",
    focus: "career",
    note: "The bright seat.",
  },
  ivo: {
    birthDate: "1987-11-03",
    mood: "Low and steady",
    anthem: "A single piano",
    altar: "The Moon",
    manifesto: "A small promise kept is louder than a new plan.",
    focus: "love",
  },
  maren: {
    birthDate: "1993-05-21",
    mood: "Even glass",
    anthem: "Strings, no drums",
    altar: "Justice",
    manifesto: "Name the thing, then it gets smaller.",
    focus: "general",
  },
  sol: {
    birthDate: "1995-03-30",
    mood: "Spark",
    anthem: "Open windows",
    altar: "The Chariot",
    manifesto: "Move before the room decides for you.",
    focus: "career",
  },
  kei: {
    birthDate: "1989-09-02",
    mood: "Tidy",
    anthem: "Work song",
    altar: "The Hermit",
    manifesto: "Useful, then beautiful.",
    focus: "money",
  },
  rue: {
    birthDate: "1992-02-19",
    mood: "Tide in",
    anthem: "Rain on a roof",
    altar: "The Star",
    manifesto: "Stay with the feeling until it tells the truth.",
    focus: "love",
  },
  ash: {
    birthDate: "1996-01-25",
    mood: "Future tense",
    anthem: "Night bus",
    altar: "The Star",
    manifesto: "The next room is already lit.",
    focus: "general",
  },
  juno: {
    birthDate: "1986-04-17",
    mood: "Planted",
    anthem: "Kitchen at dusk",
    altar: "The Empress",
    manifesto: "Make a place people can stay.",
    focus: "money",
  },
};

export function blankState(now = Date.now()): SocialState {
  const top = starterTop();
  return {
    posts: starterPosts(now),
    top,
    space: starterSpace(),
    friends: top.map(friend => ({ ...friend, ...(FRIEND_FLAVOR[friend.handle] ?? {}) })),
    suggested: starterSuggested(),
    seededSuggestions: true,
  };
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

function isOpenSeat(person: { handle?: string; name?: string }) {
  return person.handle === "open" || person.name === "Open seat";
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
  id?: string;
}): SocialPost {
  const now = input.now ?? Date.now();
  return {
    id: input.id ?? `post-${now}`,
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
  if (hash === "posts") return "posts";
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
    h === "posts" ||
    h === "profile" ||
    h === "details" ||
    h === "birth"
  ) {
    return { destination: "sky", sky: skyFromHash(h), reading: "quick" };
  }
  return { destination: "feed", sky: "chart", reading: "quick" };
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

function normalizeReactions(value: unknown): Record<ReactionKey, number> {
  const base = emptyReactions();
  if (!value || typeof value !== "object") return base;
  const raw = value as Partial<Record<ReactionKey, number>>;
  for (const key of REACTION_KEYS) {
    const count = raw[key];
    if (typeof count === "number" && Number.isFinite(count)) base[key] = Math.max(0, count);
  }
  return base;
}

function normalizeMine(value: unknown): ReactionKey[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is ReactionKey => REACTION_KEYS.includes(item as ReactionKey));
}

function normalizeComments(value: unknown): SocialComment[] {
  if (!Array.isArray(value)) return [];
  const comments: SocialComment[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const comment = item as Partial<SocialComment>;
    if (!comment.body || typeof comment.body !== "string") continue;
    comments.push({
      id: comment.id || `c-${comment.at ?? comments.length}`,
      author: comment.author || "You",
      body: comment.body,
      at: typeof comment.at === "number" ? comment.at : 0,
    });
  }
  return comments;
}

function normalizeKind(value: unknown): PostKind {
  return typeof value === "string" && POST_KINDS.has(value as PostKind) ? (value as PostKind) : "note";
}

function normalizePost(value: unknown): SocialPost | null {
  if (!value || typeof value !== "object") return null;
  const post = value as Partial<SocialPost>;
  if (typeof post.id !== "string" || typeof post.body !== "string") return null;
  return {
    id: post.id,
    author: post.author || "You",
    handle: post.handle || "you",
    sign: post.sign || "Aries",
    kind: normalizeKind(post.kind),
    title: post.title || "A note",
    body: post.body,
    cards: Array.isArray(post.cards) ? post.cards.filter((card): card is string => typeof card === "string") : [],
    createdAt: typeof post.createdAt === "number" ? post.createdAt : 0,
    reactions: normalizeReactions(post.reactions),
    mine: normalizeMine(post.mine),
    comments: normalizeComments(post.comments),
    authorId: typeof post.authorId === "string" ? post.authorId : undefined,
    partnerId: typeof post.partnerId === "string" ? post.partnerId : undefined,
    partnerName: typeof post.partnerName === "string" ? post.partnerName : undefined,
    partnerHandle: typeof post.partnerHandle === "string" ? post.partnerHandle : undefined,
    bond: typeof post.bond === "string" ? post.bond : undefined,
    reflection: typeof post.reflection === "string" ? post.reflection : undefined,
  };
}

function normalizeFriend(value: unknown, index: number): SocialFriend | null {
  if (!value || typeof value !== "object") return null;
  const friend = value as Partial<SocialFriend>;
  if (!friend.name || isOpenSeat(friend)) return null;
  return {
    id: friend.id || `friend-${index + 1}`,
    name: friend.name,
    handle: friend.handle || slug(friend.name),
    sun: friend.sun || "Aries",
    moon: friend.moon || "Cancer",
    rising: friend.rising || "Libra",
    vibe: friend.vibe || "Kindred",
    note: friend.note,
    birthDate: friend.birthDate,
    lifePath: friend.lifePath,
    mood: friend.mood,
    anthem: friend.anthem,
    altar: friend.altar,
    manifesto: friend.manifesto,
    focus: friend.focus,
  };
}

function friendsFromTop(top: TopFriend[]): SocialFriend[] {
  return rankedEight(top)
    .filter(seat => !isOpenSeat(seat))
    .map(seat => ({ ...seat }));
}

/** Reads older saved circles and fills friends, suggestions, and tandem posts. */
export function upgradeSocialState(raw: unknown, now = Date.now()): SocialState {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return blankState(now);
  const record = raw as Partial<SocialState>;
  const savedSpace = record.space && typeof record.space === "object" ? record.space : null;
  const space: SpaceProfile = { ...starterSpace(), ...(savedSpace ?? {}) };
  space.photoUrl = typeof space.photoUrl === "string" ? space.photoUrl : "";
  space.aiAvatarUrl = typeof space.aiAvatarUrl === "string" ? space.aiAvatarUrl : "";
  space.avatarMode = space.avatarMode === "original" ? "original" : "ai";
  if (savedSpace && !savedSpace.handle) space.handle = slug(savedSpace.name || space.name);
  if (savedSpace && !savedSpace.birthDate) delete space.birthDate;
  if (savedSpace && !savedSpace.focus) space.focus = "general";

  const top = Array.isArray(record.top) ? rankedEight(record.top) : starterTop();
  const posts = Array.isArray(record.posts)
    ? record.posts.map(normalizePost).filter((item): item is SocialPost => item !== null)
    : starterPosts(now);
  const friends = Array.isArray(record.friends)
    ? record.friends.map(normalizeFriend).filter((item): item is SocialFriend => item !== null)
    : friendsFromTop(top);
  const suggested = Array.isArray(record.suggested)
    ? record.suggested.map(normalizeFriend).filter((item): item is SocialFriend => item !== null)
    : starterSuggested().filter(
        person => !friends.some(friend => friend.id === person.id || friend.handle === person.handle),
      );

  let nextPosts = posts;
  if (record.seededSuggestions !== true) {
    const ids = new Set(nextPosts.map(item => item.id));
    nextPosts = [...nextPosts, ...starterSuggestedPosts(now).filter(item => !ids.has(item.id))];
  }

  return {
    posts: nextPosts,
    top,
    space,
    friends,
    suggested,
    seededSuggestions: true,
  };
}

export function readStoredSocial(raw: string | null, now = Date.now()): SocialState {
  if (!raw) return blankState(now);
  try {
    return upgradeSocialState(JSON.parse(raw) as unknown, now);
  } catch {
    return blankState(now);
  }
}

export function updateSpace(state: SocialState, patch: Partial<SpaceProfile>): SocialState {
  return { ...state, space: { ...state.space, ...patch } };
}

export function followingIds(state: SocialState): Set<string> {
  const ids = new Set<string>();
  for (const friend of state.friends ?? []) {
    if (!isOpenSeat(friend)) ids.add(friend.id);
  }
  for (const seat of state.top) {
    if (!isOpenSeat(seat)) ids.add(seat.id);
  }
  return ids;
}

export function postAuthorId(post: SocialPost, state: SocialState): string {
  if (post.authorId) return post.authorId;
  if (post.kind === "bulletin") return "sky";
  const handle = post.handle.trim().replace(/^@+/, "").toLowerCase();
  const viewerHandle = (state.space.handle || slug(state.space.name)).toLowerCase();
  if (handle === viewerHandle || post.author === "You" || post.author === state.space.name) return VIEWER_ID;
  const people = [...(state.friends ?? []), ...(state.suggested ?? []), ...state.top];
  const match = people.find(
    person => person.handle.toLowerCase() === handle || person.name === post.author,
  );
  return match?.id ?? `unknown:${handle}`;
}

export function overallFeed(state: SocialState): SocialPost[] {
  const ids = followingIds(state);
  return state.posts
    .filter(item => {
      if (item.kind === "bulletin") return true;
      const authorId = postAuthorId(item, state);
      return authorId === VIEWER_ID || ids.has(authorId);
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function personalFeed(state: SocialState, personId = VIEWER_ID): SocialPost[] {
  return state.posts
    .filter(item => {
      if (item.kind === "bulletin") return false;
      const authorId = postAuthorId(item, state);
      if (authorId === personId) return true;
      return item.kind === "tandem" && item.partnerId === personId;
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function filterFeed(posts: SocialPost[], filter: FeedFilter): SocialPost[] {
  if (filter === "tandem") return posts.filter(item => item.kind === "tandem");
  if (filter === "posts") return posts.filter(item => item.kind !== "tandem" && item.kind !== "bulletin");
  return posts;
}

export function addFriend(state: SocialState, id: string): SocialState {
  if ((state.friends ?? []).some(friend => friend.id === id)) return state;
  const person = (state.suggested ?? []).find(friend => friend.id === id);
  if (!person) return state;
  return {
    ...state,
    friends: [...(state.friends ?? []), person],
    suggested: (state.suggested ?? []).filter(friend => friend.id !== id),
  };
}

export function removeFriend(state: SocialState, id: string): SocialState {
  const person =
    (state.friends ?? []).find(friend => friend.id === id) ??
    state.top.find(friend => friend.id === id && !isOpenSeat(friend));
  if (!person) return state;
  const top = rankedEight(state.top).map((seat, index) => (seat.id === id ? emptySeat(index) : seat));
  const suggested = state.suggested ?? [];
  return {
    ...state,
    top,
    friends: (state.friends ?? []).filter(friend => friend.id !== id),
    suggested: suggested.some(friend => friend.id === id) ? suggested : [{ ...person }, ...suggested],
  };
}

export function seatFriend(state: SocialState, friend: TopFriend, slot = 7): SocialState {
  const withFriend = (state.suggested ?? []).some(item => item.id === friend.id)
    ? addFriend(state, friend.id)
    : (state.friends ?? []).some(item => item.id === friend.id)
      ? state
      : { ...state, friends: [...(state.friends ?? []), { ...friend }] };
  return { ...withFriend, top: upsertFriend(withFriend.top, friend, slot) };
}

export function publishToFeed(
  state: SocialState,
  input: {
    kind: PostKind;
    title: string;
    body: string;
    cards?: string[];
    partner?: TopFriend | null;
    now?: number;
    id?: string;
  },
): SocialState {
  const created = createPost({
    author: state.space.name || "You",
    handle: state.space.handle || "you",
    sign: state.space.sun,
    kind: input.kind,
    title: input.title,
    body: input.body,
    cards: input.cards,
    now: input.now,
    id: input.id,
  });
  const next: SocialPost = {
    ...created,
    authorId: VIEWER_ID,
    partnerId: input.partner?.id,
    partnerName: input.partner?.name,
    partnerHandle: input.partner?.handle,
    bond: input.partner?.vibe,
    reflection: input.kind === "tandem" ? input.body : undefined,
  };
  return { ...state, posts: [next, ...state.posts] };
}

export function findPerson(state: SocialState, id: string): SocialFriend | null {
  if (!id || id === VIEWER_ID) return null;
  return (
    (state.friends ?? []).find(person => person.id === id) ??
    (state.suggested ?? []).find(person => person.id === id) ??
    state.top.find(person => person.id === id && !isOpenSeat(person)) ??
    null
  );
}

export function previewCircle(state: SocialState, person: SocialFriend): TopFriend[] {
  const you: TopFriend = {
    id: VIEWER_ID,
    name: "You",
    handle: state.space.handle || "you",
    sun: state.space.sun,
    moon: state.space.moon,
    rising: state.space.rising,
    vibe: person.vibe || "Kindred",
  };
  const others = [...(state.friends ?? []), ...(state.suggested ?? [])].filter(item => item.id !== person.id);
  return rankedEight([you, ...others]);
}

const SKY_HASHES = new Set(["sky", "chart", "numbers", "constellation", "profile", "details", "birth"]);

export function circleViewFromHash(hash: string): "feed" | "sky" | "friends" {
  const key = hash.replace(/^#/, "");
  if (key === "friends") return "friends";
  if (SKY_HASHES.has(key)) return "sky";
  return "feed";
}

export function profileCategoryFromHash(hash: string): ProfileCategory {
  const key = hash.replace(/^#/, "");
  if (key === "numbers") return "numbers";
  if (key === "constellation" || key === "friends") return "constellation";
  return "chart";
}

export function detailsHashOpen(hash: string) {
  const key = hash.replace(/^#/, "");
  return key === "profile" || key === "details" || key === "birth";
}
