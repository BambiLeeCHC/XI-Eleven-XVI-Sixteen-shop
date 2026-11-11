import { useMemo, useState } from "react";
import { chartFromSigns, composeGroupReading, type GroupPerson } from "../../lib/groupSky";
import type { TopFriend } from "../../lib/northSocial";

type Seat = {
  id: string;
  name: string;
  sun: string;
  moon: string;
  rising: string;
};

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
      chart: chartFromSigns({ sun: seat.sun, moon: seat.moon, rising: seat.rising }),
    }));
    const next = composeGroupReading(people);
    setReading(next);
  };

  const count = picked.length;
  const label = count === 2 ? "Tandem" : "Group Read";

  return (
    <section className="tn-card group-read" aria-label="Group read">
      <p className="label-lock">My Constellation</p>
      <h2 className="north-post__title">Group Read</h2>
      <p className="serif-quiet tn-lede">
        Two people stay a Tandem. Three to eight are a Group Read. Same chart math as Tri-Sky’s sky: full natal charts, cross-aspects, house overlays, and the group composite.
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
          <p>{reading.body}</p>
        </article>
      ) : null}
    </section>
  );
}
