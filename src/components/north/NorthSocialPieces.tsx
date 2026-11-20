import { Link } from "react-router-dom";
import { SkyAvatar } from "./SkyAvatar";
import { TarotCardArt } from "./TarotCardArt";
import {
  REACTION_LABEL,
  type ReactionKey,
  type SocialPost,
  type TopFriend,
} from "../../lib/northSocial";
import { celestialPortraitSvg } from "../../lib/celestialAvatar";

function atHandle(handle: string) {
  return `@${handle.trim().replace(/^@+/, "")}`;
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
        {post.kind === "tandem" && !post.title.startsWith("Group Read") ? (
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

const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

export { ConstellationSeat, PostCard, atHandle, portraitFor, SIGNS };
