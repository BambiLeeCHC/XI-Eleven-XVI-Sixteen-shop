import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GroupReadRoom } from "../components/north/GroupReadRoom";
import { CompassRose } from "../components/north/CompassRose";
import { SkyAvatar } from "../components/north/SkyAvatar";
import { AvatarStudio } from "../components/north/AvatarStudio";
import { TarotCardArt } from "../components/north/TarotCardArt";
import { HeirloomBacksCarousel } from "../components/north/HeirloomBacksCarousel";
import { ConstellationSeat, PostCard, atHandle, portraitFor } from "../components/north/NorthSocialPieces";
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
    setState(current => {
      const photo = typeof user.photoUrl === "string" ? user.photoUrl : current.space.photoUrl;
      const ai = typeof user.aiAvatarUrl === "string" ? user.aiAvatarUrl : current.space.aiAvatarUrl;
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
                  <textarea id="north-draft" className="tn-field tn-field--area" rows={3} value={draft} onChange={event => setDraft(event.target.value)} />
                  <div className="tn-actions">
                    <button type="submit" className="cta-pist tn-action">Post</button>
                    <button type="button" className="cta-ghost tn-action" onClick={() => publish("A pull", draft, drawCards(3), "bulletin")}>Post with cards</button>
                  </div>
                </form>
              )}
            </div>

            <div className="tn-card north-filters">
              {([
                ["all", "All"],
                ["posts", "Notes"],
                ["tandem", "Tandem"],
                ["friends", "Circle"],
              ] as const).map(([id, label]) => (
                <button key={id} type="button" className={filter === id ? "is-on" : ""} onClick={() => setFilter(id)}>{label}</button>
              ))}
            </div>

            {filter === "friends" ? (
              <section className="tn-card">
                <p className="label-lock">Circle</p>
                <ul className="constellation">
                  {rankedEight(state.top).slice(0, 4).map(person => (
                    <ConstellationSeat
                      key={person.id}
                      person={person}
                      index={state.top.findIndex(item => item.id === person.id)}
                      onPromote={() => setState(current => ({ ...current, top: promoteTop(current.top, current.top.findIndex(item => item.id === person.id)) }))}
                      onMove={direction => setState(current => ({ ...current, top: moveTop(current.top, current.top.findIndex(item => item.id === person.id), direction) }))}
                      onOpen={() => setSheet(person)}
                    />
                  ))}
                </ul>
              </section>
            ) : feed.map(post => (
              <PostCard
                key={post.id}
                post={post}
                youHandle={youHandle}
                youSrc={youSrc}
                onReact={key => setState(current => ({ ...current, posts: current.posts.map(item => item.id === post.id ? toggleReaction(item, key) : item) }))}
                onComment={body => setState(current => ({
                  ...current,
                  posts: current.posts.map(item => item.id === post.id ? addComment(item, author, body) : item),
                }))}
              />
            ))}
          </>
        )}

        {view.destination === "sky" && (
          <section className="tn-card north-sky">
            <div className="north-sky__you">
              <button type="button" className="north-sky__avatar" onClick={() => setStudio(true)}>
                <span className="north-sky__ring">
                  <img src={youSrc || undefined} alt="" />
                </span>
                <small>Edit card</small>
              </button>
              <div>
                <p className="label-lock">{MY_SKY_LABEL}</p>
                <h2 className="clash">{author}</h2>
                <p className="serif-quiet tn-lede">{sun} · {moon} · {rising}{lifePath ? ` · ${lifePath}` : ""}</p>
                <div className="tn-actions">
                  <button type="button" className="cta-ghost tn-action" onClick={() => setEditor(true)}>Profile</button>
                  <button type="button" className="cta-ghost tn-action" onClick={() => void signOut()}>Sign out</button>
                </div>
              </div>
            </div>
            <div className="north-sky__tabs" role="tablist">
              {SKY_TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  className={view.skyPanel === tab.id || (tab.id === "chart" && !view.skyPanel) ? "is-on" : ""}
                  onClick={() => goSky(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {(view.skyPanel === "chart" || !view.skyPanel) && <ChartHomePage />}
            {view.skyPanel === "numbers" && <NumbersPage />}
            {view.skyPanel === "constellation" && (
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
            )}
            {view.skyPanel === "posts" && (
              <div className="north-personal">
                {personal.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    youHandle={youHandle}
                    youSrc={youSrc}
                    onReact={key => setState(current => ({ ...current, posts: current.posts.map(item => item.id === post.id ? toggleReaction(item, key) : item) }))}
                    onComment={body => setState(current => ({
                      ...current,
                      posts: current.posts.map(item => item.id === post.id ? addComment(item, author, body) : item),
                    }))}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {view.destination === "readings" && (
          <section className="tn-card">
            <div className="tn-actions">
              <button type="button" className={view.reading === "tri" ? "cta-pist tn-action" : "cta-ghost tn-action"} onClick={() => goReading("tri")}>Tri-Sky</button>
              <button type="button" className={view.reading === "group" ? "cta-pist tn-action" : "cta-ghost tn-action"} onClick={() => goReading("group")}>Group Read</button>
            </div>
            {view.reading === "group" ? (
              <GroupReadRoom
                you={{
                  id: "me",
                  name: author,
                  sun,
                  moon,
                  rising,
                }}
                friends={rankedEight(state.top)}
                onPost={(title, body, bond) => {
                  const post = createPost({
                    author,
                    handle: youHandle,
                    sign: sun,
                    kind: "tandem",
                    title,
                    body,
                    cards: [],
                    bond,
                  });
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
        <Link to="/chart#group" className={view.destination === "readings" && view.reading === "group" ? "is-on" : ""}>Group Read</Link>
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
