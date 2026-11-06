import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CompassRose } from "../components/north/CompassRose";
import { NatalWheelSvg } from "../components/north/NatalWheelSvg";
import { TarotCardArt } from "../components/north/TarotCardArt";
import { TrueNorthAtmosphere } from "../components/journal/TrueNorthAtmosphere";
import { FULL_DECK } from "../data/fullDeck";
import { api, useQuery } from "../lib/backend";
import {
  addComment,
  blankState,
  createPost,
  moveTop,
  promoteTop,
  REACTION_LABEL,
  toggleReaction,
  upsertFriend,
  type ReactionKey,
  type SocialState,
  type TopFriend,
} from "../lib/northSocial";
import { TrueNorthNav } from "./chart/shared";

const KEY = "xixvi-north-social-v1";
type View = "feed" | "space" | "studio" | "tandem";

function loadState(): SocialState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw) as SocialState;
    if (!parsed.posts || !parsed.top || !parsed.space) return blankState();
    return parsed;
  } catch {
    return blankState();
  }
}

function drawThree() {
  const copy = [...FULL_DECK];
  const picked = [];
  for (let i = 0; i < 3 && copy.length; i += 1) {
    const index = Math.floor(Math.random() * copy.length);
    const card = copy.splice(index, 1)[0];
    if (card) picked.push(card.name);
  }
  return picked;
}

export function NorthSocialPage() {
  const user = useQuery(api.auth.currentUser);
  const [view, setView] = useState<View>("feed");
  const [state, setState] = useState<SocialState>(() => blankState());
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState("");
  const [story, setStory] = useState<string | null>(null);
  const [note, setNote] = useState<Record<string, string>>({});
  const [friend, setFriend] = useState({ name: "", handle: "", sun: "Aries", moon: "Cancer", rising: "Libra" });
  const [pull, setPull] = useState<string[]>([]);
  const [activeBody, setActiveBody] = useState<string | null>("Sun");

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [ready, state]);

  const author = (user?.name as string | undefined) || state.space.name || "You";
  const storyPost = state.posts.find(post => post.id === story);
  const wheel = useMemo(
    () => ({
      placements: [
        { body: "Sun", degree: 12.47 },
        { body: "Moon", degree: 103.04 },
        { body: "Mercury", degree: 26.72 },
        { body: "Venus", degree: 326.03 },
        { body: "Mars", degree: 316.22 },
      ],
      aspects: [
        { bodyA: "Sun", bodyB: "Moon", aspect: "square" },
        { bodyA: "Mercury", bodyB: "Venus", aspect: "sextile" },
      ],
    }),
    [],
  );

  const publish = (title: string, body: string, cards: string[], kind: "pull" | "chart" | "spread") => {
    if (!body.trim() && cards.length === 0) return;
    setState(current => ({
      ...current,
      posts: [createPost({
        author,
        handle: author.toLowerCase().replace(/\s+/g, ""),
        sign: current.space.sun,
        kind,
        title,
        body,
        cards,
      }), ...current.posts],
    }));
    setDraft("");
    setView("feed");
  };

  const react = (id: string, key: ReactionKey) => {
    setState(current => ({
      ...current,
      posts: current.posts.map(post => (post.id === id ? toggleReaction(post, key) : post)),
    }));
  };

  const comment = (id: string) => {
    const body = note[id] ?? "";
    setState(current => ({
      ...current,
      posts: current.posts.map(post => (post.id === id ? addComment(post, author, body) : post)),
    }));
    setNote(current => ({ ...current, [id]: "" }));
  };

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
    setState(current => ({ ...current, top: upsertFriend(current.top, next, 7) }));
    setFriend({ name: "", handle: "", sun: "Aries", moon: "Cancer", rising: "Libra" });
  };

  return (
    <div className="journal-page journal-page--truenorth north-social">
      <TrueNorthAtmosphere />
      <div className="journal-stack tn-shell">
        <header className="tn-card north-social__head">
          <div className="north-social__brand">
            <CompassRose />
            <div>
              <p className="label-lock">True North</p>
              <h1 className="clash north-social__title">The circle</h1>
            </div>
          </div>
          <div className="north-social__switch" role="tablist" aria-label="True North">
            {([
              ["feed", "Feed"],
              ["space", "My Space & Top 8"],
              ["studio", "Tarot & Chart Studio"],
              ["tandem", "Tandem Bonds"],
            ] as const).map(([id, label]) => (
              <button key={id} type="button" role="tab" aria-selected={view === id} className={view === id ? "is-on" : ""} onClick={() => setView(id)}>
                {label}
              </button>
            ))}
          </div>
          <TrueNorthNav />
        </header>

        {view === "feed" && (
          <>
            <div className="story-row" aria-label="Daily pulls">
              {state.posts.slice(0, 8).map(post => (
                <button key={post.id} type="button" className="story-ring" onClick={() => setStory(post.id)}>
                  <span>{post.sign.slice(0, 2)}</span>
                  <small>{post.author}</small>
                </button>
              ))}
            </div>
            <form className="tn-card north-composer" onSubmit={event => { event.preventDefault(); publish("A note from the feed", draft, pull, pull.length ? "pull" : "bulletin"); }}>
              <label className="tn-label" htmlFor="north-draft">Share a pull</label>
              <textarea id="north-draft" className="tn-field tn-field--area" value={draft} onChange={event => setDraft(event.target.value)} placeholder="What did the cards say?" />
              <div className="north-cards">
                {pull.map(card => <TarotCardArt key={card} name={card} />)}
              </div>
              <div className="tn-actions">
                <button type="button" className="cta-ghost tn-action" onClick={() => setPull(drawThree())}>Draw three</button>
                <button type="submit" className="cta-pist tn-action">Post</button>
              </div>
            </form>
            {state.posts.map(post => (
              <article key={post.id} className="tn-card north-post">
                <p className="label-lock">{post.author} · {post.sign}</p>
                <h2 className="clash north-post__title">{post.title}</h2>
                <p className="serif-quiet tn-lede">{post.body}</p>
                {post.cards.length > 0 && (
                  <div className="north-cards">
                    {post.cards.map(card => <TarotCardArt key={card} name={card} />)}
                  </div>
                )}
                <div className="north-react">
                  {(Object.keys(REACTION_LABEL) as ReactionKey[]).map(key => (
                    <button key={key} type="button" className={post.mine.includes(key) ? "is-on" : ""} onClick={() => react(post.id, key)}>
                      {REACTION_LABEL[key]} {post.reactions[key]}
                    </button>
                  ))}
                </div>
                <ul className="north-comments">
                  {post.comments.map(item => (
                    <li key={item.id}><strong>{item.author}</strong> {item.body}</li>
                  ))}
                </ul>
                <form onSubmit={event => { event.preventDefault(); comment(post.id); }}>
                  <label className="tn-label" htmlFor={`note-${post.id}`}>Note</label>
                  <input id={`note-${post.id}`} className="tn-field" value={note[post.id] ?? ""} onChange={event => setNote(current => ({ ...current, [post.id]: event.target.value }))} />
                </form>
              </article>
            ))}
          </>
        )}

        {view === "space" && (
          <div className="north-space">
            <section className="tn-card">
              <p className="label-lock">My space</p>
              <h2 className="clash north-post__title">{state.space.name}</h2>
              <p className="serif-quiet tn-lede">{state.space.manifesto}</p>
              <p className="tn-meta">{state.space.sun} · {state.space.moon} · {state.space.rising} · Life path {state.space.lifePath}</p>
              <p className="tn-meta">Altar: {state.space.altar}</p>
              <label className="tn-label" htmlFor="mood">Mood</label>
              <input id="mood" className="tn-field" value={state.space.mood} onChange={event => setState(current => ({ ...current, space: { ...current.space, mood: event.target.value } }))} />
              <label className="tn-label" htmlFor="anthem">Soundtrack</label>
              <input id="anthem" className="tn-field" value={state.space.anthem} onChange={event => setState(current => ({ ...current, space: { ...current.space, anthem: event.target.value } }))} />
            </section>
            <section className="tn-card">
              <p className="label-lock">Top 8</p>
              <ol className="top8">
                {state.top.slice(0, 8).map((person, index) => (
                  <li key={person.id}>
                    <span className="top8__rank">#{index + 1}</span>
                    <strong>{person.name}</strong>
                    <span>@{person.handle}</span>
                    <span>{person.sun} · {person.moon} · {person.rising}</span>
                    <span>{person.vibe}</span>
                    <div className="tn-actions">
                      <button type="button" className="cta-ghost tn-action" onClick={() => setState(current => ({ ...current, top: promoteTop(current.top, index) }))}>Make #1</button>
                      <button type="button" className="cta-ghost tn-action" onClick={() => setState(current => ({ ...current, top: moveTop(current.top, index, -1) }))}>Move up</button>
                      <Link className="cta-pist tn-action" to="/chart/circle">Tandem</Link>
                    </div>
                  </li>
                ))}
              </ol>
              <form className="north-friend" onSubmit={event => { event.preventDefault(); saveFriend(); }}>
                <label className="tn-label" htmlFor="friend-name">Add to the last seat</label>
                <input id="friend-name" className="tn-field" value={friend.name} onChange={event => setFriend(current => ({ ...current, name: event.target.value }))} placeholder="Name" />
                <input className="tn-field" value={friend.handle} onChange={event => setFriend(current => ({ ...current, handle: event.target.value }))} placeholder="Handle" aria-label="Handle" />
                <button type="submit" className="cta-pist tn-action">Save friend</button>
              </form>
            </section>
          </div>
        )}

        {view === "studio" && (
          <section className="tn-card">
            <p className="label-lock">Studio</p>
            <NatalWheelSvg
              placements={wheel.placements}
              aspects={wheel.aspects}
              active={activeBody}
              onPick={setActiveBody}
            />
            <p className="tn-meta">{activeBody ? `${activeBody} highlighted on the wheel.` : "Tap a planet."}</p>
            <div className="tn-actions">
              <button type="button" className="cta-pist tn-action" onClick={() => publish("Chart highlight", `${state.space.sun} sun, ${state.space.moon} moon, ${state.space.rising} rising.`, [], "chart")}>Share chart highlight</button>
              <button type="button" className="cta-ghost tn-action" onClick={() => { const cards = drawThree(); setPull(cards); publish("Three-card pull", cards.join(" · "), cards, "spread"); }}>Share pull to feed</button>
            </div>
            <p className="tn-meta">Your saved chart still lives on your profile when you are signed in.</p>
            <Link to="/profile#chart" className="tn-inline">Open the full chart</Link>
          </section>
        )}

        {view === "tandem" && (
          <section className="tn-card">
            <p className="label-lock">Tandem</p>
            <h2 className="clash north-post__title">Read with someone who agrees.</h2>
            <p className="serif-quiet tn-lede">Invitations stay in the app. A session opens only after they accept.</p>
            <Link to="/chart/circle" className="cta-pist tn-action">Open tandem</Link>
          </section>
        )}

        {storyPost && (
          <div className="story-modal" role="dialog" aria-modal="true" aria-label={storyPost.title}>
            <article className="tn-card">
              <p className="label-lock">{storyPost.author} · {storyPost.sign}</p>
              <h2 className="clash north-post__title">{storyPost.title}</h2>
              <p className="serif-quiet tn-lede">{storyPost.body}</p>
              <div className="north-cards">
                {storyPost.cards.map(card => <TarotCardArt key={card} name={card} />)}
              </div>
              <button type="button" className="cta-ghost tn-action" onClick={() => setStory(null)}>Close</button>
            </article>
          </div>
        )}
      </div>
    </div>
  );
}
