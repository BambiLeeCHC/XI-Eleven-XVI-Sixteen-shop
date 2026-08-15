import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SEO } from "../components/SEO";
import { ShareRow } from "../components/journal/ShareRow";
import { DockPanel, DockTab } from "../components/journal/DockPanel";
import { AlmanacCalendar, ElevenSixteenStrip } from "../components/journal/Almanac";
import { DrawThree } from "../components/journal/DrawThree";
import { JournalSky } from "../components/journal/JournalSky";
import { DailyCode } from "../components/journal/DailyCode";
import { usePostBySlug, usePublishedPosts } from "../lib/journalData";

type Dock = "almanac" | "draw" | "code" | null;

const POST_TITLE_PAPERS = ["ink", "kraft", "gold", "newsprint", "blush", "lilac"] as const;
const POST_TITLE_FACES = ["display", "grotesk", "slab"] as const;
const POST_TITLE_ROT = [-2, 1.5, -1.5, 2, -2.5, 1];

export function JournalPostPage() {
  const { slug = "" } = useParams();
  const post = usePostBySlug(slug) as any;
  const { posts: others } = usePublishedPosts(4);
  const [dock, setDock] = useState<Dock>(null);
  const toggle = (d: Dock) => setDock((cur) => (cur === d ? null : d));

  if (post === undefined) {
    return <div className="journal-empty py-24 mx-4 my-16">Opening the entry…</div>;
  }
  if (post === null) {
    return (
      <div className="journal-empty py-24">
        <p>That entry isn't published.</p>
        <Link to="/journal" className="journal-post__more mt-3 inline-block">← Back to the Journal</Link>
      </div>
    );
  }

  const date = new Date(post.publishedAt ?? post._creationTime).toLocaleDateString([], {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="journal-page">
      <JournalSky />
      <SEO
        title={post.title}
        description={post.excerpt}
        url={`/journal/${post.slug}`}
        image={post.coverImage}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          datePublished: new Date(post.publishedAt ?? post._creationTime).toISOString(),
          author: { "@type": "Organization", name: post.author },
          publisher: { "@type": "Organization", name: "XI Eleven XVI Sixteen" },
          mainEntityOfPage: `https://xixvi.shop/journal/${post.slug}`,
        }}
      />

      <div className="journal-stack">
      <ElevenSixteenStrip onOpenAlmanac={() => setDock("almanac")} />

      <div className="journal-body">
        <div className="journal-rail journal-rail--left">
          <DockTab label="Almanac" glyph="◍" accent="#5c9bcd" active={dock === "almanac"} onClick={() => toggle("almanac")} />
        </div>

        <article className="journal-article journal-surface">
          <span className="jcol-patch jcol-patch--a" aria-hidden="true" />
          <span className="jcol-tape jcol-tape--tl" aria-hidden="true" />
          <Link to="/journal" className="journal-article__back">← The Journal</Link>
          <p className="jcol-slug journal-article__slug">
            <span>XI · XVI</span>
            <i />
            <span className="jcol-tag jcol-tag--sm jcol-ink jcol-type">{post.category}</span>
            <i />
            <span>{date}</span>
          </p>
          <h1 className="journal-article__title journal-article__title--collage" aria-label={post.title}>
            {post.title.split(" ").map((w: string, i: number) => (
              <span
                key={i}
                className={`jcol-tag jcol-${POST_TITLE_PAPERS[i % POST_TITLE_PAPERS.length]} jcol-${POST_TITLE_FACES[i % POST_TITLE_FACES.length]}`}
                style={{ transform: `rotate(${POST_TITLE_ROT[i % POST_TITLE_ROT.length]}deg)` }}
              >
                {w}
              </span>
            ))}
          </h1>
          <p className="journal-article__meta">
            {post.author} · {post.readMinutes} min read
          </p>

          <div className="journal-article__share-top">
            <ShareRow slug={post.slug} title={post.title} excerpt={post.excerpt} />
          </div>

          {post.coverImage && (
            <div className="journal-article__cover">
              <img src={post.coverImage} alt="" />
            </div>
          )}

          <div
            className="journal-prose"
            // Content is authored only by admins in the panel's editor.
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {post.tags?.length > 0 && (
            <div className="journal-article__tags">
              {post.tags.map((t: string) => (
                <span key={t}>#{t}</span>
              ))}
            </div>
          )}

          <div className="journal-article__share-bottom">
            <p>Send this to someone who needs it today.</p>
            <ShareRow slug={post.slug} title={post.title} excerpt={post.excerpt} />
          </div>

          {others && others.filter((o) => o.slug !== post.slug).length > 0 && (
            <section className="journal-article__next">
              <h3>More from the Journal</h3>
              <div className="journal-article__next-list">
                {others
                  .filter((o) => o.slug !== post.slug)
                  .slice(0, 3)
                  .map((o) => (
                    <Link key={o._id} to={`/journal/${o.slug}`}>
                      <span className="journal-post__cat">{o.category}</span>
                      <strong>{o.title}</strong>
                      <em>{o.readMinutes} min</em>
                    </Link>
                  ))}
              </div>
            </section>
          )}
        </article>

        <div className="journal-rail journal-rail--right">
          <DockTab label="The Draw" glyph="✧" accent="#c48dff" active={dock === "draw"} onClick={() => toggle("draw")} />
          <DockTab label="Daily Code" glyph="✦" accent="#f5c97a" active={dock === "code"} onClick={() => toggle("code")} />
        </div>
      </div>
      </div>

      <DockPanel open={dock === "almanac"} onClose={() => setDock(null)} title="The XI·XVI Almanac" eyebrow="Calendar & time" side="left" accent="#5c9bcd">
        <AlmanacCalendar />
      </DockPanel>
      <DockPanel open={dock === "draw"} onClose={() => setDock(null)} title="The Draw" eyebrow="Three cards · the house deck" side="right" size="wide" accent="#c48dff">
        <DrawThree />
      </DockPanel>
      <DockPanel open={dock === "code"} onClose={() => setDock(null)} title="The Daily Code" eyebrow="Sustainability & self-empowerment" side="right" accent="#f5c97a">
        <DailyCode />
      </DockPanel>
    </div>
  );
}

export default JournalPostPage;
