import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GroupReadRoom } from "../components/north/GroupReadRoom";
import { CompassRose } from "../components/north/CompassRose";
import { SkyAvatar } from "../components/north/SkyAvatar";
import { AvatarStudio } from "../components/north/AvatarStudio";
import { TarotCardArt } from "../components/north/TarotCardArt";
import { HeirloomBacksCarousel } from "../components/north/HeirloomBacksCarousel";
import { ConstellationSeat, PostCard, atHandle } from "../components/north/NorthSocialPieces";
import { drawCards } from "../components/north/SocialFeed";
import { TrueNorthAtmosphere } from "../components/journal/TrueNorthAtmosphere";
import { SEO } from "../components/SEO";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { PAGE_SEO } from "../data/seoMeta";
import { api, useAuthActions, useQuery } from "../lib/backend";
import {
  activeAvatarUrl,
  addComment,
  createPost,
  moveTop,
  MY_CONSTELLATION_LABEL,
  MY_SKY_LABEL,
  NORTH_SOCIAL_STORAGE_KEY,
  promoteTop,
  rankedEight,
  resolveTrueNorthView,
  syncNorthAvatar,
  toggleReaction,
  upgradeSocialState,
  upsertFriend,
  type ReadingMode,
  type SkyPanel,
  type SocialPost,
  type SocialState,
  type SpaceProfile,
  type TopFriend,
} from "../lib/northSocial";
import { supabase } from "../lib/supabase";
import { ChartHomePage } from "./chart/ChartHomePage";
import DeepReadingPage from "./DeepReadingPage";
import { NumbersPage } from "./chart/NumbersPage";
import { ProfileEditor } from "./chart/ProfileEditor";
import { TrueNorthNav, type NatalChartResult, type NumerologyResult } from "./chart/shared";

const SKY_TABS = [
  { id: "chart", label: "Chart" },
  { id: "numbers", label: "Numbers" },
  { id: "constellation", label: MY_CONSTELLATION_LABEL },
  { id: "posts", label: "Posts" },
] as const;

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
  const [filter, setFilter] = useState<"all" | "posts" | "tandem" | "friends">("all");
  const [composerOpen, setComposerOpen] = useState(false);
  const [studio, setStudio] = useState(false);
  const [editor, setEditor] = useState(false);
  const [sheet, setSheet] = useState<TopFriend | null>(null);
  const [flashKey, setFlashKey] = useState(0);
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
    setFlashKey(key => key + 1);
  }, [view.destination, view.reading]);

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
    if (mode === "group") navigate("/chart#group");
    else navigate("/chart#tri-sky");
  };

  return (
    <div className="journal-page journal-page--truenorth north-social">
      <span key={flashKey} className="north-sweep" aria-hidden="true" />
      <TrueNorthAtmosphere />
      <div className="journal-stack tn-shell">
        <SEO title={PAGE_SEO.chart.title} description={PAGE_SEO.chart.description} url="/chart" />
        <HeirloomBacksCarousel />
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
                {composerOpen ? "Close composer" : "Share a note"}
              </button>
              {composerOpen && (
                <form onSubmit={event => { event.preventDefault(); publish("A note", draft, [], "bulletin"); }}>
                  <label className="tn-label" htmlFor="north-draft">Write a note</label>
                  <textarea id="north-draft" className="tn-field tn-field--area" value={draft} onChange={event => setDraft(event.target.value)} placeholder="A note for the feed." rows={3} />
                  <div className="tn-actions">
                    <button type="submit" className="cta-pist tn-action">Post</button>
                    <button type="button" className="cta-ghost tn-action" onClick={() => publish("A pull", draft || "Three cards from the house deck.", drawCards(3), "pull")}>Pull three</button>
                    <button type="button" className="cta-ghost tn-action" onClick={() => goReading("group")}>Tandem</button>
                  </div>
                </form>
              )}
            </div>

            <div className="feed-filters" role="tablist" aria-label="Feed filter">
              {([
                ["all", "All"],
                ["posts", "Posts & Pulls"],
                ["tandem", "Group Reads"],
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
                  if (!body.trim()) return;
                  setState(current => ({
                    ...current,
                    posts: current.posts.map(item => item.id === post.id ? addComment(item, author, body) : item),
                  }));
                  setNote(current => ({ ...current, [post.id]: "" }));
                }}
              />
            ))}
          </>
        )}

        {view.destination === "sky" && (
          <section className="sky-panel">
            <div className="my-sky tn-card">
              <div className="my-sky__top">
                <button type="button" className="sky-avatar-hit" onClick={() => setStudio(true)} aria-label="Edit avatar">
                  <span className="sky-avatar" style={{ width: 72, height: 72 }}>
                    <img src={youSrc || undefined} alt="" />
                  </span>
                </button>
                <div>
                  <p className="my-sky__name">{MY_SKY_LABEL}</p>
                  <p className="my-sky__person">{author}</p>
                  <p className="my-sky__handle">{atHandle(youHandle)}</p>
                </div>
              </div>
              <p className="tn-lede">{state.space.manifesto || "Your space in True North."}</p>
              <div className="tn-actions">
                <button type="button" className="cta-ghost tn-action" onClick={() => setStudio(true)}>Avatar</button>
                <button type="button" className="cta-ghost tn-action" onClick={() => setEditor(true)}>Profile</button>
                <button type="button" className="cta-pist tn-action" onClick={() => goReading("group")}>Tandem</button>
              </div>
              <ul className="sky-pills">
                <li>{sun} sun</li>
                <li>{moon} moon</li>
                <li>{rising} rising</li>
                {lifePath ? <li>Path {lifePath}</li> : null}
              </ul>
            </div>

            <div className="sky-tabrow">
              <div className="tn-profile__tabs" role="tablist">
                {SKY_TABS.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    className={view.sky === tab.id ? "tn-profile__tab is-on" : "tn-profile__tab"}
                    onClick={() => goSky(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {view.sky === "chart" && <ChartHomePage />}
            {view.sky === "numbers" && <NumbersPage />}
            {view.sky === "constellation" && (
              <section className="tn-card">
                <h2 className="north-post__title">{MY_CONSTELLATION_LABEL}</h2>
                <ul className="constellation">
                  {rankedEight(state.top).map((person, index) => (
                    <ConstellationSeat
                      key={person.id}
                      person={person}
                      index={index}
                      onPromote={() => setState(current => ({ ...current, top: promoteTop(current.top, index) }))}
                      onMove={direction => setState(current => ({ ...current, top: moveTop(current.top, index, direction) }))}
                      onOpen={() => setSheet(person)}
                    />
                  ))}
                </ul>
              </section>
            )}
            {view.sky === "posts" && (
              <div className="personal-feed">
                {personal.map(post => (
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
                      if (!body.trim()) return;
                      setState(current => ({
                        ...current,
                        posts: current.posts.map(item => item.id === post.id ? addComment(item, author, body) : item),
                      }));
                      setNote(current => ({ ...current, [post.id]: "" }));
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {view.destination === "readings" && (
          <section className="reading-room">
            <div className="reading-switch" role="tablist" aria-label="Reading">
              <button type="button" role="tab" aria-selected={view.reading === "tri"} className={view.reading === "tri" ? "is-on" : ""} onClick={() => goReading("tri")}>Tri-Sky</button>
              <button type="button" role="tab" aria-selected={view.reading === "group"} className={view.reading === "group" ? "is-on" : ""} onClick={() => goReading("group")}>Tandem</button>
            </div>
            {view.reading === "group" ? (
              <GroupReadRoom
                you={{ id: "me", name: author, sun, moon, rising }}
                friends={rankedEight(state.top)}
                onPost={(title, body, bond) => {
                  const post = {
                    ...createPost({ author, handle: youHandle, sign: sun, kind: "tandem", title, body }),
                    bond,
                  };
                  setState(current => ({ ...current, posts: [post, ...current.posts] }));
                  navigate("/chart");
                }}
              />
            ) : (
              <DeepReadingPage />
            )}
          </section>
        )}
      </div>

      <nav className="north-dock" aria-label="True North places">
        <Link to="/chart" className={view.destination === "feed" ? "is-on" : ""}>Feed</Link>
        <Link to="/chart#sky" className={view.destination === "sky" ? "is-on" : ""}>My Sky</Link>
        <Link to="/chart#tri-sky" className={view.destination === "readings" && view.reading === "tri" ? "is-on" : ""}>Tri-Sky</Link>
        <Link to="/chart#group" className={view.destination === "readings" && view.reading === "group" ? "is-on" : ""}>Tandem</Link>
      </nav>

      <Dialog open={Boolean(storyPost)} onOpenChange={open => { if (!open) setStory(null); }}>
        <DialogContent className="avatar-studio">
          {storyPost ? (
            <>
              <DialogHeader>
                <DialogTitle>{storyPost.author}</DialogTitle>
                <DialogDescription>{storyPost.title}</DialogDescription>
              </DialogHeader>
              <p className="serif-quiet tn-lede">{storyPost.body}</p>
              {storyPost.cards.length > 0 ? (
                <div className="north-cards">
                  {storyPost.cards.map(card => <TarotCardArt key={card} name={card} />)}
                </div>
              ) : null}
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={studio} onOpenChange={setStudio}>
        <DialogContent className="avatar-studio">
          <DialogHeader>
            <DialogTitle>Become a True North Card</DialogTitle>
            <DialogDescription>Photo → deck character.</DialogDescription>
          </DialogHeader>
          <AvatarStudio
            space={state.space}
            onSave={next => { saveAvatar(next); setStudio(false); }}
            onClose={() => setStudio(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={editor} onOpenChange={setEditor}>
        <DialogContent className="avatar-studio">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
            <DialogDescription>Your True North details.</DialogDescription>
          </DialogHeader>
          <ProfileEditor onClose={() => setEditor(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(sheet)} onOpenChange={open => !open && setSheet(null)}>
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
                <Link className="cta-pist tn-action" to="/chart#group" onClick={() => setSheet(null)}>Open group read</Link>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
