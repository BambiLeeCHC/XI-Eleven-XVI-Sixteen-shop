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
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  moveTop,
  MY_CONSTELLATION_LABEL,
  MY_SKY_LABEL,
  NORTH_SOCIAL_SKY_TAB,
  NORTH_SOCIAL_STORAGE_KEY,
  promoteTop,
  rankedEight,
  starterTop,
  toggleReaction,
  upsertFriend,
} from "../src/lib/northSocial.js";
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

function check(name: string, fn: () => void) {
  fn();
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

check("My Sky and My Constellation name the profile and ranked seats", () => {
  assert.equal(MY_SKY_LABEL, "My Sky");
  assert.equal(MY_CONSTELLATION_LABEL, "My Constellation");
  assert.equal(NORTH_SOCIAL_SKY_TAB, "My Sky & My Constellation");
  assert.equal(NORTH_SOCIAL_STORAGE_KEY, "xixvi-north-social-v1");
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const page = readFileSync(join(root, "src/pages/NorthSocialPage.tsx"), "utf8");
  const css = readFileSync(join(root, "src/north-social.css"), "utf8");
  assert.match(page, /MY_SKY_LABEL/);
  assert.match(page, /MY_CONSTELLATION_LABEL/);
  assert.match(page, /NORTH_SOCIAL_SKY_TAB/);
  assert.match(page, /NORTH_SOCIAL_STORAGE_KEY/);
  assert.match(page, /Make #1/);
  assert.match(page, /#1 Star/);
  assert.match(page, /Move down/);
  assert.match(page, /Sun · Moon · Rising/);
  const banned = new RegExp(
    [
      "MySpace",
      ["My", "Space"].join(" "),
      ["My", "space"].join(" "),
      ["Top", "8"].join(" "),
    ].join("|"),
  );
  assert.equal(banned.test(page), false);
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

console.log(`\n${passed} tests passed`);
