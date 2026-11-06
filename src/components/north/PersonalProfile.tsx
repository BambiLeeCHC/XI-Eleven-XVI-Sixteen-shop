import { type ReactNode, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, useQuery } from "../../lib/backend";
import { celestialPortraitSvg } from "../../lib/celestialAvatar";
import {
  createPost,
  MY_CONSTELLATION_LABEL,
  MY_SKY_LABEL,
  moveTop,
  promoteTop,
  rankedEight,
  type TopFriend,
  upsertFriend,
} from "../../lib/northSocial";
import { ChartHomePage } from "../../pages/chart/ChartHomePage";
import { NumbersPage } from "../../pages/chart/NumbersPage";
import {
  type NatalChartResult,
  type NumerologyResult,
  TrueNorthNav,
} from "../../pages/chart/shared";
import { AvatarStudio } from "./AvatarStudio";
import { useNorthSocial } from "./useNorthSocial";

type SkyTab = "chart" | "numbers" | "constellation" | "posts";
type SeatTab = "seats" | "friends";

const SKY_TABS: { id: SkyTab; label: string }[] = [
  { id: "chart", label: "Chart" },
  { id: "numbers", label: "Numbers" },
  { id: "constellation", label: "Constellation" },
  { id: "posts", label: "Posts" },
];

function atHandle(handle: string) {
  return `@${handle.trim().replace(/^@+/, "")}`;
}

function portraitSrc(seed: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(celestialPortraitSvg(seed))}`;
}

function ConstellationSeat({
  person,
  index,
  onPromote,
  onMove,
}: {
  person: TopFriend;
  index: number;
  onPromote: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  const rank = index + 1;
  const first = rank === 1;
  return (
    <li
      className={
        first
          ? "constellation__seat constellation__seat--star"
          : "constellation__seat"
      }
    >
      <img
        className="constellation__avatar"
        src={portraitSrc(person.name)}
        alt=""
      />
      <div className="constellation__rank">
        {first ? (
          <svg
            className="constellation__mark"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M12 1.8 14.7 8.6 22 9.2 16.6 14.1 18.3 21.4 12 17.6 5.7 21.4 7.4 14.1 2 9.2 9.3 8.6Z"
            />
          </svg>
        ) : null}
        <span>#{rank}</span>
      </div>
      <strong className="constellation__name">{person.name}</strong>
      <span className="constellation__handle">{atHandle(person.handle)}</span>
      <p className="constellation__big3">
        <span className="constellation__big3-label">Sun · Moon · Rising</span>
        <span>
          {person.sun} · {person.moon} · {person.rising}
        </span>
      </p>
      <span className="constellation__vibe">{person.vibe}</span>
      <div className="constellation__actions">
        {first ? (
          <span className="constellation__star-pill">#1 Star</span>
        ) : (
          <button
            type="button"
            className="cta-ghost tn-action"
            onClick={onPromote}
            aria-label={`Make ${person.name} #1`}
          >
            Make #1
          </button>
        )}
        <button
          type="button"
          className="cta-ghost tn-action"
          onClick={() => onMove(-1)}
          disabled={index === 0}
          aria-label={`Move ${person.name} up`}
        >
          Move up
        </button>
        <button
          type="button"
          className="cta-ghost tn-action"
          onClick={() => onMove(1)}
          disabled={index === 7}
          aria-label={`Move ${person.name} down`}
        >
          Move down
        </button>
        <Link
          className="cta-pist tn-action"
          to="/chart/circle"
          aria-label={`Tandem with ${person.name}`}
        >
          Tandem
        </Link>
      </div>
    </li>
  );
}

export function PersonalProfile({
  editor,
  showNav = false,
  onLeaveSky,
  initialTab = "chart",
  initialEditing = false,
}: {
  editor?: ReactNode;
  showNav?: boolean;
  onLeaveSky?: () => void;
  initialTab?: SkyTab;
  initialEditing?: boolean;
}) {
  const user = useQuery(api.auth.currentUser);
  const chartResult = useQuery<NatalChartResult>(
    api.natalChart.get,
    user ? {} : "skip",
  );
  const numbersResult = useQuery<NumerologyResult>(
    api.numerology.get,
    user ? {} : "skip",
  );
  const { state, setState } = useNorthSocial();
  const [tab, setTab] = useState<SkyTab>(initialTab);
  const [seats, setSeats] = useState<SeatTab>("seats");
  const [editing, setEditing] = useState(initialEditing);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [kind, setKind] = useState<"bulletin" | "pull" | "tandem">("bulletin");
  const [friend, setFriend] = useState({
    name: "",
    handle: "",
    sun: "Aries",
    moon: "Cancer",
    rising: "Libra",
  });

  const chart = chartResult?.success ? (chartResult.chart ?? null) : null;
  const placements = chart?.placements ?? [];
  const sun =
    placements.find(item => item.body === "Sun")?.sign ?? state.space.sun;
  const moon =
    placements.find(item => item.body === "Moon")?.sign ?? state.space.moon;
  const rising = chart?.ascendant || state.space.rising;
  const lifePath = numbersResult?.numbers?.lifePath
    ? String(numbersResult.numbers.lifePath)
    : state.space.lifePath;
  const name = (user?.name as string | undefined) || state.space.name || "You";
  const handle = name.toLowerCase().replace(/\s+/g, "") || "you";
  const previewSigns = useMemo(
    () => ({ sun, moon, rising }),
    [sun, moon, rising],
  );
  const mine = state.posts.filter(
    post =>
      post.handle === handle || post.author === name || post.kind === "tandem",
  );

  const saveFriend = () => {
    if (!friend.name.trim()) return;
    const next: TopFriend = {
      id: `friend-${Date.now()}`,
      name: friend.name.trim(),
      handle: friend.handle.trim() || friend.name.trim().toLowerCase(),
      sun: friend.sun,
      moon: friend.moon,
      rising: friend.rising,
      vibe: "Chosen",
    };
    setState(current => ({
      ...current,
      top: upsertFriend(current.top, next, 7),
    }));
    setFriend({
      name: "",
      handle: "",
      sun: "Aries",
      moon: "Cancer",
      rising: "Libra",
    });
    setSeats("seats");
  };

  const publish = () => {
    if (!draft.trim()) return;
    setState(current => ({
      ...current,
      posts: [
        createPost({
          author: name,
          handle,
          sign: sun,
          kind,
          title:
            kind === "tandem"
              ? "Tandem log"
              : kind === "pull"
                ? "A pull"
                : "A note",
          body: draft,
        }),
        ...current.posts,
      ],
    }));
    setDraft("");
  };

  return (
    <section className="my-sky" aria-labelledby="my-sky-heading">
      <header className="tn-card my-sky-head">
        <div className="my-sky-head__avatar">
          <img src={portraitSrc(name)} alt="" />
        </div>
        <div>
          <p className="label-lock" id="my-sky-heading">
            {MY_SKY_LABEL}
          </p>
          <h2 className="clash my-sky-head__name">{name}</h2>
          <p className="tn-meta">
            {atHandle(handle)} · {state.space.manifesto}
          </p>
          <div className="my-sky-head__pills">
            <span className="lock-pill">{sun} sun</span>
            <span className="lock-pill">{moon} moon</span>
            <span className="lock-pill">{rising} rising</span>
            <span className="lock-pill">Life path {lifePath}</span>
          </div>
          <div className="my-sky-head__chips">
            <label className="my-sky-chip" htmlFor="mood">
              <span className="tn-label">Mood</span>
              <input
                id="mood"
                className="tn-field"
                value={state.space.mood}
                onChange={event =>
                  setState(current => ({
                    ...current,
                    space: { ...current.space, mood: event.target.value },
                  }))
                }
              />
            </label>
            <label className="my-sky-chip" htmlFor="anthem">
              <span className="tn-label">Soundtrack</span>
              <input
                id="anthem"
                className="tn-field"
                value={state.space.anthem}
                onChange={event =>
                  setState(current => ({
                    ...current,
                    space: { ...current.space, anthem: event.target.value },
                  }))
                }
              />
            </label>
            <label className="my-sky-chip" htmlFor="altar">
              <span className="tn-label">Altar</span>
              <input
                id="altar"
                className="tn-field"
                value={state.space.altar}
                onChange={event =>
                  setState(current => ({
                    ...current,
                    space: { ...current.space, altar: event.target.value },
                  }))
                }
              />
            </label>
          </div>
        </div>
        <div className="my-sky-head__actions">
          {editor ? (
            <button
              type="button"
              className="cta-ghost tn-action"
              onClick={() => {
                setEditing(open => !open);
                setAvatarOpen(false);
              }}
            >
              Edit Profile
            </button>
          ) : null}
          <button
            type="button"
            className="cta-pist tn-action"
            onClick={() => {
              setAvatarOpen(open => !open);
              setEditing(false);
            }}
          >
            AI Avatar
          </button>
          {onLeaveSky ? (
            <button
              type="button"
              className="cta-ghost tn-action"
              onClick={onLeaveSky}
            >
              Feed
            </button>
          ) : null}
        </div>
      </header>

      {showNav ? <TrueNorthNav /> : null}

      <div
        className="tn-profile__tabs tn-profile__tabs--quad"
        role="tablist"
        aria-label={MY_SKY_LABEL}
      >
        {SKY_TABS.map(item => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`tn-profile__tab ${tab === item.id ? "is-on" : ""}`}
            onClick={() => {
              setTab(item.id);
              setEditing(false);
              setAvatarOpen(false);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {avatarOpen ? (
        <AvatarStudio seed={name} onClose={() => setAvatarOpen(false)} />
      ) : null}
      {editing && editor ? editor : null}

      {!avatarOpen && !editing && tab === "chart" && (
        <ChartHomePage
          embedded
          allowPreview={!user || !chart}
          previewSigns={previewSigns}
        />
      )}
      {!avatarOpen && !editing && tab === "numbers" && <NumbersPage embedded />}
      {!avatarOpen && !editing && tab === "constellation" && (
        <section className="tn-card" aria-labelledby="my-constellation-heading">
          <h2 id="my-constellation-heading" className="clash north-post__title">
            {MY_CONSTELLATION_LABEL}
          </h2>
          <div
            className="tn-subtabs"
            role="tablist"
            aria-label={MY_CONSTELLATION_LABEL}
          >
            <button
              type="button"
              role="tab"
              aria-selected={seats === "seats"}
              className={seats === "seats" ? "is-on" : ""}
              onClick={() => setSeats("seats")}
            >
              Top 8
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={seats === "friends"}
              className={seats === "friends" ? "is-on" : ""}
              onClick={() => setSeats("friends")}
            >
              Friends & Add
            </button>
          </div>
          {seats === "seats" && (
            <ol className="constellation" aria-label={MY_CONSTELLATION_LABEL}>
              {rankedEight(state.top).map((person, index) => (
                <ConstellationSeat
                  key={person.id}
                  person={person}
                  index={index}
                  onPromote={() =>
                    setState(current => ({
                      ...current,
                      top: promoteTop(rankedEight(current.top), index),
                    }))
                  }
                  onMove={direction =>
                    setState(current => ({
                      ...current,
                      top: moveTop(rankedEight(current.top), index, direction),
                    }))
                  }
                />
              ))}
            </ol>
          )}
          {seats === "friends" && (
            <>
              <ul className="north-comments">
                {rankedEight(state.top).map(person => (
                  <li key={person.id}>
                    <strong>{person.name}</strong> {atHandle(person.handle)} ·{" "}
                    {person.sun}
                  </li>
                ))}
              </ul>
              <form
                className="north-friend"
                onSubmit={event => {
                  event.preventDefault();
                  saveFriend();
                }}
              >
                <label className="tn-label" htmlFor="friend-name">
                  Add to Seat #8
                </label>
                <input
                  id="friend-name"
                  className="tn-field"
                  value={friend.name}
                  onChange={event =>
                    setFriend(current => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Name"
                />
                <input
                  className="tn-field"
                  value={friend.handle}
                  onChange={event =>
                    setFriend(current => ({
                      ...current,
                      handle: event.target.value,
                    }))
                  }
                  placeholder="Handle"
                  aria-label="Handle"
                />
                <button type="submit" className="cta-pist tn-action">
                  Save to seat 8
                </button>
              </form>
            </>
          )}
        </section>
      )}
      {!avatarOpen && !editing && tab === "posts" && (
        <section className="tn-card">
          <h2 className="clash north-post__title">Posts</h2>
          <form
            onSubmit={event => {
              event.preventDefault();
              publish();
            }}
          >
            <label className="tn-label" htmlFor="sky-note">
              Note, pull, or tandem log
            </label>
            <textarea
              id="sky-note"
              className="tn-field tn-field--area"
              value={draft}
              onChange={event => setDraft(event.target.value)}
            />
            <div className="tn-actions">
              <button
                type="button"
                className={`cta-ghost tn-action ${kind === "bulletin" ? "is-on" : ""}`}
                onClick={() => setKind("bulletin")}
              >
                Note
              </button>
              <button
                type="button"
                className={`cta-ghost tn-action ${kind === "pull" ? "is-on" : ""}`}
                onClick={() => setKind("pull")}
              >
                Pull
              </button>
              <button
                type="button"
                className={`cta-ghost tn-action ${kind === "tandem" ? "is-on" : ""}`}
                onClick={() => setKind("tandem")}
              >
                Tandem
              </button>
              <button type="submit" className="cta-pist tn-action">
                Post
              </button>
            </div>
          </form>
          {mine.map(post => (
            <article key={post.id} className="north-post">
              <p className="label-lock">
                {post.kind} · {post.sign}
              </p>
              <h3 className="clash north-post__title">{post.title}</h3>
              <p className="serif-quiet tn-lede">{post.body}</p>
            </article>
          ))}
        </section>
      )}
    </section>
  );
}
