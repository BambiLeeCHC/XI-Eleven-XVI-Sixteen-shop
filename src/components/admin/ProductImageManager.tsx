import {
  ArrowLeft,
  ArrowRight,
  GripVertical,
  ImagePlus,
  Loader2,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import { uploadImage } from "../../lib/media";

export function ProductImageManager({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    try {
      const next = [...images];
      for (const file of Array.from(files)) {
        next.push(await uploadImage(file, "product-media"));
      }
      onChange(next);
    } catch (e: any) {
      setError(e?.message || "Upload failed.");
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  };

  const move = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const reorder = (from: number, to: number) => {
    if (
      from === to ||
      from < 0 ||
      to < 0 ||
      from >= images.length ||
      to >= images.length
    )
      return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  const handleDrop = (index: number) => {
    if (dragIndex !== null) reorder(dragIndex, index);
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="space-y-3 rounded-lg border border-white/[0.08] bg-black/20 p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-white/75">Product gallery</p>
          <p className="text-[10px] text-white/30">
            First photo is the storefront cover. Drag to reorder, or use the
            arrows. Save product to publish changes.
          </p>
        </div>
        <button
          type="button"
          disabled={uploading}
          onClick={() => input.current?.click()}
          className="flex items-center gap-1.5 rounded-md bg-amber-500/15 px-3 py-2 text-xs text-amber-300 hover:bg-amber-500/25 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ImagePlus className="h-3.5 w-3.5" />
          )}
          {uploading ? "Uploading…" : "Upload photos"}
        </button>
        <input
          ref={input}
          hidden
          multiple
          type="file"
          accept="image/*"
          onChange={e => upload(e.target.files)}
        />
      </div>
      {images.length ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {images.map((src, index) => (
            <div
              key={`${src}-${index}`}
              role="group"
              aria-label={`Photo ${index + 1}${index === 0 ? " (cover)" : ""}, drag to reorder`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={e => {
                e.preventDefault();
                if (overIndex !== index) setOverIndex(index);
              }}
              onDragLeave={() =>
                setOverIndex(cur => (cur === index ? null : cur))
              }
              onDrop={e => {
                e.preventDefault();
                handleDrop(index);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              className={`group relative aspect-square cursor-grab overflow-hidden rounded-md border bg-white/5 transition active:cursor-grabbing ${
                overIndex === index && dragIndex !== null && dragIndex !== index
                  ? "border-amber-400/70 ring-1 ring-amber-400/50"
                  : "border-white/10"
              } ${dragIndex === index ? "opacity-40" : ""}`}
            >
              <img
                src={src}
                alt={`Product ${index + 1}`}
                className="pointer-events-none h-full w-full object-cover"
              />
              {index === 0 && (
                <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[8px] uppercase text-amber-300">
                  Cover
                </span>
              )}
              <div
                className="absolute right-1 top-1 rounded bg-black/60 p-0.5 text-white/50 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
                aria-hidden="true"
              >
                <GripVertical className="h-3 w-3" />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-black/75 p-1 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  className="p-2 text-white/70 disabled:opacity-20"
                  aria-label="Move photo left"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(images.filter((_, i) => i !== index))}
                  className="p-2 text-red-300"
                  aria-label="Delete photo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === images.length - 1}
                  onClick={() => move(index, 1)}
                  className="p-2 text-white/70 disabled:opacity-20"
                  aria-label="Move photo right"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-white/10 py-6 text-center text-xs text-white/25">
          No product photos
        </p>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
