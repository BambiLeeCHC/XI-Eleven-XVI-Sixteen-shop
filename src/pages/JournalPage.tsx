import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import { DockPanel, DockTab } from "../components/journal/DockPanel";
import { AlmanacCalendar, ElevenSixteenStrip } from "../components/journal/Almanac";
import { DrawThree } from "../components/journal/DrawThree";
import { DailyCode } from "../components/journal/DailyCode";
import { JournalSky } from "../components/journal/JournalSky";
import { JournalMasthead } from "../components/journal/JournalMasthead";
import { ShareRow } from "../components/journal/ShareRow";
import { spreadOfTheDay } from "../lib/ritual";
import { usePublishedPosts, type JournalPost } from "../lib/journalData";

type Dock = "almanac" | "draw" | "code" | null;

type Post = JournalPost;

function fmtDate(ts?: number) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
}

function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <article className={`journal-post ${featured ? "journal-post--featured" : ""}`}>
      <Link to={`/journal/${post.slug}`} className="journal-post__link">
        {post.coverImage && (
          <div className="journal-post__cover">
            <img src={post.coverImage} alt="" loading="lazy" />
          </div>
        )}
        <div className="journal-post__body">
          <div className="journal-post__meta">
            <span className="journal-post__cat">{post.category}</span>
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
  const spread = useMemo(() => spreadOfTheDay(), []);

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
        description="The XI · XVI Journal: the brand manifesto, the 11:16 Almanac calendar, a daily code on sustainability and self-empowerment, and a three-card draw from the XI·XVI house deck."
        url="/journal"
      />

      <div className="journal-stack">
        {/* ── Hero card ─────────────────────────────────────────── */}
        <div className="journal-surface journal-masthead-shell">
          <div className="journal-hero__aura" aria-hidden="true" />
          <JournalMasthead />
        </div>

        {/* ── The 11:16 strip ───────────────────────────────────── */}
        <ElevenSixteenStrip onOpenAlmanac={() => setDock("almanac")} />

        {/* ── Ritual cards ──────────────────────────────────────── */}
        <section className="journal-tiles">
          <button className="journal-tile journal-tile--almanac journal-surface" onClick={() => toggle("almanac")}>
            <span className="journal-tile__glyph" aria-hidden="true">◍</span>
            <span className="journal-tile__label">The Almanac</span>
            <span className="journal-tile__desc">Calendar · moon · your two 11:16s</span>
            <span className="journal-tile__cta">Open ✦</span>
          </button>
          <button className="journal-tile journal-tile--code journal-surface" onClick={() => toggle("code")}>
            <span className="journal-tile__glyph" aria-hidden="true">✦</span>
            <span className="journal-tile__label">The Daily Code</span>
            <span className="journal-tile__desc">
              <DailyCode compact />
            </span>
            <span className="journal-tile__cta">Read today's line ✦</span>
          </button>
          <button className="journal-tile journal-tile--draw journal-surface" onClick={() => toggle("draw")}>
            <span className="journal-tile__deck" aria-hidden="true">
              <i /><i /><i />
            </span>
            <span className="journal-tile__label">The Draw</span>
            <span className="journal-tile__desc">
              Five cards from the Major Arcana — {spread.map((s) => s.slotName.replace("The ", "")).join(" · ")}
            </span>
            <span className="journal-tile__cta">Draw your five ✦</span>
          </button>
        </section>

        {/* ── Body: rails flanking the feed ─────────────────────── */}
        <div className="journal-body">
          <div className="journal-rail journal-rail--left">
            <DockTab
              label="Almanac"
              glyph="◍"
              accent="#5c9bcd"
              active={dock === "almanac"}
              onClick={() => toggle("almanac")}
            />
          </div>

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
                {lead && <PostCard post={lead} featured />}
                <div className="journal-grid">
                  {rest.map((p) => (
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
            <DockTab
              label="Daily Code"
              glyph="✦"
              accent="#f5c97a"
              active={dock === "code"}
              onClick={() => toggle("code")}
            />
          </div>
        </div>
      </div>

      {/* ── Pop-over docks ─────────────────────────────────────── */}
      <DockPanel
        open={dock === "almanac"}
        onClose={() => setDock(null)}
        title="The XI·XVI Almanac"
        eyebrow="Calendar & time"
        side="left"
        accent="#5c9bcd"
      >
        <AlmanacCalendar />
      </DockPanel>

      <DockPanel
        open={dock === "draw"}
        onClose={() => setDock(null)}
        title="The Draw"
        eyebrow="Three cards · the house deck"
        side="right"
        size="wide"
        accent="#c48dff"
      >
        <DrawThree />
      </DockPanel>

      <DockPanel
        open={dock === "code"}
        onClose={() => setDock(null)}
        title="The Daily Code"
        eyebrow="Sustainability & self-empowerment"
        side="right"
        accent="#f5c97a"
      >
        <DailyCode />
      </DockPanel>
    </div>
  );
}

export default JournalPage;
