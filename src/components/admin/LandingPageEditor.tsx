import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { ExternalLink, Eye, EyeOff, RotateCcw, Save } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { DEFAULT_LANDING_CONTENT, mergeLandingContent, type LandingContent } from "../../data/landingContent";

const SECTIONS: Array<{ key: keyof LandingContent; title: string; description: string }> = [
  { key: "hero", title: "Showroom hero", description: "Control the two primary shopping calls to action." },
  { key: "categories", title: "Category rail", description: "The horizontal product-category navigation." },
  { key: "bra", title: "B-Lift feature", description: "Headline and supporting copy for the sports-bra moment." },
  { key: "shorts", title: "S-Glitch feature", description: "Headline and supporting copy for the shorts moment." },
  { key: "howItWorks", title: "How it works", description: "Explain the made-to-order shopping journey." },
  { key: "newsletter", title: "Newsletter", description: "Control the email capture message and response." },
  { key: "trust", title: "Trust badges", description: "Show or hide the storefront assurance row." },
];

export function LandingPageEditor() {
  // Reading stored content is disabled until the site-content store is live on
  // the new backend; querying an undeployed function crashed the admin page.
  const stored = undefined as { value?: unknown } | undefined;
  const saveLanding = useMutation(api.siteContent.saveLanding);
  const [content, setContent] = useState<LandingContent>(DEFAULT_LANDING_CONTENT);
  const [selected, setSelected] = useState<keyof LandingContent>("hero");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (stored !== undefined) setContent(mergeLandingContent(stored?.value));
  }, [stored]);

  const patch = (key: keyof LandingContent, field: string, value: string | boolean) =>
    setContent((current) => ({ ...current, [key]: { ...current[key], [field]: value } }));

  const section: any = content[selected];
  const fields = Object.keys(section).filter((field) => field !== "visible");

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      await saveLanding({ value: content });
      setMessage("Landing page updated.");
    } catch (e: any) {
      setMessage(e?.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[.24em] text-amber-400/60">Site control</p>
          <h1 className="mt-1 text-xl font-medium text-white/90">Landing page editor</h1>
          <p className="mt-1 text-xs text-white/35">Edit live storefront copy and section visibility without touching code.</p>
        </div>
        <div className="flex gap-2">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-2 text-xs text-white/55 hover:text-white"><ExternalLink className="h-3.5 w-3.5" />Open site</a>
          <button onClick={save} disabled={saving} className="flex items-center gap-1.5 rounded-md bg-amber-500/20 px-4 py-2 text-xs font-medium text-amber-300 hover:bg-amber-500/30 disabled:opacity-50"><Save className="h-3.5 w-3.5" />{saving ? "Saving…" : "Publish changes"}</button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="space-y-1 rounded-xl border border-white/[0.07] bg-white/[0.025] p-2">
          {SECTIONS.map((item) => {
            const visible = (content[item.key] as any).visible;
            return <button key={item.key} onClick={() => setSelected(item.key)} className={`w-full rounded-lg p-3 text-left transition ${selected === item.key ? "bg-amber-500/10 ring-1 ring-amber-500/20" : "hover:bg-white/[0.04]"}`}>
              <span className="flex items-center justify-between text-sm text-white/75">{item.title}{visible === false ? <EyeOff className="h-3.5 w-3.5 text-white/25" /> : item.key !== "hero" ? <Eye className="h-3.5 w-3.5 text-emerald-400/50" /> : null}</span>
              <span className="mt-1 block text-[11px] leading-4 text-white/30">{item.description}</span>
            </button>;
          })}
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-5">
          <div className="mb-5 flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div><h2 className="text-base text-white/85">{SECTIONS.find((s) => s.key === selected)?.title}</h2><p className="mt-1 text-[11px] text-white/30">Changes appear after you publish.</p></div>
            {"visible" in section && <button onClick={() => patch(selected, "visible", !section.visible)} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] ${section.visible ? "bg-emerald-500/10 text-emerald-300" : "bg-white/5 text-white/35"}`}>{section.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}{section.visible ? "Visible" : "Hidden"}</button>}
          </div>
          {fields.length ? <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => <label key={field} className={field === "description" || field === "success" ? "sm:col-span-2" : ""}>
              <span className="mb-1.5 block text-[10px] uppercase tracking-wider text-white/30">{field.replace(/([A-Z])/g, " $1")}</span>
              {field === "description" ? <textarea rows={4} className="admin-input resize-none" value={section[field]} onChange={(e) => patch(selected, field, e.target.value)} /> : <input className="admin-input" value={section[field]} onChange={(e) => patch(selected, field, e.target.value)} />}
            </label>)}
          </div> : <div className="rounded-lg border border-dashed border-white/10 p-8 text-center text-xs text-white/30">This section currently has a visibility control only.</div>}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button onClick={() => setContent(DEFAULT_LANDING_CONTENT)} className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/60"><RotateCcw className="h-3 w-3" />Restore original copy</button>
        {message && <p className={`text-xs ${message.includes("updated") ? "text-emerald-400" : "text-red-400"}`}>{message}</p>}
      </div>
    </div>
  );
}
