import { useEffect, useState } from "react";
import { TrueNorthAtmosphere } from "../components/journal/TrueNorthAtmosphere";
import { CompassRose } from "../components/north/CompassRose";
import { PersonalProfile } from "../components/north/PersonalProfile";
import { TarotCardArt } from "../components/north/TarotCardArt";
import { useNorthSocial } from "../components/north/useNorthSocial";
import { FULL_DECK } from "../data/fullDeck";
import { api, useQuery } from "../lib/backend";
import {
  addComment,
  createPost,
  MY_SKY_LABEL,
  NORTH_SOCIAL_SKY_TAB,
  REACTION_LABEL,
  type ReactionKey,
  rankedEight,
  type SocialPost,
  starterTop,
  type TopFriend,
  toggleReaction,
  upsertFriend,
} from "../lib/northSocial";
import { TrueNorthNav } from "./chart/shared";

type FeedTab = "all" | "posts" | "tandem" | "friends";

function drawThree() {
  const copy = [...FULL_DECK];
  const picked: string[] = [];
  for (let i = 0; i < 3 && copy.length; i += 1) {
    const index = Math.floor(Math.random() * copy.length);
    const card = copy.splice(index, 1)[0];
    if (card) picked.push(card.name);
  }
  return picked;
}

export function NorthSocialPage() {
  const user = useQuery(api.auth.currentUser);
  const { state, setState } = useNorthSocial();
  const [sky, setSky] = useState(false);
  const [feed, setFeed] = useState<FeedTab>("all");
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [story, setStory] = useState<string | null>(null);
  const [note, setNote] = useState<Record<string, string>>({});
  const [pull, setPull] = useState<string[]>([]);
  const [friend, setFriend] = useState({ name: "", handle: "" });

  useEffect(() => {
    const read = () => setSky(window.location.hash === "#sky");
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const author =
    (user?.name as string | undefined) || state.space.name || "You";
  const storyPost = state.posts.find(post => post.id === story);
  const visible = state.posts.filter(post => {
    if (feed === "tandem") return post.kind === "tandem";
    if (feed === "posts") return post.kind !== "tandem";
    return true;
  });

  const openSky = () => {
    window.history.replaceState(window.history.state, "", "#sky");
    setSky(true);
  };

  const leaveSky = () => {
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname,
    );
    setSky(false);
  };

  const publish = (
    title: string,
    body: string,
    cards: string[],
    kind: SocialPost["kind"],
  ) => {
    if (!body.trim() && cards.length === 0) return;
    setState(current => ({
      ...current,
      posts: [
        createPost({
          author,
          handle: author.toLowerCase().replace(/\s+/g, ""),
          sign: current.space.sun,
          kind,
          title,
          body,
          cards,
        }),
        ...current.posts,
      ],
    }));
    setDraft("");
    setComposerOpen(false);
    setFeed("all");
  };

  const react = (id: string, key: ReactionKey) => {
    setState(current => ({
      ...current,
      posts: current.posts.map(post =>
        post.id === id ? toggleReaction(post, key) : post,
      ),
    }));
  };

  const comment = (id: string) => {
    const body = note[id] ?? "";
    setState(current => ({
      ...current,
      posts: current.posts.map(post =>
        post.id === id ? addComment(post, author, body) : post,
      ),
    }));
    setNote(current => ({ ...current, [id]: "" }));
  };

  const addSuggested = (person: TopFriend) => {
    setState(current => ({
      ...current,
      top: upsertFriend(current.top, { ...person, vibe: "Chosen" }, 7),
    }));
  };

  if (sky) {
    return (
      <div className="journal-page journal-page--truenorth north-social">
        <TrueNorthAtmosphere />
        <div className="journal-stack tn-shell">
          <PersonalProfile showNav onLeaveSky={leaveSky} />
        </div>
      </div>
    );
  }

  const suggestions = starterTop().filter(
    person =>
      !rankedEight(state.top).some(seat => seat.handle === person.handle),
  );

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
          <div className="north-social__switch">
            <button type="button" className="is-on">
              Feed
            </button>
            <button
              type="button"
              aria-label={NORTH_SOCIAL_SKY_TAB}
              onClick={openSky}
            >
              {MY_SKY_LABEL}
            </button>
          </div>
          <TrueNorthNav />
        </header>

        <div className="story-row" role="group" aria-label="Daily pulls">
          {state.posts.slice(0, 8).map(post => (
            <button
              key={post.id}
              type="button"
              className="story-ring"
              onClick={() => setStory(post.id)}
            >
              <span>{post.sign.slice(0, 2)}</span>
              <small>{post.author}</small>
            </button>
          ))}
        </div>

        <div className="tn-card north-composer">
          <button
            type="button"
            className="tn-inline"
            aria-expanded={composerOpen}
            onClick={() => setComposerOpen(open => !open)}
          >
            {composerOpen ? "Close composer" : "Share a pull"}
          </button>
          {composerOpen && (
            <form
              onSubmit={event => {
                event.preventDefault();
                publish(
                  "A note from the feed",
                  draft,
                  pull,
                  pull.length ? "pull" : "bulletin",
                );
              }}
            >
              <label className="tn-label" htmlFor="north-draft">
                Share a pull
              </label>
              <textarea
                id="north-draft"
                className="tn-field tn-field--area"
                value={draft}
                onChange={event => setDraft(event.target.value)}
                placeholder="What did the cards say?"
              />
              <div className="north-cards">
                {pull.map(card => (
                  <TarotCardArt key={card} name={card} />
                ))}
              </div>
              <div className="tn-actions">
                <button
                  type="button"
                  className="cta-ghost tn-action"
                  onClick={() => setPull(drawThree())}
                >
                  Draw three
                </button>
                <button type="submit" className="cta-pist tn-action">
                  Post
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="tn-subtabs" role="tablist" aria-label="Feed">
          {(
            [
              ["all", "All"],
              ["posts", "Posts & Pulls"],
              ["tandem", "Tandem"],
              ["friends", "Find Friends"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={feed === id}
              className={feed === id ? "is-on" : ""}
              onClick={() => setFeed(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {feed === "friends" ? (
          <section className="tn-card">
            <h2 className="clash north-post__title">Find Friends</h2>
            <ul className="north-comments">
              {suggestions.map(person => (
                <li key={person.id}>
                  <strong>{person.name}</strong> @{person.handle} · {person.sun}
                  <button
                    type="button"
                    className="cta-ghost tn-action"
                    onClick={() => addSuggested(person)}
                  >
                    Add to seat 8
                  </button>
                </li>
              ))}
            </ul>
            <form
              className="north-friend"
              onSubmit={event => {
                event.preventDefault();
                if (!friend.name.trim()) return;
                addSuggested({
                  id: `friend-${Date.now()}`,
                  name: friend.name.trim(),
                  handle:
                    friend.handle.trim() || friend.name.trim().toLowerCase(),
                  sun: "Aries",
                  moon: "Cancer",
                  rising: "Libra",
                  vibe: "Chosen",
                });
                setFriend({ name: "", handle: "" });
              }}
            >
              <label className="tn-label" htmlFor="find-friend">
                Add by name
              </label>
              <input
                id="find-friend"
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
                Add to seat 8
              </button>
            </form>
          </section>
        ) : (
          visible.map(post => (
            <article key={post.id} className="tn-card north-post">
              <p className="label-lock">
                {post.author} · {post.sign}
              </p>
              <h2 className="clash north-post__title">{post.title}</h2>
              <p className="serif-quiet tn-lede">{post.body}</p>
              {post.cards.length > 0 && (
                <div className="north-cards">
                  {post.cards.map(card => (
                    <TarotCardArt key={card} name={card} />
                  ))}
                </div>
              )}
              <div className="north-react">
                {(Object.keys(REACTION_LABEL) as ReactionKey[]).map(key => (
                  <button
                    key={key}
                    type="button"
                    className={post.mine.includes(key) ? "is-on" : ""}
                    onClick={() => react(post.id, key)}
                  >
                    {REACTION_LABEL[key]} {post.reactions[key]}
                  </button>
                ))}
              </div>
              <ul className="north-comments">
                {post.comments.map(item => (
                  <li key={item.id}>
                    <strong>{item.author}</strong> {item.body}
                  </li>
                ))}
              </ul>
              <form
                onSubmit={event => {
                  event.preventDefault();
                  comment(post.id);
                }}
              >
                <label className="tn-label" htmlFor={`note-${post.id}`}>
                  Note
                </label>
                <input
                  id={`note-${post.id}`}
                  className="tn-field"
                  value={note[post.id] ?? ""}
                  onChange={event =>
                    setNote(current => ({
                      ...current,
                      [post.id]: event.target.value,
                    }))
                  }
                />
              </form>
            </article>
          ))
        )}

        {storyPost && (
          <div
            className="story-modal"
            role="dialog"
            aria-modal="true"
            aria-label={storyPost.title}
          >
            <article className="tn-card">
              <p className="label-lock">
                {storyPost.author} · {storyPost.sign}
              </p>
              <h2 className="clash north-post__title">{storyPost.title}</h2>
              <p className="serif-quiet tn-lede">{storyPost.body}</p>
              <div className="north-cards">
                {storyPost.cards.map(card => (
                  <TarotCardArt key={card} name={card} />
                ))}
              </div>
              <button
                type="button"
                className="cta-ghost tn-action"
                onClick={() => setStory(null)}
              >
                Close
              </button>
            </article>
          </div>
        )}
      </div>
    </div>
  );
}
