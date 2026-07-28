import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SEO } from "../components/SEO";
import { DockPanel, DockTab } from "../components/journal/DockPanel";
import { AlmanacCalendar, ElevenSixteenStrip } from "../components/journal/Almanac";
import { DailyDraw } from "../components/journal/DailyDraw";
import { DailyCode } from "../components/journal/DailyCode";
import { ShareRow } from "../components/journal/ShareRow";
import { drawOfTheDay } from "../lib/ritual";

type Dock = "almanac" | "draw" | "code" | null;

interface Post {
  _id: string;
  _creationTime: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt?: number;
  readMinutes: number;
  featured: boolean;
}

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
  const posts = useQuery(api.blog.listPublished, {}) as Post[] | undefined;
  const draw = drawOfTheDay();

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
      <SEO
        title="The Journal — Almanac, Daily Code & Daily Draw"
        description="The XI · XVI Journal: the brand manifesto, the 11:16 Almanac calendar, a daily code on sustainability and self-empowerment, and a daily draw from the 22-card XI·XVI Arcana."
        url="/journal"
      />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <header className="journal-hero">
        <div className="journal-hero__aura" aria-hidden="true" />
        <p className="journal-hero__eyebrow">XI · XVI — Est. 11:16</p>
        <h1 className="journal-hero__title">The Journal</h1>
        <p className="journal-hero__sub">
          A house record of manifesto, material and ritual. Time, kept at 11:16.
        </p>
      </header>

      {/* ── Docked at the top: the 11:16 strip ─────────────────── */}
      <ElevenSixteenStrip onOpenAlmanac={() => setDock("almanac")} />

      {/* ── Docked ritual tiles (top, always visible) ──────────── */}
      <section className="journal-tiles">
        <button className="journal-tile journal-tile--almanac" onClick={() => toggle("almanac")}>
          <span className="journal-tile__glyph" aria-hidden="true">◍</span>
          <span className="journal-tile__label">The Almanac</span>
          <span className="journal-tile__desc">Calendar · moon · your two 11:16s</span>
          <span className="journal-tile__cta">Open ✦</span>
        </button>
        <button className="journal-tile journal-tile--code" onClick={() => toggle("code")}>
          <span className="journal-tile__glyph" aria-hidden="true">✦</span>
          <span className="journal-tile__label">The Daily Code</span>
          <span className="journal-tile__desc">
            <DailyCode compact />
          </span>
          <span className="journal-tile__cta">Read today's line ✦</span>
        </button>
        <button className="journal-tile journal-tile--draw" onClick={() => toggle("draw")}>
          <span className="journal-tile__glyph" aria-hidden="true">{draw.card.glyph}</span>
          <span className="journal-tile__label">The Daily Draw</span>
          <span className="journal-tile__desc">XI·XVI Arcana · one card, once a day</span>
          <span className="journal-tile__cta">Draw ✦</span>
        </button>
      </section>

      {/* ── Body: rails flanking the feed ──────────────────────── */}
      <div className="journal-body">
        {/* Left rail */}
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
            <div className="journal-empty">Opening the archive…</div>
          ) : visible.length === 0 ? (
            <div className="journal-empty">
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

          {/* Mobile: the rituals stacked under the feed too */}
          <div className="journal-mobile-rituals">
            <div className="journal-inline-card">
              <h3>The Daily Code</h3>
              <DailyCode />
            </div>
            <div className="journal-inline-card">
              <h3>The Daily Draw</h3>
              <DailyDraw />
            </div>
            <div className="journal-inline-card">
              <h3>The Almanac</h3>
              <AlmanacCalendar />
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div className="journal-rail journal-rail--right">
          <DockTab
            label="Daily Draw"
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
        title="The Daily Draw"
        eyebrow="XI·XVI Arcana"
        side="right"
        accent="#c48dff"
      >
        <DailyDraw />
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
