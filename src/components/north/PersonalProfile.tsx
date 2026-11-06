import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { TrueNorthSignIcon } from "../journal/TrueNorthGlyphs";
import { api, useAuthStatus, useQuery } from "../../lib/backend";
import {
  MY_CONSTELLATION_LABEL,
  MY_SKY_LABEL,
  PROFILE_CATEGORIES,
  VIEWER_ID,
  addFriend,
  detailsHashOpen,
  findPerson,
  moveTop,
  personalFeed,
  previewCircle,
  profileCategoryFromHash,
  promoteTop,
  publishToFeed,
  rankedEight,
  removeFriend,
  seatFriend,
  updateSpace,
  type SocialFriend,
  type SocialState,
  type TopFriend,
} from "../../lib/northSocial";
import {
  expressionNumber,
  fullNumerologyProfile,
  lifePathNumber,
  personalityNumber,
  soulUrgeNumber,
  NUMBER_MEANINGS,
} from "../../lib/numerology";
import { ChartHomePage } from "../../pages/chart/ChartHomePage";
import { NumbersPage } from "../../pages/chart/NumbersPage";
import { ProfileEditor } from "../../pages/chart/ProfileEditor";

type ProfileAccount = {
  _id?: string;
  name?: string;
  email?: string;
  northNote?: string;
  northFocus?: string;
  northOnboardedAt?: string | null;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  photoUrl?: string;
  aiAvatarUrl?: string;
  avatarMode?: string;
};
import { NumberRow, type NatalChartResult } from "../../pages/chart/shared";
import { FilteredFeed, PersonalComposer } from "./SocialFeed";

function focusLabel(value: string) {
  if (value === "career") return "Career";
  if (value === "love") return "Love";
  if (value === "money") return "Money";
  return "General";
}

function atHandle(handle: string) {
  return `@${handle.trim().replace(/^@+/, "")}`;
}

function LocalNumbers({ name, birthDate, lifePath }: { name: string; birthDate?: string; lifePath: string }) {
  if (!birthDate) {
    const expression = expressionNumber(name);
    const soul = soulUrgeNumber(name);
    const personality = personalityNumber(name);
    return (
      <div className="tn-card tn-numbers-wrap" id="numbers">
        <p className="tn-sky__note">Add a birth date to open Birthday, Personal Year, and Life Path from the calendar. The name still has a voice.</p>
        <div className="chart-numbers-grid tn-numbers">
          <NumberRow numKey="lifePath" value={Number(lifePath) || 0} />
          <NumberRow numKey="expression" value={expression} />
          <NumberRow numKey="soulUrge" value={soul} />
          <NumberRow numKey="personality" value={personality} />
        </div>
      </div>
    );
  }
  const numbers = fullNumerologyProfile(name, birthDate);
  return (
    <div className="tn-card tn-numbers-wrap" id="numbers">
      <div className="chart-numbers-grid tn-numbers">
        <NumberRow numKey="lifePath" value={numbers.lifePath} />
        <NumberRow numKey="expression" value={numbers.expression} />
        <NumberRow numKey="soulUrge" value={numbers.soulUrge} />
        <NumberRow numKey="personality" value={numbers.personality} />
        <NumberRow numKey="birthday" value={numbers.birthday} />
        <NumberRow numKey="personalYear" value={numbers.personalYear} />
      </div>
    </div>
  );
}

function ConstellationSeat({
  person,
  index,
  editable,
  onPromote,
  onMove,
  onOpen,
  onTandem,
}: {
  person: TopFriend;
  index: number;
  editable: boolean;
  onPromote: () => void;
  onMove: (direction: -1 | 1) => void;
  onOpen: () => void;
  onTandem: () => void;
}) {
  const rank = index + 1;
  const first = rank === 1;
  const open = person.handle === "open" || person.name === "Open seat";
  return (
    <li className={first && !open ? "constellation__seat constellation__seat--star" : "constellation__seat"}>
      <div className="constellation__rank">
        {first && !open ? (
          <svg className="constellation__mark" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M12 1.8 14.7 8.6 22 9.2 16.6 14.1 18.3 21.4 12 17.6 5.7 21.4 7.4 14.1 2 9.2 9.3 8.6Z" />
          </svg>
        ) : null}
        <span>#{rank}</span>
      </div>
      {open ? (
        <strong className="constellation__name">Open seat</strong>
      ) : (
        <button type="button" className="constellation__name constellation__open" onClick={onOpen}>
          {person.name}
        </button>
      )}
      <span className="constellation__handle">{open ? "Empty" : atHandle(person.handle)}</span>
      {!open && (
        <p className="constellation__big3">
          <span className="constellation__big3-label">Sun · Moon · Rising</span>
          <span>{person.sun} · {person.moon} · {person.rising}</span>
        </p>
      )}
      <span className="constellation__vibe">{person.vibe}</span>
      {editable && !open && (
        <div className="constellation__actions">
          {first ? (
            <span className="constellation__star-pill">#1 Star</span>
          ) : (
            <button type="button" className="cta-ghost tn-action" onClick={onPromote} aria-label={`Make ${person.name} #1`}>
              Make #1
            </button>
          )}
          <button type="button" className="cta-ghost tn-action" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Move ${person.name} up`}>
            Move up
          </button>
          <button type="button" className="cta-ghost tn-action" onClick={() => onMove(1)} disabled={index === 7} aria-label={`Move ${person.name} down`}>
            Move down
          </button>
          <button type="button" className="cta-pist tn-action" onClick={onTandem} aria-label={`Tandem with ${person.name}`}>
            Tandem
          </button>
        </div>
      )}
    </li>
  );
}

export function FriendsBoard({
  state,
  update,
  onOpen,
}: {
  state: SocialState;
  update: (next: (current: SocialState) => SocialState) => void;
  onOpen: (id: string) => void;
}) {
  const friends = (state.friends ?? []).filter(friend => friend.handle !== "open");
  const suggested = state.suggested ?? [];
  const toggle = (person: SocialFriend, following: boolean) => {
    update(current => (following ? removeFriend(current, person.id) : addFriend(current, person.id)));
  };
  return (
    <div className="friend-board-wrap" id="friends-list">
      <section className="tn-card" aria-labelledby="friends-heading">
        <h3 id="friends-heading" className="clash north-post__title">Friends list</h3>
        <p className="serif-quiet tn-lede">
          People you follow. Their posts and tandem readings join the overall feed as soon as you add them.
        </p>
        <ul className="friend-board">
          {friends.length === 0 && <li className="tn-meta">No one followed yet.</li>}
          {friends.map(person => (
            <li key={person.id} className="friend-row">
              <button type="button" className="friend-row__name" onClick={() => onOpen(person.id)}>
                {person.name}
              </button>
              <button
                type="button"
                className="cta-ghost tn-action is-on"
                aria-pressed="true"
                aria-label={`Unfollow ${person.name}`}
                onClick={() => toggle(person, true)}
              >
                Following
              </button>
              <span className="friend-row__meta tn-meta">
                {atHandle(person.handle)} · {person.sun} · {person.vibe}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="tn-card" aria-label="Suggested souls">
        <p className="label-lock">Suggested souls</p>
        <ul className="friend-board">
          {suggested.length === 0 && <li className="tn-meta">You are caught up.</li>}
          {suggested.map(person => (
            <li key={person.id} className="friend-row">
              <button type="button" className="friend-row__name" onClick={() => onOpen(person.id)}>
                {person.name}
              </button>
              <button
                type="button"
                className="cta-pist tn-action"
                data-testid={`add-friend-${person.handle}`}
                onClick={() => toggle(person, false)}
              >
                + Add Friend
              </button>
              <span className="friend-row__meta tn-meta">
                {atHandle(person.handle)} · {person.vibe}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function PersonalProfile({
  surface,
  state,
  update,
}: {
  surface: "circle" | "account";
  state: SocialState;
  update: (next: (current: SocialState) => SocialState) => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthStatus();
  const user = useQuery<ProfileAccount>(
    api.auth.currentUser,
    isLoading || !isAuthenticated ? "skip" : {},
  );
  const chartResult = useQuery<NatalChartResult>(
    api.natalChart.get,
    isAuthenticated ? {} : "skip",
  );
  const [closedWelcome, setClosedWelcome] = useState(false);
  const [tandemWith, setTandemWith] = useState<string | null>(null);
  const [seatDraft, setSeatDraft] = useState({ name: "", handle: "", sun: "Aries", moon: "Cancer", rising: "Libra" });

  const soulId = new URLSearchParams(location.search).get("soul");
  const soul = soulId ? findPerson(state, soulId) : null;
  const preview = Boolean(soul);
  const category = profileCategoryFromHash(location.hash);
  const chart = !preview && chartResult?.success ? chartResult.chart ?? null : null;
  const chartLoading = !preview && isAuthenticated && chartResult === undefined;
  const needsWelcome = surface === "account" && Boolean(user) && (!user?.northOnboardedAt || !user?.birthDate);
  const editorOpen = !preview && Boolean(user) && (detailsHashOpen(location.hash) || (needsWelcome && !closedWelcome));

  const sun = soul?.sun ?? chart?.placements.find(item => item.body === "Sun")?.sign ?? state.space.sun;
  const moon = soul?.moon ?? chart?.placements.find(item => item.body === "Moon")?.sign ?? state.space.moon;
  const rising = soul?.rising ?? chart?.ascendant ?? state.space.rising;
  const name = soul?.name ?? (user?.name?.trim() || state.space.name);
  const handle = soul?.handle ?? (state.space.handle || "you");
  const manifesto = soul
    ? soul.manifesto || soul.note || ""
    : user?.northNote?.trim() || state.space.manifesto;
  const focus = soul ? soul.focus || "general" : user?.northFocus || state.space.focus || "general";
  const birthDate = soul
    ? soul.birthDate
    : user?.birthDate
      ? String(user.birthDate).slice(0, 10)
      : state.space.birthDate;
  const lifePath = birthDate
    ? String(lifePathNumber(birthDate))
    : soul?.lifePath || state.space.lifePath;
  const altar = soul ? soul.altar || "A quiet corner" : state.space.altar;
  const mood = soul ? soul.mood || "Unsaid" : state.space.mood;
  const anthem = soul ? soul.anthem || "Silence" : state.space.anthem;
  const friendCount = (state.friends ?? []).filter(friend => friend.handle !== "open").length;
  const seats = soul ? previewCircle(state, soul) : rankedEight(state.top);
  const ownPosts = personalFeed(state, soul ? soul.id : VIEWER_ID);

  const go = (hash: string, search = location.search) => {
    navigate({ pathname: location.pathname, search, hash }, { replace: true });
  };

  const openPerson = (id: string) => {
    const path = surface === "account" ? "/profile" : "/chart";
    navigate({ pathname: path, search: `?soul=${id}`, hash: "chart" });
  };

  const shareChart = () => {
    update(current =>
      publishToFeed(current, {
        kind: "chart",
        title: "Chart highlight",
        body: `Sun ${sun} · Moon ${moon} · Rising ${rising}.`,
      }),
    );
  };

  const shareNumber = () => {
    const pathNumber = Number(lifePath) || 0;
    const meaning = NUMBER_MEANINGS[pathNumber] ?? "A constant that stays put.";
    update(current =>
      publishToFeed(current, {
        kind: "number",
        title: "Number note",
        body: `Life Path ${lifePath}. ${meaning}`,
      }),
    );
  };

  const saveSeat = () => {
    if (!seatDraft.name.trim()) return;
    const friend: TopFriend = {
      id: `friend-${seatDraft.handle.trim() || seatDraft.name.trim().toLowerCase()}`,
      name: seatDraft.name.trim(),
      handle: seatDraft.handle.trim() || seatDraft.name.trim().toLowerCase().replace(/\s+/g, ""),
      sun: seatDraft.sun,
      moon: seatDraft.moon,
      rising: seatDraft.rising,
      vibe: "Chosen",
    };
    update(current => seatFriend(current, friend, 7));
    setSeatDraft({ name: "", handle: "", sun: "Aries", moon: "Cancer", rising: "Libra" });
  };

  return (
    <div className="sky-profile">
      {preview && soul && (
        <div className="tn-card preview-banner">
          <p className="label-lock">Viewing {soul.name}&apos;s sky</p>
          <p className="serif-quiet tn-lede">Chart, numbers, constellation, and their personal feed.</p>
          <div className="tn-actions">
            <button type="button" className="cta-ghost tn-action" onClick={() => go("chart", "")}>
              Back to my sky
            </button>
            {(state.suggested ?? []).some(person => person.id === soul.id) && (
              <button type="button" className="cta-pist tn-action" onClick={() => update(current => addFriend(current, soul.id))}>
                + Add Friend
              </button>
            )}
            <Link to="/chart/circle" className="tn-inline">Open live tandem</Link>
          </div>
        </div>
      )}

      <header className="tn-card sky-head" aria-labelledby="my-sky-heading">
        <div className="sky-head__grid">
          <div className="sky-head__identity">
            <span className="tn-profile__mark" aria-hidden="true">
              <TrueNorthSignIcon sign={sun || "Aries"} size={36} />
            </span>
            <div>
              <p className="label-lock" id="my-sky-heading">{MY_SKY_LABEL}</p>
              <h2 className="clash tn-profile__name">{name}</h2>
              <p className="sky-handle">{atHandle(handle)}</p>
              <p className="sky-manifesto">{manifesto}</p>
              <p className="tn-profile__focus">{focusLabel(focus)}</p>
              <p className="sky-big3">
                <span className="constellation__big3-label">Sun · Moon · Rising</span>
                <span>{sun} · {moon} · {rising}</span>
              </p>
              <div className="sky-pills">
                <span className="sky-badge">Life Path {lifePath}</span>
                {!preview && (
                  <button type="button" className="sky-count" onClick={() => (surface === "circle" ? navigate("/chart#friends") : go("constellation"))}>
                    {friendCount} friends
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="sky-side">
            <div className="sky-altar">
              <p className="label-lock">Altar</p>
              {preview ? (
                <p className="sky-manifesto">{altar}</p>
              ) : (
                <input
                  className="tn-field"
                  aria-label="Altar"
                  value={state.space.altar}
                  onChange={event => update(current => updateSpace(current, { altar: event.target.value }))}
                />
              )}
            </div>
            <label className="tn-label" htmlFor="mood">Mood</label>
            {preview ? (
              <p className="tn-meta">{mood}</p>
            ) : (
              <input
                id="mood"
                className="tn-field"
                value={state.space.mood}
                onChange={event => update(current => updateSpace(current, { mood: event.target.value }))}
              />
            )}
            <label className="tn-label" htmlFor="anthem">Soundtrack</label>
            {preview ? (
              <p className="tn-meta">{anthem}</p>
            ) : (
              <input
                id="anthem"
                className="tn-field"
                value={state.space.anthem}
                onChange={event => update(current => updateSpace(current, { anthem: event.target.value }))}
              />
            )}
          </div>
        </div>
        {!preview && user && (
          <button
            type="button"
            className="cta-ghost tn-action"
            aria-expanded={editorOpen}
            onClick={() => {
              if (editorOpen) {
                setClosedWelcome(true);
                go(category);
              } else {
                go("details");
              }
            }}
          >
            {editorOpen ? "Close details" : "Edit details / birth data"}
          </button>
        )}
        {!preview && !user && !isLoading && (
          <Link to="/login" className="tn-inline">
            Sign in to edit birth data
          </Link>
        )}
      </header>

      {editorOpen && user && (
        <ProfileEditor
          user={user}
          onSaved={() => {
            setClosedWelcome(true);
            go("chart");
          }}
        />
      )}

      <div className="tn-profile__tabs sky-categories" role="tablist" aria-label="Profile categories" data-testid="profile-categories">
        {PROFILE_CATEGORIES.map(item => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={category === item.id}
            aria-controls={`panel-${item.id}`}
            data-testid={`profile-category-${item.id}`}
            className={`tn-profile__tab ${category === item.id ? "is-on" : ""}`}
            onClick={() => go(item.hash)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${category}`} aria-labelledby={`tab-${category}`} className="sky-panel">
        {category === "chart" && (
          <div>
            {!preview && (
              <div className="tn-card sky-share">
                <p className="serif-quiet tn-lede">Post this sky to your feed.</p>
                <button type="button" className="cta-pist tn-action" onClick={shareChart}>
                  Share chart highlight
                </button>
              </div>
            )}
            {chartLoading && <p className="tn-card tn-sky__note">Calculating your chart…</p>}
            {!chartLoading && (
              <ChartHomePage embedded allowPreview={!chart} previewSigns={{ sun, moon, rising }} />
            )}
          </div>
        )}

        {category === "numbers" && (
          <div>
            {!preview && (
              <div className="tn-card sky-share">
                <p className="serif-quiet tn-lede">Post a number you want to keep.</p>
                <button type="button" className="cta-pist tn-action" onClick={shareNumber}>
                  Share number note
                </button>
              </div>
            )}
            {!preview && isAuthenticated ? (
              <NumbersPage embedded />
            ) : (
              <LocalNumbers name={name} birthDate={birthDate} lifePath={lifePath} />
            )}
          </div>
        )}

        {category === "constellation" && (
          <div id="constellation">
            <section className="tn-card" aria-labelledby="my-constellation-heading">
              <h2 id="my-constellation-heading" className="clash north-post__title">{MY_CONSTELLATION_LABEL}</h2>
              <p className="serif-quiet tn-lede">
                {preview ? `${soul?.name ?? "They"} keep a ranked circle of their own.` : "Eight ranked seats. The first star leads."}
              </p>
              <ol className="constellation" aria-label={MY_CONSTELLATION_LABEL}>
                {seats.map((person, index) => (
                  <ConstellationSeat
                    key={`${person.id}-${index}`}
                    person={person}
                    index={index}
                    editable={!preview}
                    onPromote={() => update(current => ({ ...current, top: promoteTop(rankedEight(current.top), index) }))}
                    onMove={direction => update(current => ({ ...current, top: moveTop(rankedEight(current.top), index, direction) }))}
                    onOpen={() => {
                      if (person.id === VIEWER_ID) go("chart", "");
                      else openPerson(person.id);
                    }}
                    onTandem={() => {
                      setTandemWith(person.id);
                      const feed = document.getElementById("personal-feed");
                      feed?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  />
                ))}
              </ol>
              {!preview && (
                <form
                  className="north-friend"
                  onSubmit={event => {
                    event.preventDefault();
                    saveSeat();
                  }}
                >
                  <label className="tn-label" htmlFor="friend-name">Replace seat #8</label>
                  <input id="friend-name" className="tn-field" value={seatDraft.name} onChange={event => setSeatDraft(current => ({ ...current, name: event.target.value }))} placeholder="Name" />
                  <input className="tn-field" value={seatDraft.handle} onChange={event => setSeatDraft(current => ({ ...current, handle: event.target.value }))} placeholder="Handle" aria-label="Handle" />
                  <button type="submit" className="cta-pist tn-action">Replace seat #8</button>
                </form>
              )}
            </section>
            {!preview && <FriendsBoard state={state} update={update} onOpen={openPerson} />}
          </div>
        )}
      </div>

      <section className="sky-wall" id="personal-feed" aria-labelledby="personal-feed-heading">
        <h2 id="personal-feed-heading" className="clash north-post__title">
          {preview ? `${soul?.name ?? "Their"} feed` : "Your feed"}
        </h2>
        <p className="serif-quiet tn-lede">
          Notes, pulls, chart highlights, and tandem readings stay on this sky.
        </p>
        {!preview && (
          <PersonalComposer state={state} update={update} partnerId={tandemWith} />
        )}
        <FilteredFeed posts={ownPosts} update={update} testId="personal-feed" />
      </section>
    </div>
  );
}
