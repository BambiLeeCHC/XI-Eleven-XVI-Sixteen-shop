import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShareRow } from "../components/journal/ShareRow";
import { SEO } from "../components/SEO";
import { PAGE_SEO } from "../data/seoMeta";
import { type JournalPost, usePublishedPosts } from "../lib/journalData";

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
  const [category, setCategory] = useState("All");
  const { posts } = usePublishedPosts();

  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    for (const p of posts ?? []) set.add(p.category);
    return Array.from(set);
  }, [posts]);

  const visible = useMemo(() => {
    const list = posts ?? [];
    if (category === "All") return list;
    return list.filter((p) => p.category === category);
  }, [posts, category]);

  const featured = visible.find((p) => p.featured) ?? visible[0];
  const rest = visible.filter((p) => p !== featured);

  return (
    <div className="journal-page">
      <SEO
        title={PAGE_SEO.journal.title}
        description={PAGE_SEO.journal.description}
        url="/journal"
      />

      <section className="journal-locked-hero">
        <p className="label-lock" style={{ color: "var(--pist)" }}>
          Editorial
        </p>
        <h1
          className="clash mt-4"
          style={{ fontSize: "clamp(48px, 10vw, 104px)" }}
        >
          The Journal
        </h1>
        <p className="serif-quiet text-2xl mt-5 max-w-xl">
          Fit, fabric, and how the house cuts a garment. Readings live in
          True North. This page is writing only.
        </p>
        <div className="flex flex-wrap gap-3 mt-8">
          <Link to="/shop" className="cta-pist">
            Shop clothing
          </Link>
          <Link to="/chart/long-read" className="cta-ghost">
            Written tarot — $7/week
          </Link>
        </div>
      </section>

      <div className="px-6 md:px-10 pb-20">
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip ${category === c ? "on" : ""} journal-chip ${category === c ? "is-active" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {!posts && <p className="serif-quiet">Loading the Journal…</p>}

        {posts && visible.length === 0 && (
          <p className="serif-quiet">No pieces in this category yet.</p>
        )}

        {featured && <PostCard post={featured} featured />}

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {rest.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default JournalPage;
