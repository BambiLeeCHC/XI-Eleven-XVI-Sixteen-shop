import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ElevenSixteenStrip } from "../components/journal/Almanac";
import { DailyCode } from "../components/journal/DailyCode";
import { DockPanel, DockTab } from "../components/journal/DockPanel";
import { DrawThree } from "../components/journal/DrawThree";
import { JournalSky } from "../components/journal/JournalSky";
import { ShareRow } from "../components/journal/ShareRow";
import { SEO } from "../components/SEO";
import { type JournalPost, usePublishedPosts } from "../lib/journalData";
import { dateNumber, moonPhase, spreadOfTheDay } from "../lib/ritual";

type Dock = "draw" | null;

type Post = JournalPost;

function fmtDate(ts?: number) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString([], {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function PostCard({
  post,
  featured = false,
}: {
  post: Post;
  featured?: boolean;
}) {
  return (
    <article
      className={`journal-post ${featured ? "journal-post--featured" : ""}`}
    >
      <Link to={`/journal/${post.slug}`} className="journal-post__link">
        {post.coverImage && (
          <div className="journal-post__cover">
            <img src={post.coverImage} alt="" loading="lazy" />
          </div>
        )}
        <div className="journal-post__body">
          <div className="journal-post__meta">
            <span className="label-lock journal-post__cat">{post.category}</span>
            <span className="journal-post__dot">·</span>
            <span>{fmtDate(post.publishedAt ?? post._creationTime)}</span>
            <span className="journal-post__dot">·</span>
            <span>{post.readMinutes} min</span>
          </div>
          <h2 className="journal-post__title clash">{post.title}</h2>
          <p className="journal-post__excerpt serif-quiet">{post.excerpt}</p>
          <span className="journal-post__more">Read the piece →</span>
        </div>
      </Link>
      <div className="journal-post__foot">
        <ShareRow
          slug={post.slug}
          title={post.title}
          excerpt={post.excerpt}
          size="sm"
        />
      </div>
    </article>
  );
}

export function JournalPage() {
  const [dock, setDock] = useState<Dock>(null);
  const [category, setCategory] = useState("All");
  const { posts } = usePublishedPosts();
  const spread = useMemo(() => spreadOfTheDay(), []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    (posts ?? []).forEach(p => set.add(p.category));
    return ["All", ...Array.from(set)];
  }, [posts]);

  const visible = useMemo(
    () =>
      (posts ?? []).filter(p => category === "All" || p.category === category),
    [posts, category],
  );
  const [lead, ...rest] = visible;

  const toggle = (d: Dock) => setDock(cur => (cur === d ? null : d));

  return (
    <div className="journal-page">
      <JournalSky />

      <SEO
        title="The Journal — Almanac, Daily Code & The Draw"
        description="The XI · XVI Journal: the brand manifesto, the 11:16 Almanac calendar, a daily code on sustainability and self-empowerment, and a three-card draw from the XI·XVI house deck."
        url="/journal"
      />

      <div className="journal-stack">
        <JournalLockedHero />

        <section className="journal-rooms">
          <div className="journal-almanac-room">
            <p className="label-lock" style={{ color: "#0B0B0C" }}>
              Almanac
            </p>
            <h2
              className="clash mt-3"
              style={{ fontSize: "clamp(42px, 6vw, 72px)", color: "#0B0B0C" }}
            >
              Open the day
            </h2>
            <p className="serif-quiet text-2xl mt-4 max-w-sm" style={{ color: "#0B0B0C" }}>
              Time, kept at 11:16. Open the Almanac for the month.
            </p>
            <div className="mt-6">
              <ElevenSixteenStrip />
            </div>
            <Link
              to="/chart/almanac"
              className="cta-pist mt-8"
              style={{ boxShadow: "6px 6px 0 #0B0B0C" }}
            >
              Open the Almanac ✦
            </Link>
          </div>

          <div className="journal-draw-room">
            <p className="label-lock" style={{ color: "var(--lilac)" }}>
              The Draw
            </p>
            <h2
              className="clash mt-3"
              style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
            >
              Five cards
            </h2>
            <p className="serif-quiet text-xl mt-3">
              {spread.map(s => s.slotName.replace("The ", "")).join(" · ")}
            </p>
            <div className="journal-draw-spread">
              <div className="tarot-card c1">
                <span className="serif-quiet">Draw 01</span>
                <span className="clash text-xl">Action</span>
              </div>
              <div className="tarot-card c2">
                <span className="serif-quiet">Draw 02</span>
                <span className="clash text-2xl">Support</span>
              </div>
              <div className="tarot-card c3">
                <span className="serif-quiet">Draw 03</span>
                <span className="clash text-xl">Gain</span>
              </div>
            </div>
            <button
              type="button"
              className="cta-ghost"
              onClick={() => toggle("draw")}
            >
              Draw your five ✦
            </button>
          </div>
        </section>

        <section className="journal-craft">
          <p className="label-lock" style={{ color: "var(--pist)" }}>
            XI · XVI / 023 · Craft
          </p>
          <p
            className="clash mt-4"
            style={{ fontSize: "clamp(32px, 5vw, 56px)" }}
          >
            Made on demand means someone waited for you. Be worth the wait.
          </p>
          <p className="serif-quiet text-xl mt-6">— XI · XVI</p>
        </section>

        <section className="journal-code-room">
          <DailyCode />
        </section>

        <section className="journal-archive">
          <div className="journal-body">
            <div className="journal-feed">
              <p className="label-lock mb-4">Archive</p>
              <div className="journal-feed__filters">
                {categories.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`journal-chip ${category === c ? "is-active" : ""}`}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {posts === undefined ? (
                <div className="journal-empty journal-surface">
                  Opening the archive…
                </div>
              ) : visible.length === 0 ? (
                <div className="journal-empty journal-surface">
                  No entries in this section yet. The first piece is on its way.
                </div>
              ) : (
                <>
                  {lead && <PostCard post={lead} featured />}
                  <div className="journal-grid">
                    {rest.map(p => (
                      <PostCard key={p._id} post={p} />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="journal-rail journal-rail--right">
              <DockTab
                label="The Draw"
                glyph="✧"
                accent="#c48dff"
                active={dock === "draw"}
                onClick={() => toggle("draw")}
              />
            </div>
          </div>
        </section>
      </div>

      <DockPanel
        open={dock === "draw"}
        onClose={() => setDock(null)}
        title="The Draw"
        eyebrow="Five cards · the Major Arcana"
        side="right"
        size="wide"
        accent="#c48dff"
      >
        <DrawThree />
      </DockPanel>
    </div>
  );
}

function JournalLockedHero() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const moon = moonPhase(now);
  const num = dateNumber(now);
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const nextIsAm = now.getHours() < 11 || (now.getHours() === 11 && now.getMinutes() < 16);
  return (
    <section className="journal-locked-hero">
      <p className="label-lock" style={{ color: "var(--pist)" }}>
        XI · XVI · Est. 11:16 · No. 01
      </p>
      <h1
        className="clash mt-4"
        style={{ fontSize: "clamp(56px, 12vw, 120px)" }}
      >
        The Journal
      </h1>
      <p className="serif-quiet text-3xl mt-5 max-w-xl">
        A record of manifesto, material and ritual. Time, kept at 11:16.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-9">
        <div className="clock-dial pist">
          <p className="label-lock" style={{ color: "#142010" }}>
            Local time
          </p>
          <p className="n mt-3">
            {hh}:{mm}
          </p>
        </div>
        <div className="clock-dial powder">
          <p className="label-lock" style={{ color: "#102028" }}>
            Next 11:16
          </p>
          <p className="n mt-3">{nextIsAm ? "AM" : "PM"}</p>
        </div>
        <div className="clock-dial blush">
          <p className="label-lock" style={{ color: "#2A1218" }}>
            Moon
          </p>
          <p className="n mt-3">{moon.name}</p>
          <p className="serif-quiet mt-1">
            {Math.round(moon.illumination * 100)}%
          </p>
        </div>
        <div className="clock-dial lilac">
          <p className="label-lock" style={{ color: "#1A1020" }}>
            Day number
          </p>
          <p className="n mt-3">{num}</p>
        </div>
      </div>
    </section>
  );
}

export default JournalPage;
