import { useRef, useState } from "react";
import { useConvex } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ArrowLeft, ArrowRight, Loader2, Trash2, Upload } from "lucide-react";

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB — generous for product photography

/**
 * Admin control for a product's photo gallery.
 * Uploads go straight to Convex file storage; the resulting URLs are kept
 * in `images` (the same string[] shape the storefront already reads).
 */
export function ProductImageManager({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const convex = useConvex();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          throw new Error(`"${file.name}" isn't an image file.`);
        }
        if (file.size > MAX_FILE_BYTES) {
          throw new Error(`"${file.name}" is over the 8MB limit.`);
        }
        const uploadUrl = await convex.mutation(api.storage.generateUploadUrl, {});
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!res.ok) throw new Error(`Upload failed for "${file.name}".`);
        const { storageId } = await res.json();
        const url = await convex.query(api.storage.getUrl, { storageId });
        if (!url) throw new Error(`Could not resolve a URL for "${file.name}".`);
        uploaded.push(url);
      }
      onChange([...images, ...uploaded]);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong during upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const remove = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...images];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] text-white/25 block">
        Photos
        <span className="text-white/15 normal-case"> — first image is the storefront thumbnail</span>
      </label>

      {images.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {images.map((src, idx) => (
            <div
              key={`${src}-${idx}`}
              className="relative group aspect-square rounded overflow-hidden bg-white/5 border border-white/[0.08]"
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
              {idx === 0 && (
                <span className="absolute top-1 left-1 text-[8px] uppercase tracking-wide bg-black/60 text-amber-300 px-1 py-0.5 rounded">
                  Main
                </span>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  className="p-1 rounded bg-white/10 text-white/70 hover:text-white disabled:opacity-30"
                  title="Move earlier"
                >
                  <ArrowLeft className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="p-1 rounded bg-white/10 text-red-300 hover:text-red-400"
                  title="Remove"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={idx === images.length - 1}
                  className="p-1 rounded bg-white/10 text-white/70 hover:text-white disabled:opacity-30"
                  title="Move later"
                >
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-1.5 rounded text-xs bg-white/[0.06] text-white/70 hover:bg-white/[0.1] flex items-center gap-1.5 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          {uploading ? "Uploading…" : "Upload photos"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => uploadFiles(e.target.files)}
        />
        {images.length === 0 && !uploading && (
          <span className="text-[11px] text-white/25">No photos yet</span>
        )}
      </div>

      {error && <p className="text-[11px] text-red-400/80">{error}</p>}
    </div>
  );
}
