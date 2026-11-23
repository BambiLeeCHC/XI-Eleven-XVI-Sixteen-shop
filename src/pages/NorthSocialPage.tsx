import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GroupReadRoom } from "../components/north/GroupReadRoom";
import { drawCards } from "../components/north/SocialFeed";
import { AvatarStudio } from "../components/north/AvatarStudio";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  MY_CONSTELLATION_LABEL,
  NORTH_SOCIAL_STORAGE_KEY,
  activeAvatarUrl,
  addComment,
  atHandle,
  portraitFor,
  rankedEight,
  resolveTrueNorthView,
  toggleReaction,
  type PostKind,
  type SocialState,
  type SpaceProfile,
  type TopFriend,
  upgradeSocialState,
  moveTop,
  promoteTop,
} from "../lib/northSocial";
import { SkyAvatar } from "../components/north/SkyAvatar";
import { TarotCardArt } from "../components/north/TarotCardArt";
import { ConstellationSeat } from "../components/north/ConstellationSeat";
import { PostCard } from "../components/north/PostCard";
import ChartHomePage from "./chart/ChartHomePage";
import DeepReadingPage from "./DeepReadingPage";
import { NumbersPage } from "./chart/NumbersPage";
import { ProfileEditor } from "./chart/ProfileEditor";
import { TrueNorthNav, type NatalChartResult, type NumerologyResult } from "./chart/shared";

const SKY_TABS = [
  { id: "chart", label: "Chart" },
  { id: "numbers", label: "Numbers" },
  { id: "posts", label: "Posts" },
] as const;

export function NorthSocialPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const view = resolveTrueNorthView(location.pathname, location.hash);
  const user = useQuery(api.users.current);
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
    setFlashKey(k => k + 1);
  }, [view.destination, view.reading]);

  useEffect(() => {
    if (!ready || !user) return;
    if (!user.northOnboardedAt && !greeted.current && view.destination === "sky") {
      greeted.current = true;
    }
  }, [ready, user, view.destination]);

  const author = state.space.displayName || user?.name || "You";
  const youHandle = state.space.handle || "you";
  const sun = state.space.sun || chartResult?.sun || "Leo";
  const moon = state.space.moon || chartResult?.moon || "Cancer";
  const rising = state.space.rising || chartResult?.rising || "Aries";
  const lifePath = numbersResult?.lifePath;
  const youSrc = activeAvatarUrl(state.space);

  const feed = useMemo(() => {
    const posts = state.posts;
    if (filter === "posts") return posts.filter(p => p.kind === "bulletin" || p.kind === "note" || p.kind === "pull" || p.kind === "spread");
    if (filter === "tandem") return posts.filter(p => p.kind === "tandem");
    return posts;
  }, [filter, state.posts]);

  const personal = useMemo(() => {
    return state.posts.filter(p => p.handle === youHandle || p.author === author);
  }, [state.posts, youHandle, author]);

  const rings = useMemo(() => state.posts.slice(0, 12), [state.posts]);
  const storyPost = story ? state.posts.find(p => p.id === story) : null;

  const publish = (title: string, body: string, cards: string[], kind: PostKind) => {
    const text = body.trim();
    if (!text && cards.length === 0 && kind === "bulletin") return;
    setState(current => ({
      ...current,
      posts: [
        {
          id: `local-${Date.now()}`,
          author,
          handle: youHandle,
          title,
          body: text,
          cards,
          kind,
          sign: sun,
          createdAt: Date.now(),
          reactions: {},
          comments: [],
        },
        ...current.posts,
      ],
    }));
    setDraft("");
    setComposerOpen(false);
  };

  const saveAvatar = (next: Pick<SpaceProfile, "photoUrl" | "aiAvatarUrl" | "avatarMode">) => {
    setState(current => ({ ...current, space: { ...current.space, ...next } }));
  };

  const goSky = (panel: "chart" | "numbers" | "constellation" | "posts") => {
    const base = location.pathname.startsWith("/chart") ? location.pathname : "/chart";
    if (panel === "chart" || panel === "constellation") navigate(`${base}#profile`);
    else navigate(`${base}#${panel}`);
  };

  const goReading = (mode: "tri" | "group") => {
    navigate(mode === "tri" ? "/chart#tri-sky" : "/chart#group");
  };

  return (
    <div className="north-social" key={flashKey}>
      <div className="north-sweep" aria-hidden="true" />
      <div className="north-social__inner">
        <header className="north-social__mast">
          <div className="north-social__brand">
            <div>
              <p className="kicker-lock">XI · XVI</p>
              <h1 className="clash north-social__title">True North</h1>
            </div>
          </div>
          <TrueNorthNav />
        </header>

        {view.destination === "feed" && (
          <>
            <div className="story-row" aria-label="Stories">
              <button type="button" className="story-ring" onClick={() => navigate("/chart#profile")}>
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
                    <button type="button" className="cta-ghost tn-action" onClick={() => publish(`${author}'s chart`, draft || `${sun} sun · ${moon} moon · ${rising} rising`, [], "chart")}>Post chart</button>
                    <button type="button" className="cta-ghost tn-action" onClick={() => publish(`${author}'s numbers`, draft || (lifePath ? `Life path ${lifePath}` : "My numbers"), [], "number")}>Post numbers</button>
                  </div>
                </form>
              )}
            </div>

            <div className="tn-card north-filters">
              {([
                ["all", "All"],
                ["posts", "Notes"],
                ["tandem", "Tandem"],
              ] as const).map(([id, label]) => (
                <button key={id} type="button" className={filter === id ? "is-on" : ""} onClick={() => setFilter(id)}>{label}</button>
              ))}
            </div>

            {feed.map(post => (
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
              <div className="north-sky__avatar">
                <span className="north-sky__ring">
                  {youSrc ? <img src={youSrc} alt="" /> : <SkyAvatar name={author} sign={sun} size={72} />}
                </span>
              </div>
              <div>
                <p className="label-lock">Profile</p>
                <h2 className="clash">{author}</h2>
                <p className="serif-quiet tn-lede">{sun} · {moon} · {rising}{lifePath ? ` · Life path ${lifePath}` : ""}</p>
              </div>
            </div>

            <div className="north-sky__constellation">
              <p className="label-lock">{MY_CONSTELLATION_LABEL}</p>
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
            {(view.skyPanel === "chart" || !view.skyPanel || view.skyPanel === "constellation") && <ChartHomePage />}
            {view.skyPanel === "numbers" && <NumbersPage />}
            {view.skyPanel === "posts" && (
              <div className="north-personal">
                {personal.length === 0 ? (
                  <p className="serif-quiet">Nothing posted yet.</p>
                ) : personal.map(post => (
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
          <section className="tn-card north-readings">
            <div className="tn-actions">
              <button type="button" className={view.reading === "tri" ? "cta-pist tn-action" : "cta-ghost tn-action"} onClick={() => goReading("tri")}>Tri-Sky</button>
              <button type="button" className={view.reading === "group" ? "cta-pist tn-action" : "cta-ghost tn-action"} onClick={() => goReading("group")}>Group / Tandem</button>
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
                friends={state.top}
                onPost={(title, body, bond) => publish(title, body, [], "tandem")}
              />
            ) : (
              <DeepReadingPage embedded />
            )}
          </section>
        )}
      </div>

      <nav className="north-dock" aria-label="True North places">
        <Link to="/chart" className={view.destination === "feed" ? "is-on" : ""}>Feed</Link>
        <Link to="/chart#profile" className={view.destination === "sky" ? "is-on" : ""}>Profile</Link>
        <Link to="/chart#readings" className={view.destination === "readings" ? "is-on" : ""}>Readings</Link>
        <button type="button" className="north-dock__util" onClick={() => setEditor(true)}>Edit Profile</button>
        <button type="button" className="north-dock__util" onClick={() => void signOut()}>Sign out</button>
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
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update what your profile shows — details, chart, numbers, constellation, and avatar.</DialogDescription>
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
