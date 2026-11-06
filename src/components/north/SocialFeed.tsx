import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FULL_DECK } from "../../data/fullDeck";
import {
  FEED_FILTERS,
  addComment,
  filterFeed,
  publishToFeed,
  toggleReaction,
  type FeedFilter,
  type ReactionKey,
  type SocialPost,
  type SocialState,
  REACTION_LABEL,
  VIEWER_ID,
} from "../../lib/northSocial";
import { TarotCardArt } from "./TarotCardArt";

export function drawCards(count: number): string[] {
  const copy = [...FULL_DECK];
  const picked: string[] = [];
  for (let index = 0; index < count && copy.length; index += 1) {
    const pick = Math.floor(Math.random() * copy.length);
    const card = copy.splice(pick, 1)[0];
    if (card) picked.push(card.name);
  }
  return picked;
}

function tandemTitle(post: SocialPost) {
  const left = post.authorId === VIEWER_ID ? "You" : post.author;
  const right = post.partnerId === VIEWER_ID ? "You" : post.partnerName;
  if (!right) return post.title;
  return `${left} × ${right}`;
}

function PostCard({
  post,
  onReact,
  onComment,
}: {
  post: SocialPost;
  onReact: (key: ReactionKey) => void;
  onComment: (body: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const tandem = post.kind === "tandem";
  const title = tandem ? tandemTitle(post) : post.title;
  return (
    <article className={`tn-card north-post${tandem ? " north-post--tandem" : ""}${post.kind === "bulletin" ? " north-post--bulletin" : ""}`}>
      <p className="label-lock">
        {tandem ? "Tandem reading" : post.kind === "bulletin" ? "Collective Sky" : post.author}
        {post.kind !== "bulletin" ? ` · ${post.sign}` : ""}
      </p>
      <h2 className="clash north-post__title">{title}</h2>
      {tandem && post.bond ? <p className="constellation__vibe">{post.bond}</p> : null}
      <p className="serif-quiet tn-lede">{post.reflection || post.body}</p>
      {post.cards.length > 0 && (
        <div className="north-cards">
          {post.cards.map(card => (
            <TarotCardArt key={`${post.id}-${card}`} name={card} />
          ))}
        </div>
      )}
      {tandem && (
        <p className="tn-meta">
          <Link to="/chart/circle" className="tn-inline">Open live tandem</Link>
        </p>
      )}
      <div className="north-react">
        {(Object.keys(REACTION_LABEL) as ReactionKey[]).map(key => (
          <button
            key={key}
            type="button"
            className={post.mine.includes(key) ? "is-on" : ""}
            onClick={() => onReact(key)}
          >
            {REACTION_LABEL[key]} {post.reactions[key]}
          </button>
        ))}
      </div>
      {post.comments.length > 0 && (
        <ul className="north-comments">
          {post.comments.map(item => (
            <li key={item.id}>
              <strong>{item.author}</strong> {item.body}
            </li>
          ))}
        </ul>
      )}
      <form
        onSubmit={event => {
          event.preventDefault();
          if (!draft.trim()) return;
          onComment(draft);
          setDraft("");
        }}
      >
        <label className="tn-label" htmlFor={`note-${post.id}`}>Note</label>
        <input
          id={`note-${post.id}`}
          className="tn-field"
          value={draft}
          onChange={event => setDraft(event.target.value)}
        />
      </form>
    </article>
  );
}

export function FeedFilterBar({
  value,
  onChange,
}: {
  value: FeedFilter;
  onChange: (next: FeedFilter) => void;
}) {
  return (
    <div className="north-social__switch" role="tablist" aria-label="Feed filter">
      {FEED_FILTERS.map(filter => (
        <button
          key={filter.id}
          type="button"
          role="tab"
          aria-selected={value === filter.id}
          className={value === filter.id ? "is-on" : ""}
          onClick={() => onChange(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export function FeedStream({
  posts,
  update,
}: {
  posts: SocialPost[];
  update: (next: (current: SocialState) => SocialState) => void;
}) {
  if (posts.length === 0) {
    return <p className="tn-card tn-sky__note">Nothing in this filter yet.</p>;
  }
  return (
    <>
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onReact={key =>
            update(current => ({
              ...current,
              posts: current.posts.map(item => (item.id === post.id ? toggleReaction(item, key) : item)),
            }))
          }
          onComment={body =>
            update(current => ({
              ...current,
              posts: current.posts.map(item =>
                item.id === post.id ? addComment(item, current.space.name || "You", body) : item,
              ),
            }))
          }
        />
      ))}
    </>
  );
}

export function PersonalComposer({
  state,
  update,
  partnerId,
}: {
  state: SocialState;
  update: (next: (current: SocialState) => SocialState) => void;
  partnerId?: string | null;
}) {
  const friends = (state.friends ?? []).filter(friend => friend.handle !== "open");
  const [draft, setDraft] = useState("");
  const [reflection, setReflection] = useState("");
  const [partner, setPartner] = useState(partnerId || friends[0]?.id || "");
  useEffect(() => {
    if (partnerId) setPartner(partnerId);
  }, [partnerId]);
  const chosen = friends.find(friend => friend.id === partner) ?? null;

  const publish = (kind: SocialPost["kind"], title: string, body: string, cards: string[] = [], withPartner = false) => {
    if (!body.trim() && cards.length === 0) return;
    update(current =>
      publishToFeed(current, {
        kind,
        title,
        body,
        cards,
        partner: withPartner ? chosen : null,
      }),
    );
    setDraft("");
    setReflection("");
  };

  return (
    <form
      className="tn-card north-composer"
      onSubmit={event => {
        event.preventDefault();
        publish("note", "A note", draft);
      }}
    >
      <label className="tn-label" htmlFor="sky-note">Post to your sky</label>
      <textarea
        id="sky-note"
        className="tn-field tn-field--area"
        value={draft}
        onChange={event => setDraft(event.target.value)}
        placeholder="A note, a pull, a small true thing."
      />
      <div className="tn-actions">
        <button type="submit" className="cta-pist tn-action">Post note</button>
        <button
          type="button"
          className="cta-ghost tn-action"
          onClick={() => {
            const cards = drawCards(1);
            publish("pull", "Quick pull", cards[0] ? `${cards[0]}.` : "A one-card pull.", cards);
          }}
        >
          Quick tarot pull
        </button>
        <button
          type="button"
          className="cta-ghost tn-action"
          onClick={() => {
            const cards = drawCards(3);
            publish("spread", "Three-card spread", cards.join(" · "), cards);
          }}
        >
          Three-card spread
        </button>
      </div>
      <div className="tandem-logger">
        <p className="label-lock">Tandem reading</p>
        <label className="tn-label" htmlFor="tandem-friend">With</label>
        <select
          id="tandem-friend"
          className="tn-field"
          value={partner}
          onChange={event => setPartner(event.target.value)}
        >
          {friends.length === 0 && <option value="">Add a friend first</option>}
          {friends.map(friend => (
            <option key={friend.id} value={friend.id}>
              {friend.name} · {friend.vibe}
            </option>
          ))}
        </select>
        <label className="tn-label" htmlFor="tandem-reflection">Shared reflection</label>
        <textarea
          id="tandem-reflection"
          className="tn-field tn-field--area"
          value={reflection}
          onChange={event => setReflection(event.target.value)}
          placeholder="What did you both see?"
        />
        <div className="tn-actions">
          <button
            type="button"
            className="cta-pist tn-action"
            disabled={!chosen || !reflection.trim()}
            onClick={() => {
              if (!chosen) return;
              const cards = drawCards(2);
              publish(
                "tandem",
                `You × ${chosen.name}`,
                reflection.trim(),
                cards,
                true,
              );
            }}
          >
            Publish tandem reading
          </button>
          <Link to="/chart/circle" className="cta-ghost tn-action">Open live tandem</Link>
        </div>
      </div>
    </form>
  );
}

export function FilteredFeed({
  posts,
  update,
  testId,
}: {
  posts: SocialPost[];
  update: (next: (current: SocialState) => SocialState) => void;
  testId: string;
}) {
  const [filter, setFilter] = useState<FeedFilter>("all");
  const visible = filterFeed(posts, filter);
  return (
    <div data-testid={testId} className="sky-feed">
      <FeedFilterBar value={filter} onChange={setFilter} />
      <FeedStream posts={visible} update={update} />
    </div>
  );
}
