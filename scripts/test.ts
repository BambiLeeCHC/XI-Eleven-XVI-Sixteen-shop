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

console.log(`\n${passed} tests passed`);
