import { useMemo, useState } from "react";
import { CardArt } from "../journal/CardArt";
import { BoldParagraphs } from "../../pages/chart/shared";
import { chartFromSigns, composeGroupReading, type GroupPerson } from "../../lib/groupSky";
import type { TopFriend } from "../../lib/northSocial";

type Seat = {
  id: string;
  name: string;
  sun: string;
  moon: string;
  rising: string;
  pronouns?: string;
  gender?: string;
  orientation?: string;
};

function demoIdentity(seat: Seat) {
  if (seat.pronouns || seat.gender || seat.orientation) return {};
  if (seat.id === "me" && seat.name === "Avery Quinn") {
    return { pronouns: "she/her", gender: "woman", orientation: "lesbian" };
  }
  if (seat.name === "Nova") {
    return { pronouns: "she/her", gender: "woman", orientation: "lesbian" };
  }
  return {};
}

export function GroupReadRoom({
  you,
  friends,
  onPost,
}: {
  you: Seat;
  friends: TopFriend[];
  onPost: (title: string, body: string, bond: string) => void;
}) {
  const seats = useMemo(() => [you, ...friends.filter(friend => friend.name !== "Open seat")], [friends, you]);
  const [picked, setPicked] = useState<string[]>(() => seats.slice(0, 4).map(seat => seat.id));
  const [reading, setReading] = useState<ReturnType<typeof composeGroupReading> | null>(null);
  const [posted, setPosted] = useState(false);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");

  const toggle = (id: string) => {
    setPosted(false);
    setPicked(current => {
      if (current.includes(id)) return current.filter(item => item !== id);
      if (current.length >= 8) return current;
      return [...current, id];
    });
  };

  const write = () => {
    setError("");
    setPosted(false);
    const chosen = seats.filter(seat => picked.includes(seat.id));
    if (chosen.length < 2 || chosen.length > 8) {
      setError("Choose 2 to 8 people.");
      setReading(null);
      return;
    }
    const people: GroupPerson[] = chosen.map(seat => ({
      id: seat.id,
      name: seat.name,
      chart: chartFromSigns({ sun: seat.sun, moon: seat.moon, rising: seat.rising, seed: seat.id }),
      ...demoIdentity(seat),
      ...(seat.pronouns ? { pronouns: seat.pronouns } : {}),
      ...(seat.gender ? { gender: seat.gender } : {}),
      ...(seat.orientation ? { orientation: seat.orientation } : {}),
    }));
    setReading(composeGroupReading(people, new Date(), { question }));
  };

  const count = picked.length;
  const tandem = count === 2;
  const label = tandem ? "Tandem" : "Group Read";

  return (
    <section className="tn-card group-read" aria-label="Group read">
      <p className="label-lock">My Constellation</p>
      <h2 className="north-post__title">Group Read</h2>
      <p className="serif-quiet tn-lede">
        Two people are a Tandem. Three to eight are a Group Read. Same seven cards as Tri-Sky.
      </p>
      <ul className="group-read__people">
        {seats.map(seat => {
          const on = picked.includes(seat.id);
          return (
            <li key={seat.id}>
              <button
                type="button"
                aria-pressed={on}
                className={on ? "is-on" : ""}
                onClick={() => toggle(seat.id)}
              >
                <strong>{seat.name}</strong>
                <span>{seat.sun} · {seat.moon} · {seat.rising}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="group-read__count">{count} selected · {label}</p>
      <label className="tn-label" htmlFor="group-question">Before you draw — what's actually going on right now?</label>
      <textarea
        id="group-question"
        className="tn-field tn-field--area"
        rows={3}
        value={question}
        onChange={event => setQuestion(event.target.value)}
        placeholder='Optional. Same note Tri-Sky uses, for example "trying to decide whether to leave my job".'
      />
      {error ? <p className="tn-alert">{error}</p> : null}
      <div className="tn-actions">
        <button type="button" className="cta-pist tn-action" onClick={write}>
          Write {label}
        </button>
        {reading ? (
          <button
            type="button"
            className="cta-ghost tn-action"
            onClick={() => {
              onPost(reading.title, reading.body, reading.bond);
              setPosted(true);
            }}
          >
            {posted ? "Posted to the feed" : "Post to the feed"}
          </button>
        ) : null}
      </div>
      {reading ? (
        <article className="group-read__letter" aria-live="polite">
          <p className="label-lock">{reading.kindLabel}</p>
          <h3>{reading.title}</h3>
          <div className="long-read-spread tn-spread group-read__spread">
            {reading.cards.map(card => (
              <div key={card.slot} className="long-read-card">
                <p className="long-read-slot-label label-lock">{card.slotName}</p>
                <CardArt card={card.card} reversed={card.reversed} />
                <p className="long-read-card-name">
                  {card.card.name}
                  {card.reversed ? " (rev.)" : ""}
                </p>
              </div>
            ))}
          </div>
          <div className="chart-profile-sections tn-letter__body">
            <div className="chart-profile-section is-lede">
              <p className="label-lock">Your reading</p>
              <div className="chart-profile-section__body">
                <BoldParagraphs text={reading.body} />
              </div>
            </div>
          </div>
        </article>
      ) : null}
    </section>
  );
}
