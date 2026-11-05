import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { TrueNorthAtmosphere } from "../../components/journal/TrueNorthAtmosphere";
import { TrueNorthSignIcon } from "../../components/journal/TrueNorthGlyphs";
import { SEO } from "../../components/SEO";
import {
  api,
  useAuthStatus,
  useBackend,
  useMutation,
  useQuery,
} from "../../lib/backend";
import {
  NORTH_FOCUSES,
  type NorthFocus,
  type PublicNorthProfile,
} from "../../lib/northProfile";
import { supabase } from "../../lib/supabase";
import { TrueNorthHero, TrueNorthSignedOutTeaser, useSunSign } from "./shared";

type Focus = NorthFocus;

type Reading = {
  id: string;
  name: string;
  sign: string;
  focus: Focus;
  text: string;
  at: number;
};

type Row = {
  id: string;
  display_name: string;
  sign: string;
  focus: Focus;
  body: string;
  created_at: string;
};

type ConnectionView = {
  id: string;
  status: "pending" | "accepted";
  direction: "incoming" | "outgoing";
  createdAt: string;
  person: PublicNorthProfile;
};

type SessionView = {
  id: string;
  connectionId: string;
  status: "invited" | "active" | "declined" | "closed";
  focus: Focus;
  prompt: string;
  role: "host" | "guest";
  partner: PublicNorthProfile;
  sharedReading: string | null;
  createdAt: string;
  mineSubmitted: boolean;
  entries: {
    authorId: string;
    name: string;
    body: string;
    createdAt: string;
  }[];
};

type Room = {
  connections: ConnectionView[];
  sessions: SessionView[];
};

const SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

const FOCUS: { id: Focus; label: string }[] = NORTH_FOCUSES.map(id => ({
  id,
  label: id[0].toUpperCase() + id.slice(1),
}));

const FILTERS: { id: Focus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  ...FOCUS,
];

function fromRow(row: Row): Reading {
  return {
    id: row.id,
    name: row.display_name,
    sign: row.sign,
    focus: row.focus,
    text: row.body,
    at: new Date(row.created_at).getTime(),
  };
}

function mergeReading(list: Reading[], next: Reading): Reading[] {
  if (list.some(item => item.id === next.id)) return list;
  return [next, ...list].sort((a, b) => b.at - a.at).slice(0, 80);
}

function PersonLine({ person }: { person: PublicNorthProfile }) {
  return (
    <div className="tn-person">
      <span className="tn-profile__mark" aria-hidden="true">
        <TrueNorthSignIcon sign={person.sign || "Virgo"} size={28} />
      </span>
      <div>
        <p className="tn-person__name">{person.name}</p>
        <p className="tn-person__meta">
          {person.sign ? `${person.sign} · ` : ""}
          {person.focus}
        </p>
      </div>
    </div>
  );
}

export function CirclePage() {
  const { isLoading: authLoading, isAuthenticated } = useAuthStatus();
  const user = useQuery(
    api.auth.currentUser,
    authLoading || !isAuthenticated ? "skip" : {},
  );
  const sunSign = useSunSign(user);
  const { query } = useBackend();
  const invite = useMutation(api.north.invite);
  const respond = useMutation(api.north.respond);
  const revoke = useMutation(api.north.revoke);
  const openSession = useMutation(api.north.open);
  const answerSession = useMutation(api.north.answer);
  const contribute = useMutation(api.north.contribute);
  const closeSession = useMutation(api.north.close);
  const viewPerson = useMutation(api.north.person);

  const [focus, setFocus] = useState<Focus | "all">("all");
  const [readings, setReadings] = useState<Reading[]>([]);
  const [draft, setDraft] = useState("");
  const [mineFocus, setMineFocus] = useState<Focus>("general");
  const [live, setLive] = useState<"connecting" | "live" | "offline">(
    "connecting",
  );
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const [room, setRoom] = useState<Room | null>(null);
  const [roomState, setRoomState] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [roomError, setRoomError] = useState("");
  const [email, setEmail] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState("");
  const [promptByConnection, setPromptByConnection] = useState<
    Record<string, string>
  >({});
  const [focusByConnection, setFocusByConnection] = useState<
    Record<string, Focus>
  >({});
  const [entryBySession, setEntryBySession] = useState<Record<string, string>>(
    {},
  );
  const [viewed, setViewed] = useState<PublicNorthProfile | null>(null);

  const loadRoom = useCallback(async () => {
    setRoomState(current => (current === "ready" ? current : "loading"));
    try {
      const result = (await query(api.north.list, {})) as Room & {
        success?: boolean;
      };
      setRoom({
        connections: result.connections ?? [],
        sessions: result.sessions ?? [],
      });
      setRoomError("");
      setRoomState("ready");
    } catch (error) {
      setRoomState("error");
      setRoomError(
        error instanceof Error ? error.message : "Couldn't open tandem.",
      );
    }
  }, [query]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void loadRoom();
  }, [isAuthenticated, loadRoom]);

  useEffect(() => {
    let stop = false;
    const pull = async () => {
      const { data, error } = await supabase
        .from("circle_readings")
        .select("id, display_name, sign, focus, body, created_at")
        .order("created_at", { ascending: false })
        .limit(80);
      if (stop) return;
      if (error) {
        setLive("offline");
        setNotice(
          "The shared room is not reachable yet. Public notes will appear here once the circle table is live.",
        );
        return;
      }
      setLive("live");
      setNotice("");
      setReadings((data as Row[]).map(fromRow));
    };
    void pull();
    const poll = window.setInterval(() => {
      void pull();
    }, 8000);
    const channel = supabase
      .channel("true-north-circle")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "circle_readings" },
        payload => {
          const row = payload.new as Row;
          if (!row?.id) return;
          setLive("live");
          setReadings(list => mergeReading(list, fromRow(row)));
        },
      )
      .subscribe();
    return () => {
      stop = true;
      window.clearInterval(poll);
      void supabase.removeChannel(channel);
    };
  }, []);

  const visible = useMemo(
    () => readings.filter(r => focus === "all" || r.focus === focus),
    [readings, focus],
  );

  const displayName =
    (user?.name as string | undefined) ||
    (user?.email ? String(user.email).split("@")[0] : "You");
  const sign = sunSign && SIGNS.includes(sunSign) ? sunSign : "Virgo";

  const share = async () => {
    const text = draft.trim();
    if (!text || !isAuthenticated || saving) return;
    setSaving(true);
    setNotice("");
    const { data: sessionData } = await supabase.auth.getSession();
    const authorId = sessionData.session?.user.id;
    if (!authorId) {
      setNotice("Sign in again, then share.");
      setSaving(false);
      return;
    }
    const { data, error } = await supabase
      .from("circle_readings")
      .insert({
        author_id: authorId,
        display_name: displayName.slice(0, 40),
        sign,
        focus: mineFocus,
        body: text.slice(0, 280),
      })
      .select("id, display_name, sign, focus, body, created_at")
      .single();
    setSaving(false);
    if (error || !data) {
      setNotice(error?.message || "Could not share that note.");
      return;
    }
    setReadings(list => mergeReading(list, fromRow(data as Row)));
    setDraft("");
  };

  const run = async (key: string, work: () => Promise<unknown>) => {
    setBusy(key);
    setActionError("");
    try {
      await work();
      await loadRoom();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "That didn't go through.",
      );
    } finally {
      setBusy("");
    }
  };

  const connections = room?.connections ?? [];
  const incoming = connections.filter(
    item => item.direction === "incoming" && item.status === "pending",
  );
  const outgoing = connections.filter(
    item => item.direction === "outgoing" && item.status === "pending",
  );
  const accepted = connections.filter(item => item.status === "accepted");
  const sessions = room?.sessions ?? [];
  const currentSessions = sessions.filter(
    item => item.status === "invited" || item.status === "active",
  );
  const history = sessions.filter(
    item => item.status === "closed" || item.status === "declined",
  );

  const liveLabel =
    live === "live" ? "Live" : live === "offline" ? "Offline" : "Connecting";

  return (
    <div className="journal-page journal-page--truenorth">
      <TrueNorthAtmosphere />
      <div className="journal-stack tn-shell">
        <SEO
          title="Circle — True North"
          description="Connect with someone, accept a tandem, and keep the shared reading between the two of you."
          url="/chart/circle"
        />
        {isAuthenticated ? (
          <TrueNorthHero sunSign={sunSign} />
        ) : (
          <TrueNorthSignedOutTeaser
            pageTitleTag={
              <div className="tn-card tn-invite-card">
                <p className="label-lock">Tandem</p>
                <p className="serif-quiet tn-invite-card__copy">
                  A reading between two people starts with an invitation they
                  can accept. Public notes stay separate.
                </p>
              </div>
            }
          />
        )}

        <section className="tn-card">
          <p className="label-lock">Tandem</p>
          <h2 className="clash tn-section-title">
            Read with someone you choose.
          </h2>
          <p className="serif-quiet tn-lede">
            Invitations stay in the app. No email is sent. A tandem opens only
            after the other person accepts, and the result stays between you.
          </p>
          {!isAuthenticated && (
            <p className="serif-quiet tn-lede">
              <Link to="/login" className="tn-inline">
                Sign in
              </Link>{" "}
              to invite someone or answer an invitation.
            </p>
          )}
          {isAuthenticated && roomState === "loading" && (
            <p className="tn-meta" role="status">
              Opening your connections…
            </p>
          )}
          {isAuthenticated && roomState === "error" && (
            <p className="tn-alert" role="alert">
              {roomError}
            </p>
          )}
          {actionError && (
            <p className="tn-alert" role="alert">
              {actionError}
            </p>
          )}

          {isAuthenticated && (
            <form
              className="tn-stack"
              onSubmit={event => {
                event.preventDefault();
                void run("invite", async () => {
                  await invite({ email });
                  setEmail("");
                });
              }}
            >
              <label className="tn-label" htmlFor="tandem-email">
                Their account email
              </label>
              <input
                id="tandem-email"
                className="tn-field"
                type="email"
                inputMode="email"
                autoComplete="off"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="name@email.com"
                required
              />
              <button
                type="submit"
                className="cta-pist tn-action"
                disabled={busy === "invite"}
              >
                {busy === "invite" ? "Saving invitation…" : "Invite in the app"}
              </button>
            </form>
          )}
        </section>

        {isAuthenticated &&
          roomState === "ready" &&
          incoming.length === 0 &&
          outgoing.length === 0 &&
          accepted.length === 0 && (
            <p className="serif-quiet tn-opening">
              No connections yet. An invitation appears here for the person you
              invite.
            </p>
          )}

        {incoming.length > 0 && (
          <section className="tn-stack" aria-label="Invitations for you">
            {incoming.map(item => (
              <article key={item.id} className="tn-card">
                <p className="label-lock">Invitation</p>
                <PersonLine person={item.person} />
                {item.person.note && (
                  <p className="serif-quiet tn-lede">{item.person.note}</p>
                )}
                <div className="tn-actions">
                  <button
                    type="button"
                    className="cta-pist tn-action"
                    disabled={busy === item.id}
                    onClick={() => {
                      void run(item.id, () =>
                        respond({
                          connectionId: item.id,
                          decision: "accepted",
                        }),
                      );
                    }}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="cta-ghost tn-action"
                    disabled={busy === item.id}
                    onClick={() => {
                      void run(item.id, () =>
                        respond({
                          connectionId: item.id,
                          decision: "declined",
                        }),
                      );
                    }}
                  >
                    Decline
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}

        {outgoing.map(item => (
          <article key={item.id} className="tn-card">
            <p className="label-lock">Waiting</p>
            <PersonLine person={item.person} />
            <p className="tn-meta">
              They'll see this the next time they open Circle. Nothing was
              emailed.
            </p>
          </article>
        ))}

        {accepted.map(item => (
          <article key={item.id} className="tn-card">
            <PersonLine person={item.person} />
            {item.person.note && (
              <p className="serif-quiet tn-lede">{item.person.note}</p>
            )}
            <div className="tn-actions">
              <button
                type="button"
                className="cta-ghost tn-action"
                onClick={() => {
                  void run(`view-${item.person.id}`, async () => {
                    const result = (await viewPerson({
                      userId: item.person.id,
                    })) as { person: PublicNorthProfile };
                    setViewed(result.person);
                  });
                }}
              >
                View profile
              </button>
              <button
                type="button"
                className="cta-ghost tn-action"
                disabled={busy === `end-${item.id}`}
                onClick={() => {
                  void run(`end-${item.id}`, () =>
                    revoke({ connectionId: item.id }),
                  );
                }}
              >
                End connection
              </button>
            </div>
            <form
              className="tn-stack"
              onSubmit={event => {
                event.preventDefault();
                void run(`open-${item.id}`, () =>
                  openSession({
                    connectionId: item.id,
                    focus: focusByConnection[item.id] ?? "general",
                    prompt: promptByConnection[item.id] ?? "",
                  }),
                );
              }}
            >
              <label className="tn-label" htmlFor={`prompt-${item.id}`}>
                Open a tandem
              </label>
              <div className="tn-choice__row">
                {FOCUS.map(choice => (
                  <button
                    key={choice.id}
                    type="button"
                    className={`tn-choice__item ${(focusByConnection[item.id] ?? "general") === choice.id ? "is-on" : ""}`}
                    onClick={() =>
                      setFocusByConnection(current => ({
                        ...current,
                        [item.id]: choice.id,
                      }))
                    }
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
              <textarea
                id={`prompt-${item.id}`}
                className="tn-field tn-field--area"
                maxLength={280}
                value={promptByConnection[item.id] ?? ""}
                onChange={event =>
                  setPromptByConnection(current => ({
                    ...current,
                    [item.id]: event.target.value,
                  }))
                }
                placeholder="What should you read together?"
              />
              <button
                type="submit"
                className="cta-pist tn-action"
                disabled={busy === `open-${item.id}`}
              >
                {busy === `open-${item.id}`
                  ? "Opening…"
                  : "Send tandem invitation"}
              </button>
            </form>
          </article>
        ))}

        {viewed && (
          <section className="tn-card" aria-live="polite">
            <p className="label-lock">Profile</p>
            <PersonLine person={viewed} />
            <p className="serif-quiet tn-lede">
              {viewed.note || "No note yet."}
            </p>
            <button
              type="button"
              className="cta-ghost tn-action"
              onClick={() => setViewed(null)}
            >
              Close
            </button>
          </section>
        )}

        {currentSessions.map(session => (
          <section key={session.id} className="tn-card">
            <p className="label-lock">
              Tandem · {session.focus} · {session.status}
            </p>
            <PersonLine person={session.partner} />
            <p className="serif-quiet tn-lede">{session.prompt}</p>
            {session.status === "invited" && session.role === "guest" && (
              <div className="tn-actions">
                <button
                  type="button"
                  className="cta-pist tn-action"
                  disabled={!!busy}
                  onClick={() => {
                    void run(session.id, () =>
                      answerSession({
                        sessionId: session.id,
                        decision: "active",
                      }),
                    );
                  }}
                >
                  Accept tandem
                </button>
                <button
                  type="button"
                  className="cta-ghost tn-action"
                  disabled={!!busy}
                  onClick={() => {
                    void run(session.id, () =>
                      answerSession({
                        sessionId: session.id,
                        decision: "declined",
                      }),
                    );
                  }}
                >
                  Decline
                </button>
              </div>
            )}
            {session.status === "invited" && session.role === "host" && (
              <p className="tn-meta">
                Waiting for them to accept. You can withdraw it.
              </p>
            )}
            {session.status === "active" &&
              (session.mineSubmitted ? (
                <p className="tn-meta">
                  Your side is in. Theirs appears when they add it.
                </p>
              ) : (
                <form
                  className="tn-stack"
                  onSubmit={event => {
                    event.preventDefault();
                    void run(`write-${session.id}`, () =>
                      contribute({
                        sessionId: session.id,
                        body: entryBySession[session.id] ?? "",
                      }),
                    );
                  }}
                >
                  <label className="tn-label" htmlFor={`entry-${session.id}`}>
                    Your side
                  </label>
                  <textarea
                    id={`entry-${session.id}`}
                    className="tn-field tn-field--area"
                    maxLength={2000}
                    value={entryBySession[session.id] ?? ""}
                    onChange={event =>
                      setEntryBySession(current => ({
                        ...current,
                        [session.id]: event.target.value,
                      }))
                    }
                  />
                  <button
                    type="submit"
                    className="cta-pist tn-action"
                    disabled={busy === `write-${session.id}`}
                  >
                    {busy === `write-${session.id}`
                      ? "Saving…"
                      : "Add your side"}
                  </button>
                </form>
              ))}
            {session.entries.length > 0 && (
              <div className="tn-tandem">
                {session.entries.map(entry => (
                  <article key={entry.authorId}>
                    <p className="label-lock">{entry.name}</p>
                    <p className="serif-quiet tn-lede">{entry.body}</p>
                  </article>
                ))}
              </div>
            )}
            {session.sharedReading && (
              <pre className="tn-shared">{session.sharedReading}</pre>
            )}
            {(session.role === "host" || session.status === "active") && (
              <button
                type="button"
                className="cta-ghost tn-action"
                disabled={!!busy}
                onClick={() => {
                  void run(`close-${session.id}`, () =>
                    closeSession({ sessionId: session.id }),
                  );
                }}
              >
                {session.status === "invited"
                  ? "Withdraw invitation"
                  : "Close tandem"}
              </button>
            )}
          </section>
        ))}

        <section className="tn-card">
          <p className="label-lock">History</p>
          {history.length === 0 ? (
            <p className="tn-meta">
              Closed tandems stay here for the two of you.
            </p>
          ) : (
            <ul className="tn-history">
              {history.map(session => (
                <li key={session.id}>
                  <p className="label-lock">
                    {session.partner.name} · {session.focus} · {session.status}
                  </p>
                  <p className="serif-quiet tn-lede">{session.prompt}</p>
                  {session.sharedReading && (
                    <pre className="tn-shared">{session.sharedReading}</pre>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="tn-card">
          <p className="label-lock">Public circle · {liveLabel}</p>
          <h2 className="clash tn-section-title">
            A note anyone in the room can read.
          </h2>
          <p className="serif-quiet tn-lede">
            This is separate from tandem. What you share here is visible to
            everyone signed into Circle.
          </p>
          <div className="tn-choice__row">
            {FILTERS.map(item => (
              <button
                key={item.id}
                type="button"
                className={`tn-choice__item ${focus === item.id ? "is-on" : ""}`}
                onClick={() => setFocus(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          {notice && (
            <p className="tn-alert" role="status">
              {notice}
            </p>
          )}
        </section>

        <section className="tn-card">
          <p className="label-lock">Your public note</p>
          {isAuthenticated ? (
            <>
              <PersonLine
                person={{
                  id: "self",
                  name: displayName,
                  focus: mineFocus,
                  note: null,
                  sign,
                }}
              />
              <div className="tn-choice__row">
                {FOCUS.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    className={`tn-choice__item ${mineFocus === item.id ? "is-on" : ""}`}
                    onClick={() => setMineFocus(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <textarea
                className="tn-field tn-field--area"
                value={draft}
                onChange={event => setDraft(event.target.value)}
                maxLength={280}
                placeholder="Today's orientation, in a few lines."
              />
              <button
                type="button"
                className="cta-pist tn-action"
                onClick={() => {
                  void share();
                }}
                disabled={!draft.trim() || saving || live === "offline"}
              >
                {saving ? "Sharing…" : "Share with the circle"}
              </button>
            </>
          ) : (
            <p className="serif-quiet tn-lede">
              <Link to="/login" className="tn-inline">
                Sign in
              </Link>{" "}
              to publish. Anyone can read what is already in the room.
            </p>
          )}
        </section>

        {visible.length === 0 && live === "live" && (
          <p className="serif-quiet tn-opening">
            The circle is quiet. The first note sets the room.
          </p>
        )}
        {live === "connecting" && (
          <p className="tn-meta" role="status">
            Loading public notes…
          </p>
        )}

        <ul className="tn-feed-list">
          {visible.map(item => (
            <li key={item.id} className="tn-card">
              <PersonLine
                person={{
                  id: item.id,
                  name: item.name,
                  focus: item.focus,
                  note: null,
                  sign: item.sign,
                }}
              />
              <p className="serif-quiet tn-lede">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
