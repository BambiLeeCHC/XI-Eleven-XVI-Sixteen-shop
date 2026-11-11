import { useMemo, useState } from "react";
import { CardArt } from "../journal/CardArt";
import {
  chartFromSigns,
  composeGroupReading,
  GROUP_BONDS,
  promptIdeas,
  TANDEM_BONDS,
  type GroupPerson,
  type ReadLens,
} from "../../lib/groupSky";
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
  const [connectionId, setConnectionId] = useState("friends");
  const [otherText, setOtherText] = useState("");
  const [leadId, setLeadId] = useState("");

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
    const bond = (tandem ? TANDEM_BONDS : GROUP_BONDS).find(item => item.id === connectionId);
    const lens: ReadLens = {
      question,
      connectionId,
      connectionLabel: bond?.label ?? "Other",
      otherText: connectionId === "other" ? otherText : "",
      leadId,
    };
    setReading(composeGroupReading(people, new Date(), lens));
  };

  const count = picked.length;
  const tandem = count === 2;
  const label = tandem ? "Tandem" : "Group Read";
  const bonds = tandem ? TANDEM_BONDS : GROUP_BONDS;
  const ideas = promptIdeas(connectionId, tandem);
  const directed = tandem && (connectionId === "parent-child" || connectionId.startsWith("mother") || connectionId.startsWith("father") || connectionId === "mentor");
  const chosenSeats = seats.filter(seat => picked.includes(seat.id));

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
      <label className="tn-label" htmlFor="group-connection">{tandem ? "Relationship" : "This group is"}</label>
      <select
        id="group-connection"
        className="tn-field"
        value={connectionId}
        onChange={event => setConnectionId(event.target.value)}
      >
        {bonds.map(bond => (
          <option key={bond.id} value={bond.id}>{bond.label}</option>
        ))}
      </select>
      {connectionId === "other" ? (
        <input
          className="tn-field"
          value={otherText}
          onChange={event => setOtherText(event.target.value)}
          placeholder={tandem ? "Name the relationship" : "Name the group"}
          aria-label={tandem ? "Relationship in your words" : "Group in your words"}
        />
      ) : null}
      {directed ? (
        <>
          <label className="tn-label" htmlFor="group-lead">{connectionId === "mentor" ? "Who is the mentor?" : "Who is the parent?"}</label>
          <select id="group-lead" className="tn-field" value={leadId || chosenSeats[0]?.id || ""} onChange={event => setLeadId(event.target.value)}>
            {chosenSeats.map(seat => (
              <option key={seat.id} value={seat.id}>{seat.name}</option>
            ))}
          </select>
        </>
      ) : null}
      <label className="tn-label" htmlFor="group-question">What do you want to know?</label>
      <textarea
        id="group-question"
        className="tn-field tn-field--area"
        rows={2}
        value={question}
        onChange={event => setQuestion(event.target.value)}
        placeholder="Optional, and it shapes every card."
      />
      <div className="group-read__prompts">
        {ideas.map(idea => (
          <button key={idea} type="button" className={question === idea ? "is-on" : ""} onClick={() => setQuestion(idea)}>
            {idea}
          </button>
        ))}
      </div>
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
          <p className="label-lock">{reading.connection}</p>
          <h3>{reading.title}</h3>
          {reading.question ? <p className="group-read__ask">You asked: {reading.question}</p> : null}
          <div className="long-read-spread tn-spread group-read__spread" aria-label="Group spread">
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
          <p className="group-read__portrait">{reading.portrait}</p>
          {reading.sections.map(section => (
            <section key={section.heading} className="group-read__block">
              <h4>{section.heading}</h4>
              <p>{section.text}</p>
            </section>
          ))}
          <details className="group-read__details">
            <summary>Chart details</summary>
            <ul>
              {reading.details.map(line => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </details>
        </article>
      ) : null}
    </section>
  );
}
