import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import { DockPanel, DockTab } from "../components/journal/DockPanel";
import { ElevenSixteenStrip } from "../components/journal/Almanac";
import { DailyThree } from "../components/journal/DailyThree";
import { DailyCode } from "../components/journal/DailyCode";
import { JournalSky } from "../components/journal/JournalSky";
import { JournalMasthead } from "../components/journal/JournalMasthead";
import { ShareRow } from "../components/journal/ShareRow";
import { usePublishedPosts, type JournalPost } from "../lib/journalData";

type Dock = "draw" | null;

type Post = JournalPost;

function fmtDate(ts?: number) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
}

const POST_PAPERS = ["ink", "kraft", "gold", "lilac", "blush"] as const;

function PostCard({ post, featured = false, index = 0 }: { post: Post; featured?: boolean; index?: number }) {
  const paper = POST_PAPERS[index % POST_PAPERS.length];
  return (
    <article className={`journal-post ${featured ? "journal-post--featured" : ""}`}>
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
            <span className={`journal-post__cat jcol-tag jcol-tag--sm jcol-${paper} jcol-type`}>
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
        <ShareRow slug={post.slug} title={post.title} excerpt={post.excerpt} size="sm" />
      </div>
    </article>
  );
}

export function JournalPage() {
  const [dock, setDock] = useState<Dock>(null);
  const [category, setCategory] = useState("All");
  const { posts } = usePublishedPosts();
  const categories = useMemo(() => {
    const set = new Set<string>();
    (posts ?? []).forEach((p) => set.add(p.category));
    return ["All", ...Array.from(set)];
  }, [posts]);

  const visible = useMemo(
    () => (posts ?? []).filter((p) => category === "All" || p.category === category),
    [posts, category]
  );
  const [lead, ...rest] = visible;

  const toggle = (d: Dock) => setDock((cur) => (cur === d ? null : d));

  return (
    <div className="journal-page">
      <JournalSky />

      <SEO
        title="The Journal — Almanac, Daily Code & The Draw"
        description="The XI · XVI Journal: the brand manifesto, the 11:16 Almanac calendar, a daily code on sustainability and self-empowerment, and three daily readings — Orientation, Alignment, Integration — from the XI·XVI house deck."
        url="/journal"
      />

      <div className="journal-stack">
        {/* ── Hero card ─────────────────────────────────────────── */}
        <div className="journal-surface journal-masthead-shell">
          <div className="journal-hero__aura" aria-hidden="true" />
          <JournalMasthead />
        </div>

        {/* ── The 11:16 strip ───────────────────────────────────── */}
        <ElevenSixteenStrip />

        {/* ── The Draw ─────────────────────────────────────────── */}
        <section className="journal-tiles">
          <button className="journal-tile journal-tile--draw journal-surface" onClick={() => toggle("draw")}>
            <span className="journal-tile__deck" aria-hidden="true">
              <i /><i /><i />
            </span>
            <span className="journal-tile__label">Daily Three</span>
            <span className="journal-tile__desc">
              Morning Orientation · Midday Alignment · Evening Integration — three readings, one arc
            </span>
            <span className="journal-tile__cta">Open today's readings ✦</span>
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
              {categories.map((c) => (
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
              <div className="journal-empty journal-surface">Opening the archive…</div>
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
              label="Daily Three"
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
        title="Daily Three"
        eyebrow="Orientation · Alignment · Integration"
        side="right"
        size="wide"
        accent="#c48dff"
      >
        <DailyThree />
      </DockPanel>
    </div>
  );
}

export default JournalPage;
