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

const POST_PAPERS = ["ink", "kraft", "gold", "lilac", "blush"] as const;

function PostCard({
  post,
  featured = false,
  index = 0,
}: {
  post: Post;
  featured?: boolean;
  index?: number;
}) {
  const paper = POST_PAPERS[index % POST_PAPERS.length];
  return (
    <article
      className={`journal-post ${featured ? "journal-post--featured" : ""}`}
    >
      {featured && (
        <>
          <span className="jcol-patch jcol-patch--a" aria-hidden="true" />
          <span className="jcol-tape jcol-tape--tl" aria-hidden="true" />
        </>
      )}
      <Link to={`/journal/${post.slug}`} className="journal-post__link">
        {post.coverImage && (
          <div className="journal-post__cover">
            <img src={post.coverImage} alt="" loading="lazy" />
          </div>
        )}
        <div className="journal-post__body">
          <div className="journal-post__meta">
            <span
              className={`journal-post__cat jcol-tag jcol-tag--sm jcol-${paper} jcol-type`}
            >
              {post.category}
            </span>
            <span className="journal-post__dot">·</span>
            <span>{fmtDate(post.publishedAt ?? post._creationTime)}</span>
            <span className="journal-post__dot">·</span>
            <span>{post.readMinutes} min</span>
          </div>
          <h2 className="journal-post__title">{post.title}</h2>
          <p className="journal-post__excerpt">{post.excerpt}</p>
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

        {/* ── The 11:16 strip ───────────────────────────────────── */}
        <ElevenSixteenStrip />

        {/* ── The Draw ─────────────────────────────────────────── */}
        <section className="journal-tiles">
          <button
            className="journal-tile journal-tile--draw journal-surface"
            onClick={() => toggle("draw")}
          >
            <span className="journal-tile__deck" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="journal-tile__label">The Draw</span>
            <span className="journal-tile__desc">
              Five cards from the Major Arcana —{" "}
              {spread.map(s => s.slotName.replace("The ", "")).join(" · ")}
            </span>
            <span className="journal-tile__cta">Draw your five ✦</span>
          </button>
        </section>

        {/* ── The Daily Code, right on the page ─────────────────── */}
        <div className="journal-surface" style={{ padding: "1.5rem" }}>
          <DailyCode />
        </div>

        {/* ── Body: rails flanking the feed ─────────────────────── */}
        <div className="journal-body">
          <div className="journal-feed">
            <div className="journal-feed__filters">
              {categories.map(c => (
                <button
                  key={c}
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
                {lead && <PostCard post={lead} featured index={0} />}
                <div className="journal-grid">
                  {rest.map((p, i) => (
                    <PostCard key={p._id} post={p} index={i + 1} />
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
      </div>

      {/* ── Pop-over dock ──────────────────────────────────────── */}
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
  return (
    <section className="px-2 pt-6 pb-4">
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
          <p className="n mt-3">PM</p>
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
