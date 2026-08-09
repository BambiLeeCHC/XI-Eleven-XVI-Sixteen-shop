import { useState } from "react";
import { useMutation, useQuery } from "../../lib/backend";
import { api } from "../../lib/backend";
import { RichTextEditor } from "./RichTextEditor";
import { Edit, Eye, FileText, Plus, Sparkles, Trash2, X } from "lucide-react";

const CATEGORIES = ["Manifesto", "Sustainability", "Ritual", "Numerology", "Style", "Drops"];

interface Draft {
  postId?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  author: string;
  coverImage: string;
  status: "draft" | "published";
  featured: boolean;
}

const EMPTY: Draft = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "Manifesto",
  tags: "",
  author: "XI · XVI",
  coverImage: "",
  status: "draft",
  featured: false,
};

/** Admin panel → Journal: list, edit, compose and publish blog posts. */
export function JournalAdminTab() {
  const posts = useQuery(api.blog.listAll, {}) as any[] | undefined;
  const createPost = useMutation(api.blog.createPost);
  const updatePost = useMutation(api.blog.updatePost);
  const deletePost = useMutation(api.blog.deletePost);
  const seed = useMutation(api.blog.seedWelcomePost);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => (d ? { ...d, [k]: v } : d));

  const openNew = () => setDraft({ ...EMPTY });

  const openExisting = (p: any) =>
    setDraft({
      postId: p._id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: p.content,
      category: p.category,
      tags: (p.tags ?? []).join(", "),
      author: p.author,
      coverImage: p.coverImage ?? "",
      status: p.status,
      featured: !!p.featured,
    });

  const save = async (status: "draft" | "published") => {
    if (!draft) return;
    if (!draft.title.trim()) {
      setMsg("A title is required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: draft.title.trim(),
        excerpt: draft.excerpt.trim() || draft.content.replace(/<[^>]*>/g, " ").slice(0, 180),
        content: draft.content,
        category: draft.category,
        tags: draft.tags.split(",").map((t) => t.trim()).filter(Boolean),
        author: draft.author.trim() || "XI · XVI",
        coverImage: draft.coverImage.trim() || undefined,
        status,
        featured: draft.featured,
        slug: draft.slug.trim() || undefined,
      };
      if (draft.postId) {
        await updatePost({ postId: draft.postId, ...payload });
      } else {
        await createPost(payload);
      }
      setMsg(status === "published" ? "Published ✓" : "Saved as draft ✓");
      setDraft(null);
    } catch (e: any) {
      setMsg(e?.message ?? "Something went wrong.");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const remove = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await deletePost({ postId: id });
  };

  const togglePublish = async (p: any) => {
    await updatePost({
      postId: p._id,
      status: p.status === "published" ? "draft" : "published",
    });
  };

  // ── Composer ──────────────────────────────────────────────────────────
  if (draft) {
    return (
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-medium text-white/90">
              {draft.postId ? "Edit entry" : "New Journal entry"}
            </h2>
            <p className="text-[12px] text-white/35 mt-0.5">
              Publishes to xixvi.shop/journal
            </p>
          </div>
          <button
            onClick={() => setDraft(null)}
            className="p-2 text-white/40 hover:text-white/80"
            aria-label="Close composer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <input
            className="admin-input text-lg"
            placeholder="Title"
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              className="admin-input"
              value={draft.category}
              onChange={(e) => set("category", e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              className="admin-input"
              placeholder="Author"
              value={draft.author}
              onChange={(e) => set("author", e.target.value)}
            />
            <input
              className="admin-input"
              placeholder="url-slug (optional)"
              value={draft.slug}
              onChange={(e) => set("slug", e.target.value)}
            />
          </div>

          <input
            className="admin-input"
            placeholder="Cover image URL (optional)"
            value={draft.coverImage}
            onChange={(e) => set("coverImage", e.target.value)}
          />

          <textarea
            className="admin-input"
            rows={2}
            placeholder="Excerpt — the line that shows in the feed and in social previews"
            value={draft.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
          />

          <RichTextEditor value={draft.content} onChange={(html) => set("content", html)} />

          <div className="flex flex-wrap items-center gap-3">
            <input
              className="admin-input flex-1 min-w-[200px]"
              placeholder="tags, comma, separated"
              value={draft.tags}
              onChange={(e) => set("tags", e.target.value)}
            />
            <label className="flex items-center gap-2 text-[12px] text-white/60">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(e) => set("featured", e.target.checked)}
              />
              Feature at the top of the feed
            </label>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              disabled={saving}
              onClick={() => save("published")}
              className="px-4 py-2 rounded-md text-[13px] font-medium bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 disabled:opacity-50"
            >
              {draft.status === "published" ? "Update & keep live" : "Publish now"}
            </button>
            <button
              disabled={saving}
              onClick={() => save("draft")}
              className="px-4 py-2 rounded-md text-[13px] bg-white/[0.06] text-white/70 hover:bg-white/[0.1] disabled:opacity-50"
            >
              Save as draft
            </button>
            {draft.postId && (
              <a
                href={`/journal/${draft.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-[12px] text-white/40 hover:text-white/70 flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" /> View on site
              </a>
            )}
            {msg && <span className="text-[12px] text-white/50">{msg}</span>}
          </div>
        </div>
      </div>
    );
  }

  // ── List ──────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-medium text-white/90">Journal</h2>
          <p className="text-[12px] text-white/35 mt-0.5">
            {posts ? `${posts.length} entr${posts.length === 1 ? "y" : "ies"}` : "Loading…"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              const r: any = await seed({});
              setMsg(
                r?.inserted?.length
                  ? `Seeded: ${r.inserted.join(", ")}`
                  : "Launch entries already present."
              );
              setTimeout(() => setMsg(null), 3000);
            }}
            className="px-3 py-2 rounded-md text-[12px] bg-white/[0.06] text-white/60 hover:bg-white/[0.1] flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Seed launch entries
          </button>
          <button
            onClick={openNew}
            className="px-3 py-2 rounded-md text-[13px] font-medium bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> New entry
          </button>
        </div>
      </div>

      {msg && <p className="text-[12px] text-white/50 mb-3">{msg}</p>}

      {posts === undefined ? (
        <p className="text-white/30 text-sm">Loading…</p>
      ) : posts.length === 0 ? (
        <div className="border border-white/[0.06] rounded-lg p-10 text-center">
          <FileText className="w-8 h-8 text-white/15 mx-auto mb-3" />
          <p className="text-white/50 text-sm">No entries yet.</p>
          <p className="text-white/30 text-[12px] mt-1">
            Seed the launch entries, or write the first one.
          </p>
        </div>
      ) : (
        <div className="border border-white/[0.06] rounded-lg overflow-hidden">
          {posts.map((p: any) => (
            <div
              key={p._id}
              className="flex items-center gap-4 px-4 py-3 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-white/85 truncate">
                  {p.title}
                  {p.featured && <span className="ml-2 text-amber-400/70 text-[10px]">FEATURED</span>}
                </p>
                <p className="text-[11px] text-white/30 truncate">
                  /journal/{p.slug} · {p.category} · {p.readMinutes} min
                </p>
              </div>
              <button
                onClick={() => togglePublish(p)}
                className={`px-2 py-1 rounded text-[10px] tracking-wide uppercase ${
                  p.status === "published"
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-white/[0.06] text-white/40"
                }`}
                title="Toggle published / draft"
              >
                {p.status}
              </button>
              <button
                onClick={() => openExisting(p)}
                className="p-1.5 text-white/40 hover:text-white/80"
                aria-label="Edit"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => remove(p._id, p.title)}
                className="p-1.5 text-white/30 hover:text-red-400"
                aria-label="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
