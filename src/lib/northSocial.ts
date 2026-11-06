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
};

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

export function upsertFriend(list: TopFriend[], friend: TopFriend, slot: number): TopFriend[] {
  const next = list.slice(0, 8);
  while (next.length < 8) {
    next.push({
      id: `empty-${next.length}`,
      name: "Open seat",
      handle: "open",
      sun: "—",
      moon: "—",
      rising: "—",
      vibe: "Waiting",
    });
  }
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
