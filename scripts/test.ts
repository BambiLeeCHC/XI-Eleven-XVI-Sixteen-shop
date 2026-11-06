import assert from "node:assert/strict";
import {
  longReadEntitled,
  shouldStartPaidCheckout,
  TRUE_NORTH_FREE_ACCESS,
} from "../src/lib/freeAccess.js";
import {
  parseNorthProfile,
  toPublicNorthProfile,
} from "../src/lib/northProfile.js";
import {
  angularSeparation,
  houseForLongitude,
  longitudeOnArc,
  signAtLongitude,
  tightestAspects,
} from "../src/lib/chartGeometry.js";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  addFriend,
  blankState,
  circleViewFromHash,
  filterFeed,
  moveTop,
  MY_CONSTELLATION_LABEL,
  MY_SKY_LABEL,
  NORTH_SOCIAL_SKY_TAB,
  NORTH_SOCIAL_STORAGE_KEY,
  FEED_FILTERS,
  overallFeed,
  personalFeed,
  PROFILE_CATEGORIES,
  profileCategoryFromHash,
  promoteTop,
  publishToFeed,
  rankedEight,
  removeFriend,
  resolveTrueNorthView,
  starterSpace,
  starterTop,
  syncNorthAvatar,
  toggleReaction,
  upgradeSocialState,
  upsertFriend,
  activeAvatarUrl,
} from "../src/lib/northSocial.js";
import { celestialPortraitSvg, ELEMENT_AURA, styleLabel } from "../src/lib/celestialAvatar.js";
import { parseAvatarRequest } from "../api/_lib/avatar.ts";
import { localHour, paletteForHour, skyAt } from "../src/lib/skyMode.js";
import { nextEnabledIndex, ringStep, wrapIndex } from "../src/lib/radialDial.js";
import {
  canAnswerSession,
  canCloseSession,
  canContribute,
  canInvite,
  canOpenSession,
  canRespondConnection,
  canRevokeConnection,
  composeTandemReading,
  TANDEM_SENDS_EMAIL,
} from "../src/lib/tandem.js";

let passed = 0;

const pending: Promise<unknown>[] = [];

function check(name: string, fn: () => void | Promise<void>) {
  const result = fn();
  if (result instanceof Promise) {
    pending.push(result.then(() => {
      passed += 1;
      console.log(`ok ${name}`);
    }));
    return;
  }
  passed += 1;
  console.log(`ok ${name}`);
}

check("open access entitles a signed-in reader without a subscription", () => {
  const result = longReadEntitled({
    isAdmin: false,
    subscriptionStatus: "none",
    readingsThisWeek: 9,
  });
  assert.equal(result.entitled, true);
  assert.equal(result.via, "open_access");
  assert.equal(result.openAccess, true);
  assert.equal(shouldStartPaidCheckout(), false);
});

check("turning the flag off restores the weekly quota and paywall", () => {
  const within = longReadEntitled({
    freeAccess: false,
    isAdmin: false,
    subscriptionStatus: "none",
    readingsThisWeek: 2,
  });
  const blocked = longReadEntitled({
    freeAccess: false,
    isAdmin: false,
    subscriptionStatus: "canceled",
    readingsThisWeek: 3,
  });
  const subscribed = longReadEntitled({
    freeAccess: false,
    isAdmin: false,
    subscriptionStatus: "active",
    readingsThisWeek: 20,
  });
  assert.equal(within.via, "free_quota");
  assert.equal(blocked.entitled, false);
  assert.equal(blocked.via, "paywall");
  assert.equal(subscribed.via, "subscription");
  assert.equal(shouldStartPaidCheckout(false), true);
  assert.equal(TRUE_NORTH_FREE_ACCESS, true);
});

check("profile edits keep a public shape and reject private overflow", () => {
  const parsed = parseNorthProfile({
    name: "  Ada  ",
    focus: "love",
    note: "Looking toward the work.",
    birthDate: "1990-04-02",
    birthTime: "07:30",
    birthLocation: "Chapel Hill, NC",
  });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.value.name, "Ada");
  assert.equal(parsed.value.note, "Looking toward the work.");

  assert.equal(parseNorthProfile({ name: "", focus: "general" }).ok, false);
  assert.equal(parseNorthProfile({ name: "Ada", focus: "fate" }).ok, false);
  assert.equal(
    parseNorthProfile({ name: "Ada", focus: "career", note: "x".repeat(281) })
      .ok,
    false,
  );

  const pub = toPublicNorthProfile({
    id: "u1",
    name: "Ada",
    focus: "love",
    note: "Hello",
    sign: "Aries",
  });
  assert.deepEqual(Object.keys(pub).sort(), [
    "focus",
    "id",
    "name",
    "note",
    "sign",
  ]);
  assert.equal("email" in pub, false);
  assert.equal("birthDate" in pub, false);
});

check(
  "tandem permissions require the invited person and an accepted connection",
  () => {
    assert.equal(TANDEM_SENDS_EMAIL, false);
    assert.equal(
      canInvite({
        actorId: "a",
        targetId: "a",
        existingStatus: null,
        actorIsAddressee: false,
      }).ok,
      false,
    );
    assert.equal(
      canInvite({
        actorId: "a",
        targetId: "b",
        existingStatus: "pending",
        actorIsAddressee: true,
      }).code,
      "awaiting_you",
    );
    assert.equal(
      canInvite({
        actorId: "a",
        targetId: "b",
        existingStatus: "revoked",
        actorIsAddressee: false,
      }).ok,
      true,
    );

    assert.equal(
      canRespondConnection({
        actorId: "a",
        addresseeId: "b",
        status: "pending",
      }).ok,
      false,
    );
    assert.equal(
      canRespondConnection({
        actorId: "b",
        addresseeId: "b",
        status: "pending",
      }).ok,
      true,
    );
    assert.equal(
      canRespondConnection({
        actorId: "b",
        addresseeId: "b",
        status: "accepted",
      }).ok,
      false,
    );

    assert.equal(
      canRevokeConnection({
        actorId: "c",
        requesterId: "a",
        addresseeId: "b",
        status: "accepted",
      }).ok,
      false,
    );
    assert.equal(
      canOpenSession({
        actorId: "a",
        requesterId: "a",
        addresseeId: "b",
        connectionStatus: "pending",
        openSession: false,
      }).ok,
      false,
    );
    assert.equal(
      canOpenSession({
        actorId: "a",
        requesterId: "a",
        addresseeId: "b",
        connectionStatus: "accepted",
        openSession: true,
      }).code,
      "session_open",
    );

    assert.equal(
      canAnswerSession({ actorId: "a", guestId: "b", status: "invited" }).ok,
      false,
    );
    assert.equal(
      canAnswerSession({ actorId: "b", guestId: "b", status: "invited" }).ok,
      true,
    );
    assert.equal(
      canContribute({
        actorId: "c",
        hostId: "a",
        guestId: "b",
        status: "active",
        alreadyContributed: false,
      }).ok,
      false,
    );
    assert.equal(
      canContribute({
        actorId: "a",
        hostId: "a",
        guestId: "b",
        status: "invited",
        alreadyContributed: false,
      }).code,
      "not_active",
    );
    assert.equal(
      canContribute({
        actorId: "a",
        hostId: "a",
        guestId: "b",
        status: "active",
        alreadyContributed: true,
      }).code,
      "already_contributed",
    );
    assert.equal(
      canCloseSession({
        actorId: "b",
        hostId: "a",
        guestId: "b",
        status: "invited",
      }).code,
      "not_host",
    );
    assert.equal(
      canCloseSession({
        actorId: "a",
        hostId: "a",
        guestId: "b",
        status: "active",
      }).ok,
      true,
    );
  },
);

check(
  "a shared tandem result contains both consented sides and nothing else",
  () => {
    const text = composeTandemReading({
      focus: "career",
      prompt: "What are we walking toward?",
      hostName: "Ada",
      hostBody: "The next room.",
      guestName: "Bea",
      guestBody: "The door we already have.",
    });
    assert.match(text, /Ada/);
    assert.match(text, /Bea/);
    assert.match(text, /The next room/);
    assert.match(text, /The door we already have/);
    assert.doesNotMatch(text, /@/);
  },
);

check("the size dial spaces six sizes evenly and skips unavailable colors", () => {
  assert.equal(ringStep(6), 60);
  assert.equal(ringStep(0), 0);
  assert.equal(wrapIndex(0, -1, 6), 5);
  assert.equal(nextEnabledIndex(0, 1, [true, false, true]), 2);
  assert.equal(nextEnabledIndex(2, 1, [false, false, true]), 2);
  assert.equal(nextEnabledIndex(0, 1, [false, false]), -1);
});

check("houses, placements, and aspects share one ecliptic cut", () => {
  assert.equal(signAtLongitude(0).sign, "Aries");
  assert.equal(signAtLongitude(29.99).sign, "Aries");
  assert.equal(signAtLongitude(30).sign, "Taurus");
  assert.equal(signAtLongitude(359).sign, "Pisces");
  assert.equal(signAtLongitude(-1).sign, "Pisces");
  assert.equal(longitudeOnArc(15, 10, 40), true);
  assert.equal(longitudeOnArc(0, 340, 10), true);
  assert.equal(longitudeOnArc(20, 340, 10), false);

  const cusps = Array.from({ length: 12 }, (_, i) => (10 + i * 30) % 360);
  assert.equal(houseForLongitude(15, cusps), 1);
  assert.equal(houseForLongitude(0, cusps), 12);
  assert.equal(signAtLongitude(cusps[0] ?? 0).sign, "Aries");
  assert.equal(signAtLongitude(15).sign, "Aries");

  const aspects = tightestAspects([
    { name: "Sun", longitude: 10 },
    { name: "Moon", longitude: 10.4 },
    { name: "Mars", longitude: 100 },
    { name: "Venus", longitude: 50 },
  ]);
  assert.equal(aspects[0]?.aspect, "square");
  assert.equal(aspects[0]?.orb, 0);
  assert.equal(
    aspects.find(item => item.bodyA === "Sun" && item.bodyB === "Moon")?.aspect,
    "conjunction",
  );
  assert.equal(aspects.some(item => item.bodyB === "Venus"), false);
  assert.ok(aspects.every((item, index) => index === 0 || item.orb >= (aspects[index - 1]?.orb ?? 0)));
  assert.equal(Math.round(angularSeparation(10, 350) * 10) / 10, 20);
});

check("My Sky holds Chart, Numbers, and My Constellation", () => {
  assert.equal(MY_SKY_LABEL, "My Sky");
  assert.equal(MY_CONSTELLATION_LABEL, "My Constellation");
  assert.equal(NORTH_SOCIAL_SKY_TAB, "My Sky & My Constellation");
  assert.equal(NORTH_SOCIAL_STORAGE_KEY, "xixvi-north-social-v1");
  assert.deepEqual(
    PROFILE_CATEGORIES.map(item => item.label),
    ["Chart", "Numbers", "My Constellation"],
  );
  assert.deepEqual(
    FEED_FILTERS.map(item => item.label),
    ["All", "Posts & Pulls", "Tandem Readings"],
  );
  assert.equal(circleViewFromHash("#numbers"), "sky");
  assert.equal(circleViewFromHash("#constellation"), "sky");
  assert.equal(circleViewFromHash("#friends"), "friends");
  assert.equal(circleViewFromHash(""), "feed");
  assert.equal(profileCategoryFromHash("#numbers"), "numbers");
  assert.equal(profileCategoryFromHash("#constellation"), "constellation");
  assert.equal(profileCategoryFromHash("#chart"), "chart");
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const page = readFileSync(join(root, "src/pages/NorthSocialPage.tsx"), "utf8");
  const profile = readFileSync(join(root, "src/components/north/PersonalProfile.tsx"), "utf8");
  const nav = readFileSync(join(root, "src/pages/chart/shared.tsx"), "utf8");
  const css = readFileSync(join(root, "src/north-social.css"), "utf8");
  const feed = readFileSync(join(root, "src/components/north/SocialFeed.tsx"), "utf8");
  const surface = `${page}\n${profile}\n${feed}`;
  assert.match(profile, /MY_SKY_LABEL/);
  assert.match(profile, /MY_CONSTELLATION_LABEL/);
  assert.match(profile, /PROFILE_CATEGORIES/);
  assert.match(page, /NORTH_SOCIAL_STORAGE_KEY|useNorthSocial/);
  assert.equal(surface.includes(NORTH_SOCIAL_SKY_TAB), false);
  assert.match(profile, /Make #1/);
  assert.match(profile, /#1 Star/);
  assert.match(profile, /Move down/);
  assert.match(profile, /Sun · Moon · Rising/);
  assert.match(profile, /Share chart highlight/);
  assert.match(profile, /Share number note/);
  assert.match(profile, /Replace seat #8/);
  assert.match(profile, /Edit details \/ birth data/);
  assert.match(feed, /FEED_FILTERS/);
  assert.match(surface, /\+ Add Friend/);
  assert.match(nav, /label: "Feed"/);
  assert.match(nav, /MY_SKY_LABEL|label: "My Sky"/);
  assert.match(nav, /label: "Readings"/);
  assert.equal(/almanac/i.test(nav), false);
  assert.equal(nav.includes(NORTH_SOCIAL_SKY_TAB), false);
  const banned = new RegExp(
    [
      "MySpace",
      ["My", "Space"].join(" "),
      ["My", "space"].join(" "),
      ["Top", "8"].join(" "),
    ].join("|"),
  );
  assert.equal(banned.test(surface), false);
  assert.equal(banned.test(css), false);
  assert.equal(banned.test(readFileSync(join(root, "src/lib/northSocial.ts"), "utf8")), false);

  const top = starterTop();
  assert.equal(top.length, 8);
  const first = promoteTop(top, 3);
  assert.equal(first[0]?.handle, top[3]?.handle);
  assert.equal(first.length, 8);
  const swapped = moveTop(top, 1, -1);
  assert.equal(swapped[0]?.id, top[1]?.id);
  assert.equal(swapped[1]?.id, top[0]?.id);
  const down = moveTop(top, 0, 1);
  assert.equal(down[0]?.id, top[1]?.id);
  assert.equal(down[1]?.id, top[0]?.id);
  const replaced = upsertFriend(
    top,
    {
      id: "new",
      name: "Wren",
      handle: "wren",
      sun: "Leo",
      moon: "Aries",
      rising: "Gemini",
      vibe: "Chosen",
    },
    7,
  );
  assert.equal(replaced[7]?.name, "Wren");
  assert.equal(replaced.length, 8);
  assert.equal(rankedEight(top.slice(0, 2))[2]?.name, "Open seat");
  const post = {
    id: "p",
    author: "You",
    handle: "you",
    sign: "Aries",
    kind: "pull" as const,
    title: "Pull",
    body: "Hi",
    cards: [],
    createdAt: 1,
    reactions: { claim: 1, felt: 0, sync: 0, save: 0 },
    mine: [] as const,
    comments: [],
  };
  const next = toggleReaction({ ...post, mine: [] }, "claim");
  assert.equal(next.reactions.claim, 2);
});

check("personal posts and tandem readings roll into the overall feed through the friends list", () => {
  const state = blankState(1_700_000_000_000);
  const personal = personalFeed(state);
  const overall = overallFeed(state);
  assert.ok(personal.some(item => item.kind === "tandem" && item.partnerName === "Nova"));
  assert.ok(personal.some(item => item.kind === "note" || item.kind === "pull"));
  assert.equal(personal.some(item => item.kind === "bulletin"), false);
  assert.ok(overall.some(item => item.authorId === "me"));
  assert.ok(overall.some(item => item.kind === "tandem"));
  assert.ok(overall.some(item => item.kind === "bulletin"));
  assert.ok(overall.some(item => item.handle === "nova"));
  assert.equal(overall.some(item => item.handle === "ori"), false);
  assert.ok(filterFeed(personal, "tandem").every(item => item.kind === "tandem"));
  assert.ok(filterFeed(personal, "tandem").length > 0);
  assert.ok(filterFeed(personal, "posts").every(item => item.kind !== "tandem"));
  assert.equal(filterFeed(personal, "all").length, personal.length);

  const added = addFriend(state, "suggest-ori");
  const withOri = overallFeed(added);
  assert.ok(added.friends?.some(friend => friend.id === "suggest-ori"));
  assert.equal(added.suggested?.some(friend => friend.id === "suggest-ori"), false);
  assert.ok(withOri.some(item => item.handle === "ori" && item.kind === "pull"));
  assert.ok(withOri.some(item => item.handle === "ori" && item.kind === "tandem"));

  const removed = removeFriend(added, "suggest-ori");
  assert.equal(overallFeed(removed).some(item => item.handle === "ori"), false);
  assert.equal(removed.top.some(seat => seat.id === "suggest-ori"), false);

  const published = publishToFeed(state, {
    kind: "note",
    title: "Sky note",
    body: "Posted from the profile.",
    now: 42,
  });
  assert.ok(personalFeed(published).some(item => item.body === "Posted from the profile."));
  assert.ok(overallFeed(published).some(item => item.body === "Posted from the profile."));

  const legacy = upgradeSocialState(
    {
      posts: [
        {
          id: "keep-me",
          author: "Ada",
          handle: "ada",
          sign: "Aries",
          kind: "note",
          title: "Kept",
          body: "Still here",
          cards: [],
          createdAt: 10,
          reactions: { claim: 0, felt: 0, sync: 0, save: 0 },
          mine: [],
          comments: [],
        },
      ],
      top: starterTop(),
      space: { ...starterSpace(), name: "Ada", mood: "Quiet", handle: "ada" },
    },
    1000,
  );
  assert.equal(legacy.space.name, "Ada");
  assert.equal(legacy.space.mood, "Quiet");
  assert.equal(NORTH_SOCIAL_STORAGE_KEY, "xixvi-north-social-v1");
  assert.ok(legacy.posts.some(item => item.id === "keep-me" && item.body === "Still here"));
  assert.equal(legacy.friends?.length, 8);
  assert.ok(legacy.suggested?.some(friend => friend.handle === "ori"));
  assert.ok(legacy.posts.some(item => item.id === "starter-ori"));
  assert.equal(overallFeed(legacy).some(item => item.handle === "ori"), false);
  assert.ok(overallFeed(legacy).some(item => item.id === "keep-me"));
});

check("local hour paints the sky and the clouds without a mode bar", () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const night = paletteForHour(22);
  const dusk = paletteForHour(18.2);
  const dawn = paletteForHour(6.6);
  const day = paletteForHour(13);
  const twilight = paletteForHour(20.2);
  assert.equal(night.phase, "astral");
  assert.equal(dusk.phase, "dusk");
  assert.equal(dawn.phase, "dawn");
  assert.equal(day.phase, "day");
  assert.equal(twilight.phase, "twilight");
  assert.equal(day.isDay, true);
  assert.equal(night.isDay, false);
  assert.equal(day.showStars, false);
  assert.equal(night.showStars, true);
  assert.match(night.gradient, /#050510/);
  assert.match(dusk.gradient, /#f0a858/);
  assert.match(dawn.gradient, /#e7b0c4/);
  assert.match(day.gradient, /#c5e4fb/);
  assert.ok(night.cloud.opacity < day.cloud.opacity);
  assert.ok(night.moonOpacity > day.moonOpacity);
  assert.notEqual(night.cloud.filter, day.cloud.filter);
  assert.notEqual(dusk.cloud.filter, dawn.cloud.filter);
  assert.match(night.cloud.filter, /hue-rotate\(205deg\)/);
  assert.match(dusk.cloud.filter, /sepia/);
  assert.match(dawn.cloud.filter, /hue-rotate\(305deg\)/);
  assert.match(day.cloud.filter, /hue-rotate\(188deg\)/);
  assert.equal(night.cloud.blendMode, "screen");
  assert.equal(day.cloud.blendMode, "soft-light");
  const evening = new Date(2026, 0, 2, 23, 30, 0);
  const seen = skyAt(evening);
  assert.equal(localHour(evening), 23.5);
  assert.equal(seen.phase, "astral");
  assert.ok(seen.hour >= 23.5 && seen.hour < 23.51);
  assert.equal(paletteForHour(25).phase, paletteForHour(1).phase);

  const live = readFileSync(join(root, "src/components/LiveSky.tsx"), "utf8");
  const css = readFileSync(join(root, "src/live-sky.css"), "utf8");
  const craft = readFileSync(join(root, "src/components/sky/NorthCraft.tsx"), "utf8");
  assert.equal(live.includes("xsky-pill"), false);
  assert.equal(css.includes("xsky-pill"), false);
  assert.equal(css.includes("padding-top: 3rem"), false);
  assert.equal(live.toLowerCase().includes("willow"), false);
  assert.equal(css.includes("xsky__jet"), false);
  assert.equal(live.includes("open-meteo"), false);
  assert.equal(live.includes("America/New_York"), false);
  assert.match(live, /skyAt/);
  assert.match(craft, /XIXVI · TRUE NORTH/);
  assert.match(live, /AstrolabeAirship/);
  assert.match(live, /CrescentGondola/);
  assert.match(live, /CelestialMoth/);
  for (const name of [
    "willow-jet.webp",
    "willow-blimp.webp",
    "willow-rocket.webp",
    "willow-ufo.webp",
  ]) {
    assert.equal(existsSync(join(root, "public", name)), false);
  }
});

check("True North is a three-room shell and avatars upgrade cleanly", () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const shared = readFileSync(join(root, "src/pages/chart/shared.tsx"), "utf8");
  const app = readFileSync(join(root, "src/App.tsx"), "utf8");
  const page = readFileSync(join(root, "src/pages/NorthSocialPage.tsx"), "utf8");
  const avatarApi = readFileSync(join(root, "api/_lib/avatar.ts"), "utf8");
  const chartApi = readFileSync(join(root, "api/chart.ts"), "utf8");
  const vercel = readFileSync(join(root, "vercel.json"), "utf8");
  const apiFiles = readdirSync(join(root, "api")).filter(name => name.endsWith(".ts"));
  assert.ok(apiFiles.length <= 12);
  assert.equal(apiFiles.includes("avatar.ts"), false);
  assert.match(chartApi, /action === "avatar"|requestedAction\(req\) === "avatar"/);
  assert.match(vercel, /\/api\/avatar/);
  assert.match(vercel, /\/api\/chart\?action=avatar/);
  assert.equal(/almanac/i.test(shared), false);
  assert.match(shared, /label: "Feed"/);
  assert.match(shared, /label: "Readings"/);
  assert.match(shared, /MY_SKY_LABEL/);
  assert.match(app, /path="\/chart\/almanac" element={<Navigate to="\/chart" replace \/>}/);
  assert.match(app, /path="\/chart\/numbers" element={<Navigate to="\/chart#numbers" replace \/>}/);
  assert.equal(page.split("<TrueNorthNav").length - 1, 1);
  assert.match(page, /Quick Pull/);
  assert.match(page, /Deep Spread/);
  assert.match(page, /Live Tandem/);
  assert.match(page, /Find Friends/);
  assert.match(page, /AI Avatar/);
  assert.equal(/Almanac/.test(page), false);
  assert.equal(resolveTrueNorthView("/chart", "").destination, "feed");
  assert.equal(resolveTrueNorthView("/chart", "#sky").destination, "sky");
  assert.equal(resolveTrueNorthView("/chart", "#numbers").sky, "numbers");
  assert.equal(resolveTrueNorthView("/profile", "#constellation").destination, "sky");
  assert.equal(resolveTrueNorthView("/profile", "#constellation").sky, "constellation");
  assert.equal(resolveTrueNorthView("/chart/long-read", "").reading, "deep");
  assert.equal(resolveTrueNorthView("/chart/circle", "").reading, "tandem");
  assert.equal(resolveTrueNorthView("/chart#readings".split("#")[0] ?? "", "#readings").destination, "readings");

  const upgraded = upgradeSocialState({
    posts: [],
    top: starterTop().slice(0, 2),
    space: {
      name: "Ada",
      manifesto: "Kept",
      mood: "Bright",
      anthem: "Night",
      altar: "The Star",
      aura: "lilac",
      sun: "Leo",
      moon: "Aries",
      rising: "Gemini",
      lifePath: "7",
    },
  });
  assert.equal(upgraded.space.name, "Ada");
  assert.equal(upgraded.space.manifesto, "Kept");
  assert.equal(upgraded.space.avatarMode, "ai");
  assert.equal(upgraded.space.photoUrl, "");
  assert.equal(upgraded.space.aiAvatarUrl, "");
  assert.equal(upgraded.top.length, 8);
  assert.equal(upgraded.top[2]?.name, "Open seat");
  const withPortrait = {
    ...starterSpace(),
    photoUrl: "data:image/jpeg;base64,abc",
    aiAvatarUrl: "data:image/webp;base64,zzz",
    avatarMode: "ai" as const,
  };
  assert.equal(activeAvatarUrl(withPortrait), "data:image/webp;base64,zzz");
  assert.equal(activeAvatarUrl({ ...withPortrait, avatarMode: "original" }), "data:image/jpeg;base64,abc");
  assert.match(celestialPortraitSvg("Nova", "Leo"), /^data:image\/svg\+xml/);
  assert.match(decodeURIComponent(celestialPortraitSvg("Nova", "Leo")), /Leo|♌/);
  assert.equal(styleLabel("engraving"), "Tarot Engraving");
  assert.equal(ELEMENT_AURA.earth, "#d8f0c4");
  assert.match(avatarApi, /gemini-2\.5-flash-image/);
  assert.match(avatarApi, /gpt-4o-mini/);
  assert.match(avatarApi, /grok-2-image/);
  assert.match(avatarApi, /fallback: true/);
  const tiny = `data:image/jpeg;base64,${"a".repeat(40)}`;
  const parsed = parseAvatarRequest({ imageDataUrl: tiny, name: "Ada", sun: "Leo", style: "glass" });
  assert.equal(parsed.ok, true);
  if (parsed.ok) assert.equal(parsed.value.style, "glass");
  assert.equal(parseAvatarRequest({ imageDataUrl: "nope" }).ok, false);
  assert.equal(parseAvatarRequest({ imageDataUrl: `${tiny}${"a".repeat(2_000_000)}` }).ok, false);

  let synced = false;
  const ok = syncNorthAvatar(
    {
      from: () => ({
        update: () => ({
          eq: async () => {
            synced = true;
            return { error: null };
          },
        }),
      }),
    },
    "user-1",
    starterSpace(),
  );
  return ok.then(result => {
    assert.equal(result, true);
    assert.equal(synced, true);
  }).then(() => syncNorthAvatar(
    {
      from: () => ({
        update: () => ({
          eq: async () => ({ error: { message: "column north_photo_url does not exist" } }),
        }),
      }),
    },
    "user-1",
    starterSpace(),
  )).then(missing => {
    assert.equal(missing, false);
  });
});

await Promise.all(pending);
console.log(`\n${passed} tests passed`);
