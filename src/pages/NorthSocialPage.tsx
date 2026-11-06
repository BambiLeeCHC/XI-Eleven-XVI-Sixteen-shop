import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CompassRose } from "../components/north/CompassRose";
import { SkyAvatar } from "../components/north/SkyAvatar";
import { AvatarStudio } from "../components/north/AvatarStudio";
import { TarotCardArt } from "../components/north/TarotCardArt";
import { TrueNorthAtmosphere } from "../components/journal/TrueNorthAtmosphere";
import { SEO } from "../components/SEO";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { FULL_DECK } from "../data/fullDeck";
import { PAGE_SEO } from "../data/seoMeta";
import { api, useAuthActions, useQuery } from "../lib/backend";
import { celestialPortraitSvg } from "../lib/celestialAvatar";
import {
  activeAvatarUrl,
  addComment,
  createPost,
  moveTop,
  MY_CONSTELLATION_LABEL,
  MY_SKY_LABEL,
  NORTH_SOCIAL_SKY_TAB,
  NORTH_SOCIAL_STORAGE_KEY,
  promoteTop,
  rankedEight,
  REACTION_LABEL,
  resolveTrueNorthView,
  syncNorthAvatar,
  toggleReaction,
  upgradeSocialState,
  upsertFriend,
  type ReactionKey,
  type ReadingMode,
  type SkyPanel,
  type SocialPost,
  type SocialState,
  type SpaceProfile,
  type TopFriend,
} from "../lib/northSocial";
import { supabase } from "../lib/supabase";
import { ChartHomePage } from "./chart/ChartHomePage";
import { CirclePage } from "./chart/CirclePage";
import DeepReadingPage from "./DeepReadingPage";
import { NumbersPage } from "./chart/NumbersPage";
import { ProfileEditor } from "./chart/ProfileEditor";
import { TrueNorthNav, type NatalChartResult, type NumerologyResult } from "./chart/shared";

const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

function atHandle(handle: string) {
  return `@${handle.trim().replace(/^@+/, "")}`;
}

function drawCards(count: number) {
  const copy = [...FULL_DECK];
  const picked: string[] = [];
  for (let i = 0; i < count && copy.length; i += 1) {
    const index = Math.floor(Math.random() * copy.length);
    const card = copy.splice(index, 1)[0];
    if (card) picked.push(card.name);
  }
  return picked;
}

function portraitFor(name: string, handle: string, sign: string, youHandle: string, youSrc: string) {
  if (youSrc && (handle === youHandle || name === "You")) return youSrc;
  return celestialPortraitSvg(name, sign);
}

function ConstellationSeat({
  person,
  index,
  onPromote,
  onMove,
  onOpen,
}: {
  person: TopFriend;
  index: number;
  onPromote: () => void;
  onMove: (direction: -1 | 1) => void;
  onOpen: () => void;
}) {
  const rank = index + 1;
  const first = rank === 1;
  return (
    <li className={first ? "constellation__seat constellation__seat--star" : "constellation__seat"}>
      <div className="constellation__rank">
        {first ? (
          <svg className="constellation__mark" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M12 1.8 14.7 8.6 22 9.2 16.6 14.1 18.3 21.4 12 17.6 5.7 21.4 7.4 14.1 2 9.2 9.3 8.6Z" />
          </svg>
        ) : null}
        <span>#{rank}</span>
      </div>
      <button type="button" className="constellation__open" onClick={onOpen}>
        <SkyAvatar name={person.name} sign={person.sun} size={52} />
        <strong className="constellation__name">{person.name}</strong>
        <span className="constellation__handle">{atHandle(person.handle)}</span>
      </button>
      <p className="constellation__big3">
        <span className="constellation__big3-label">Sun · Moon · Rising</span>
        <span>{person.sun} · {person.moon} · {person.rising}</span>
      </p>
      <span className="constellation__vibe">{person.vibe}</span>
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
        <Link className="cta-pist tn-action" to="/chart/circle" aria-label={`Tandem with ${person.name}`}>
          Tandem
        </Link>
      </div>
    </li>
  );
}

function PostCard({
  post,
  youSrc,
  youHandle,
  note,
  onNote,
  onReact,
  onComment,
}: {
  post: SocialPost;
  youSrc: string;
  youHandle: string;
  note: string;
  onNote: (value: string) => void;
  onReact: (key: ReactionKey) => void;
  onComment: () => void;
}) {
  const src = portraitFor(post.author, post.handle, post.sign, youHandle, youSrc);
  return (
    <article className="tn-card north-post">
      <header className="north-post__who">
        {post.kind === "tandem" ? (
          <div className="tandem-lockup" aria-label={`You × ${post.author}`}>
            <SkyAvatar name="You" sign={post.sign} src={youSrc} size={42} />
            <span aria-hidden="true">×</span>
            <SkyAvatar name={post.author} sign={post.sign} src={post.author === "You" ? youSrc : src} size={42} />
            <strong>You × {post.author}</strong>
          </div>
        ) : (
          <>
            <SkyAvatar name={post.author} sign={post.sign} src={src} size={44} />
            <div>
              <strong>{post.author}</strong>
              <span>{atHandle(post.handle)} · {post.sign}</span>
            </div>
          </>
        )}
      </header>
      <h2 className="north-post__title">{post.title}</h2>
      <p className="serif-quiet tn-lede">{post.body}</p>
      {post.cards.length > 0 && (
        <div className="north-cards">
          {post.cards.map(card => <TarotCardArt key={card} name={card} />)}
        </div>
      )}
      <div className="north-react">
        {(Object.keys(REACTION_LABEL) as ReactionKey[]).map(key => (
          <button key={key} type="button" className={post.mine.includes(key) ? "is-on" : ""} onClick={() => onReact(key)}>
            {REACTION_LABEL[key]} {post.reactions[key]}
          </button>
        ))}
      </div>
      <ul className="north-comments">
        {post.comments.map(item => (
          <li key={item.id}>
            <SkyAvatar name={item.author} size={28} />
            <span><strong>{item.author}</strong> {item.body}</span>
          </li>
        ))}
      </ul>
      <form onSubmit={event => { event.preventDefault(); onComment(); }}>
        <label className="tn-label" htmlFor={`note-${post.id}`}>Note</label>
        <input id={`note-${post.id}`} className="tn-field" value={note} onChange={event => onNote(event.target.value)} />
      </form>
    </article>
  );
}

export function NorthSocialPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const view = resolveTrueNorthView(location.pathname, location.hash);
  const user = useQuery(api.auth.currentUser);
  const chartResult = useQuery<NatalChartResult>(api.natalChart.get, user ? {} : "skip");
  const numbersResult = useQuery<NumerologyResult>(api.numerology.get, user && view.destination === "sky" ? {} : "skip");
  const { signOut } = useAuthActions();
  const [state, setState] = useState<SocialState>(() => upgradeSocialState(null));
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState("");
  const [story, setStory] = useState<string | null>(null);
  const [note, setNote] = useState<Record<string, string>>({});
  const [friend, setFriend] = useState({ name: "", handle: "", sun: "Aries", moon: "Cancer", rising: "Libra" });
  const [pull, setPull] = useState<string[]>([]);
  const [filter, setFilter] = useState<"all" | "posts" | "tandem" | "friends">("all");
  const [composerOpen, setComposerOpen] = useState(false);
  const [seatTab, setSeatTab] = useState<"seats" | "friends">("seats");
  const [studio, setStudio] = useState(false);
  const [editor, setEditor] = useState(false);
  const [sheet, setSheet] = useState<TopFriend | null>(null);
  const [chip, setChip] = useState<"mood" | "anthem" | "altar" | null>(null);
  const greeted = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(NORTH_SOCIAL_STORAGE_KEY);
      setState(upgradeSocialState(raw ? JSON.parse(raw) : null));
    } catch {
      setState(upgradeSocialState(null));
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(NORTH_SOCIAL_STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  useEffect(() => {
    if (!ready || !user) return;
    const photo = typeof user.photoUrl === "string" ? user.photoUrl : "";
    const ai = typeof user.aiAvatarUrl === "string" ? user.aiAvatarUrl : "";
    if (!photo && !ai) return;
    setState(current => {
      if (current.space.photoUrl || current.space.aiAvatarUrl) return current;
      return {
        ...current,
        space: {
          ...current.space,
          photoUrl: photo,
          aiAvatarUrl: ai,
          avatarMode: user.avatarMode === "original" ? "original" : "ai",
        },
      };
    });
  }, [ready, user]);

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (hash === "profile" || hash === "details" || hash === "birth") setEditor(true);
  }, [location.hash]);

  useEffect(() => {
    if (!ready || !user) return;
    if (!user.northOnboardedAt && !greeted.current && view.destination === "sky") {
      greeted.current = true;
      setEditor(true);
    }
    setState(current => ({
      ...current,
      space: {
        ...current.space,
        name: user.name || current.space.name,
        manifesto: user.northNote || current.space.manifesto,
      },
    }));
  }, [ready, user, view.destination]);

  const author = (user?.name as string | undefined) || state.space.name || "You";
  const youHandle = (state.space.handle || author).toLowerCase().replace(/[^a-z0-9]+/g, "") || "you";
  const youSrc = activeAvatarUrl(state.space);
  const chart = chartResult?.success ? chartResult.chart ?? null : null;
  const sun = chart?.placements?.find(item => item.body === "Sun")?.sign || state.space.sun;
  const moon = chart?.placements?.find(item => item.body === "Moon")?.sign || state.space.moon;
  const rising = chart?.ascendant || state.space.rising;
  const lifePath = numbersResult?.numbers?.lifePath ? String(numbersResult.numbers.lifePath) : state.space.lifePath;
  const storyPost = state.posts.find(post => post.id === story);

  const rings = useMemo(() => {
    const seen = new Set<string>();
    const list: SocialPost[] = [];
    for (const post of [...state.posts].sort((a, b) => b.createdAt - a.createdAt)) {
      if (seen.has(post.handle)) continue;
      seen.add(post.handle);
      list.push(post);
    }
    return list.slice(0, 10);
  }, [state.posts]);

  const feed = useMemo(() => {
    return [...state.posts]
      .filter(post => filter === "all" || (filter === "tandem" ? post.kind === "tandem" : post.kind !== "tandem"))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [filter, state.posts]);

  const personal = useMemo(() => {
    return [...state.posts]
      .filter(post => post.author === author || post.kind === "tandem")
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [author, state.posts]);

  const publish = (title: string, body: string, cards: string[], kind: SocialPost["kind"]) => {
    if (!body.trim() && cards.length === 0) return;
    setState(current => ({
      ...current,
      posts: [createPost({
        author,
        handle: youHandle,
        sign: sun,
        kind,
        title,
        body,
        cards,
      }), ...current.posts],
    }));
    setDraft("");
    setPull([]);
  };

  const saveAvatar = (next: Pick<SpaceProfile, "photoUrl" | "aiAvatarUrl" | "avatarMode">) => {
    setState(current => {
      const space = { ...current.space, ...next };
      const id = user?._id as string | undefined;
      if (id) void syncNorthAvatar(supabase as never, id, space);
      return { ...current, space };
    });
  };

  const saveFriend = () => {
    if (!friend.name.trim()) return;
    const next: TopFriend = {
      id: `friend-${Date.now()}`,
      name: friend.name.trim(),
      handle: friend.handle.trim() || friend.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, ""),
      sun: friend.sun,
      moon: friend.moon,
      rising: friend.rising,
      vibe: "Chosen",
    };
    setState(current => ({ ...current, top: upsertFriend(current.top, next, 7) }));
    setFriend({ name: "", handle: "", sun: "Aries", moon: "Cancer", rising: "Libra" });
  };

  const goSky = (panel: SkyPanel) => {
    const base = location.pathname.startsWith("/profile") ? "/profile" : "/chart";
    if (panel === "numbers") navigate(`${base}#numbers`);
    else if (panel === "constellation") navigate(`${base}#constellation`);
    else if (panel === "posts") navigate(`${base}#posts`);
    else navigate(base === "/profile" ? "/profile#chart" : "/chart#sky");
  };

  const goReading = (mode: ReadingMode) => {
    if (mode === "deep") navigate("/chart/long-read");
    else if (mode === "tandem") navigate("/chart/circle");
    else navigate("/chart#readings");
  };

  const patchSpace = (partial: Partial<SpaceProfile>) => {
    setState(current => ({ ...current, space: { ...current.space, ...partial } }));
  };

  return (
    <div className="journal-page journal-page--truenorth north-social">
      <TrueNorthAtmosphere />
      <div className="journal-stack tn-shell">
        <SEO title={PAGE_SEO.chart.title} description={PAGE_SEO.chart.description} url="/chart" />
        <header className="tn-card north-social__head north-shell">
          <div className="north-social__brand">
            <CompassRose />
            <div>
              <p className="north-kicker">XI · XVI</p>
              <h1 className="clash north-social__title">True North</h1>
            </div>
          </div>
          <TrueNorthNav />
        </header>

        {view.destination === "feed" && (
          <>
            <div className="story-row" aria-label="Stories">
              <button type="button" className="story-ring" onClick={() => navigate("/chart#sky")}>
                <SkyAvatar name={author} sign={sun} src={youSrc} size={64} />
                <small>You</small>
              </button>
              {rings.filter(post => post.handle !== youHandle).map(post => (
                <button key={post.id} type="button" className="story-ring" onClick={() => setStory(post.id)}>
                  <SkyAvatar name={post.author} sign={post.sign} src={portraitFor(post.author, post.handle, post.sign, youHandle, youSrc)} size={64} />
                  <small>{post.author}</small>
                </button>
              ))}
            </div>

            <div className="tn-card north-composer">
              <button type="button" className="tn-inline" aria-expanded={composerOpen} onClick={() => setComposerOpen(open => !open)}>
                {composerOpen ? "Close composer" : "Share a pull"}
              </button>
              {composerOpen && (
                <form onSubmit={event => { event.preventDefault(); publish(pull.length ? "A pull" : "A note", draft || pull.join(" · "), pull, pull.length ? "pull" : "bulletin"); }}>
                  <label className="tn-label" htmlFor="north-draft">Write a note</label>
                  <textarea id="north-draft" className="tn-field tn-field--area" value={draft} onChange={event => setDraft(event.target.value)} placeholder="A note, a pull, or a tandem reading." rows={3} />
                  {pull.length > 0 && <div className="north-cards">{pull.map(card => <TarotCardArt key={card} name={card} />)}</div>}
                  <div className="tn-actions">
                    <button type="button" className="cta-ghost tn-action" onClick={() => setPull(drawCards(1))}>1 card</button>
                    <button type="button" className="cta-ghost tn-action" onClick={() => setPull(drawCards(3))}>3 cards</button>
                    <button type="button" className="cta-ghost tn-action" onClick={() => publish(`You × ${rankedEight(state.top)[0]?.name ?? "a friend"}`, draft || "Logged a tandem reading.", pull, "tandem")}>Tandem</button>
                    <button type="submit" className="cta-pist tn-action">Post</button>
                  </div>
                </form>
              )}
            </div>

            <div className="feed-filters" role="tablist" aria-label="Feed filter">
              {([
                ["all", "All"],
                ["posts", "Posts & Pulls"],
                ["tandem", "Tandem"],
                ["friends", "Find Friends"],
              ] as const).map(([id, label]) => (
                <button key={id} type="button" role="tab" aria-selected={filter === id} className={filter === id ? "is-on" : ""} onClick={() => setFilter(id)}>
                  {label}
                </button>
              ))}
            </div>

            {filter === "friends" ? (
              <section className="tn-card find-friends">
                <h2 className="north-post__title">Find Friends</h2>
                <ul className="find-friends__list">
                  {rankedEight(state.top).slice(0, 4).map(person => (
                    <li key={person.id}>
                      <SkyAvatar name={person.name} sign={person.sun} size={36} />
                      <span>{person.name}</span>
                      <em>{atHandle(person.handle)}</em>
                    </li>
                  ))}
                </ul>
                <form className="north-friend" onSubmit={event => { event.preventDefault(); saveFriend(); }}>
                  <label className="tn-label" htmlFor="feed-friend-name">Add someone to seat #8</label>
                  <input id="feed-friend-name" className="tn-field" value={friend.name} onChange={event => setFriend(current => ({ ...current, name: event.target.value }))} placeholder="Name" />
                  <input className="tn-field" value={friend.handle} onChange={event => setFriend(current => ({ ...current, handle: event.target.value }))} placeholder="Handle" aria-label="Handle" />
                  <button type="submit" className="cta-pist tn-action">Save to seat 8</button>
                </form>
              </section>
            ) : feed.map(post => (
              <PostCard
                key={post.id}
                post={post}
                youSrc={youSrc}
                youHandle={youHandle}
                note={note[post.id] ?? ""}
                onNote={value => setNote(current => ({ ...current, [post.id]: value }))}
                onReact={key => setState(current => ({ ...current, posts: current.posts.map(item => item.id === post.id ? toggleReaction(item, key) : item) }))}
                onComment={() => {
                  const body = note[post.id] ?? "";
                  setState(current => ({ ...current, posts: current.posts.map(item => item.id === post.id ? addComment(item, author, body) : item) }));
                  setNote(current => ({ ...current, [post.id]: "" }));
                }}
              />
            ))}
          </>
        )}

        {view.destination === "sky" && (
          <div className="north-space" aria-label={NORTH_SOCIAL_SKY_TAB}>
            <section className="tn-card my-sky">
              <div className="my-sky__top">
                <button type="button" className="sky-avatar-hit" onClick={() => setStudio(true)} aria-label="Upload photo or create AI avatar">
                  <SkyAvatar name={author} sign={sun} src={youSrc} size={84} />
                </button>
                <div className="my-sky__copy">
                  <h2 className="my-sky__name">{MY_SKY_LABEL}</h2>
                  <p className="my-sky__person">{author}</p>
                  <p className="my-sky__handle">{atHandle(youHandle)}</p>
                  <p className="serif-quiet tn-lede">{state.space.manifesto}</p>
                </div>
              </div>
              <div className="sky-meta">
                <ul className="sky-pills">
                  <li>Sun {sun}</li>
                  <li>Moon {moon}</li>
                  <li>Rising {rising}</li>
                  <li>Life Path {lifePath}</li>
                </ul>
                <div className="sky-chips">
                  {(["mood", "anthem", "altar"] as const).map(key => (
                    <span key={key} className="sky-chip">
                      <span>{key === "mood" ? "Mood" : key === "anthem" ? "Soundtrack" : "Altar"}</span>
                      {chip === key ? (
                        <input
                          className="tn-field"
                          value={state.space[key]}
                          autoFocus
                          onChange={event => patchSpace({ [key]: event.target.value })}
                          onBlur={() => setChip(null)}
                        />
                      ) : (
                        <button type="button" onClick={() => setChip(key)}>{state.space[key]}</button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
              <div className="tn-actions">
                <button type="button" className="cta-pist tn-action" onClick={() => setEditor(true)}>Edit Profile & Birth Data</button>
                <button type="button" className="cta-ghost tn-action" onClick={() => setStudio(true)}>AI Avatar</button>
              </div>
            </section>

            <div className="sky-tabrow">
              <div className="tn-profile__tabs tn-profile__tabs--quad" role="tablist" aria-label="Profile">
                {([
                  ["chart", "Chart"],
                  ["numbers", "Numbers"],
                  ["constellation", "Constellation"],
                  ["posts", "Posts"],
                ] as const).map(([id, label]) => (
                  <button key={id} type="button" role="tab" aria-selected={view.sky === id} className={`tn-profile__tab ${view.sky === id ? "is-on" : ""}`} onClick={() => goSky(id)}>
                    {label}
                  </button>
                ))}
              </div>
              {(view.sky === "chart" || view.sky === "numbers") && (
                <button
                  type="button"
                  className="cta-ghost sky-share"
                  onClick={() => publish(
                    view.sky === "numbers" ? "Numbers" : "Chart highlight",
                    view.sky === "numbers" ? `Life Path ${lifePath}.` : `${sun} sun, ${moon} moon, ${rising} rising.`,
                    [],
                    "chart",
                  )}
                >
                  Share to Feed
                </button>
              )}
            </div>

            {view.sky === "chart" && (
              <div className="sky-panel">
                <ChartHomePage embedded allowPreview={!chart} previewSigns={{ sun, moon, rising }} />
              </div>
            )}

            {view.sky === "numbers" && (
              <div className="sky-panel">
                <NumbersPage embedded />
              </div>
            )}

            {view.sky === "constellation" && (
              <section className="tn-card" aria-labelledby="my-constellation-heading">
                <h2 id="my-constellation-heading" className="north-post__title">{MY_CONSTELLATION_LABEL}</h2>
                <div className="tn-subtabs" role="tablist" aria-label={MY_CONSTELLATION_LABEL}>
                  <button type="button" role="tab" aria-selected={seatTab === "seats"} className={seatTab === "seats" ? "is-on" : ""} onClick={() => setSeatTab("seats")}>Top 8</button>
                  <button type="button" role="tab" aria-selected={seatTab === "friends"} className={seatTab === "friends" ? "is-on" : ""} onClick={() => setSeatTab("friends")}>Friends & Add</button>
                </div>
                {seatTab === "seats" && (
                  <ol className="constellation" aria-label={MY_CONSTELLATION_LABEL}>
                    {rankedEight(state.top).map((person, index) => (
                      <ConstellationSeat
                        key={person.id}
                        person={person}
                        index={index}
                        onOpen={() => setSheet(person)}
                        onPromote={() => setState(current => ({ ...current, top: promoteTop(rankedEight(current.top), index) }))}
                        onMove={direction => setState(current => ({ ...current, top: moveTop(rankedEight(current.top), index, direction) }))}
                      />
                    ))}
                  </ol>
                )}
                {seatTab === "friends" && (
                  <div className="friend-list">
                    <h3>Friends</h3>
                    <ul>
                      {rankedEight(state.top).map(person => (
                        <li key={`list-${person.id}`}>
                          <button type="button" onClick={() => setSheet(person)}>
                            <SkyAvatar name={person.name} sign={person.sun} size={40} />
                            <span>{person.name}</span>
                            <em>{atHandle(person.handle)}</em>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <form id="add-friend" className="north-friend" onSubmit={event => { event.preventDefault(); saveFriend(); }}>
                      <label className="tn-label" htmlFor="friend-name">Add a friend to seat #8</label>
                      <input id="friend-name" className="tn-field" value={friend.name} onChange={event => setFriend(current => ({ ...current, name: event.target.value }))} placeholder="Name" />
                      <input className="tn-field" value={friend.handle} onChange={event => setFriend(current => ({ ...current, handle: event.target.value }))} placeholder="Handle" aria-label="Handle" />
                      <label className="tn-label" htmlFor="friend-sun">Sun</label>
                      <select id="friend-sun" className="tn-field" value={friend.sun} onChange={event => setFriend(current => ({ ...current, sun: event.target.value }))}>
                        {SIGNS.map(sign => <option key={sign}>{sign}</option>)}
                      </select>
                      <button type="submit" className="cta-pist tn-action">Save to seat 8</button>
                    </form>
                  </div>
                )}
              </section>
            )}

            {view.sky === "posts" && (
            <section className="personal-feed" aria-label="Your notes and tandem readings">
              <h2 className="north-post__title">Your notes</h2>
              {personal.length === 0 ? (
                <p className="serif-quiet tn-lede">Notes and tandem readings you share show up here and on the feed.</p>
              ) : personal.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  youSrc={youSrc}
                  youHandle={youHandle}
                  note={note[post.id] ?? ""}
                  onNote={value => setNote(current => ({ ...current, [post.id]: value }))}
                  onReact={key => setState(current => ({ ...current, posts: current.posts.map(item => item.id === post.id ? toggleReaction(item, key) : item) }))}
                  onComment={() => {
                    const body = note[post.id] ?? "";
                    setState(current => ({ ...current, posts: current.posts.map(item => item.id === post.id ? addComment(item, author, body) : item) }));
                    setNote(current => ({ ...current, [post.id]: "" }));
                  }}
                />
              ))}
            </section>
            )}

            <footer className="tn-profile__foot">
              <Link to="/orders" className="tn-inline">Orders</Link>
              <Link to="/shop" className="tn-inline">Shop</Link>
              {user && (
                <button type="button" className="cta-ghost tn-action" onClick={async () => { await signOut(); navigate("/"); }}>
                  Sign out
                </button>
              )}
            </footer>
          </div>
        )}

        {view.destination === "readings" && (
          <section className="reading-room" aria-label="Readings">
            <div className="reading-switch" role="tablist" aria-label="Reading room">
              {([
                ["quick", "Quick Pull"],
                ["deep", "Deep Spread"],
                ["tandem", "Live Tandem"],
              ] as const).map(([id, label]) => (
                <button key={id} type="button" role="tab" aria-selected={view.reading === id} className={view.reading === id ? "is-on" : ""} onClick={() => goReading(id)}>
                  {label}
                </button>
              ))}
            </div>

            {view.reading === "quick" && (
              <form className="tn-card north-composer" onSubmit={event => { event.preventDefault(); publish(pull.length > 1 ? "Three-card pull" : "Quick pull", draft || pull.join(" · "), pull, pull.length > 1 ? "spread" : "pull"); }}>
                <h2 className="north-post__title">Quick Pull</h2>
                <label className="tn-label" htmlFor="quick-note">What are you asking?</label>
                <textarea id="quick-note" className="tn-field tn-field--area" value={draft} onChange={event => setDraft(event.target.value)} rows={3} placeholder="One question, held lightly." />
                {pull.length > 0 && <div className="north-cards">{pull.map(card => <TarotCardArt key={card} name={card} />)}</div>}
                <div className="tn-actions">
                  <button type="button" className="cta-ghost tn-action" onClick={() => setPull(drawCards(1))}>Pull 1</button>
                  <button type="button" className="cta-ghost tn-action" onClick={() => setPull(drawCards(3))}>Pull 3</button>
                  <button type="submit" className="cta-pist tn-action">Share to Feed</button>
                </div>
              </form>
            )}

            {view.reading === "deep" && (
              <div className="sky-panel">
                <div className="tn-actions">
                  <button type="button" className="cta-pist tn-action" onClick={() => publish("Long Read", "Shared a seven-card deep spread from the reading room.", [], "spread")}>Share to Feed</button>
                </div>
                <DeepReadingPage embedded />
              </div>
            )}

            {view.reading === "tandem" && (
              <div className="sky-panel">
                <div className="tn-actions">
                  <button type="button" className="cta-pist tn-action" onClick={() => publish(`You × ${rankedEight(state.top)[0]?.name ?? "a friend"}`, draft || "Shared a live tandem.", [], "tandem")}>Share to Feed</button>
                </div>
                <CirclePage embedded />
              </div>
            )}
          </section>
        )}

        {storyPost && (
          <div className="story-modal" role="dialog" aria-modal="true" aria-label={storyPost.title}>
            <article className="tn-card">
              <header className="north-post__who">
                <SkyAvatar name={storyPost.author} sign={storyPost.sign} src={portraitFor(storyPost.author, storyPost.handle, storyPost.sign, youHandle, youSrc)} size={48} />
                <div>
                  <strong>{storyPost.author}</strong>
                  <span>{storyPost.sign}</span>
                </div>
              </header>
              <h2 className="north-post__title">{storyPost.title}</h2>
              <p className="serif-quiet tn-lede">{storyPost.body}</p>
              <div className="north-cards">{storyPost.cards.map(card => <TarotCardArt key={card} name={card} />)}</div>
              <button type="button" className="cta-ghost tn-action" onClick={() => setStory(null)}>Close</button>
            </article>
          </div>
        )}
      </div>

      <AvatarStudio open={studio} onOpenChange={setStudio} space={{ ...state.space, sun, moon, rising }} onSave={saveAvatar} />

      <Dialog open={editor} onOpenChange={setEditor}>
        <DialogContent className="avatar-studio">
          <DialogHeader>
            <DialogTitle>Edit Profile & Birth Data</DialogTitle>
            <DialogDescription>Name, note, and the birth details that draw the chart.</DialogDescription>
          </DialogHeader>
          {user ? (
            <ProfileEditor user={user} onSaved={() => setEditor(false)} />
          ) : (
            <form className="tn-profile__editor" onSubmit={event => { event.preventDefault(); setEditor(false); }}>
              <label className="tn-label" htmlFor="local-name">Name</label>
              <input id="local-name" className="tn-field" value={state.space.name} onChange={event => patchSpace({ name: event.target.value })} />
              <label className="tn-label" htmlFor="local-note">Bio note</label>
              <textarea id="local-note" className="tn-field tn-field--area" value={state.space.manifesto} onChange={event => patchSpace({ manifesto: event.target.value })} />
              <label className="tn-label" htmlFor="local-path">Life Path</label>
              <input id="local-path" className="tn-field" value={state.space.lifePath} onChange={event => patchSpace({ lifePath: event.target.value })} />
              <p className="serif-quiet tn-lede"><Link to="/login">Sign in</Link> to save birth data on your account.</p>
              <button type="submit" className="cta-pist tn-action">Save on this device</button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(sheet)} onOpenChange={open => { if (!open) setSheet(null); }}>
        <DialogContent className="avatar-studio">
          {sheet && (
            <>
              <DialogHeader>
                <DialogTitle>{sheet.name}</DialogTitle>
                <DialogDescription>{atHandle(sheet.handle)}</DialogDescription>
              </DialogHeader>
              <div className="friend-sheet">
                <SkyAvatar name={sheet.name} sign={sheet.sun} size={96} />
                <p>{sheet.sun} · {sheet.moon} · {sheet.rising}</p>
                <p>{sheet.vibe}</p>
                <Link className="cta-pist tn-action" to="/chart/circle" onClick={() => setSheet(null)}>Open tandem</Link>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
