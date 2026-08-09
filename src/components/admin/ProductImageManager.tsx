import { useRef, useState } from "react";
import { uploadImage } from "../../lib/media";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2 } from "lucide-react";

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

  return (
    <div className="space-y-3 rounded-lg border border-white/[0.08] bg-black/20 p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-white/75">Product gallery</p>
          <p className="text-[10px] text-white/30">First photo is the storefront cover. Save product to publish changes.</p>
        </div>
        <button
          type="button"
          disabled={uploading}
          onClick={() => input.current?.click()}
          className="flex items-center gap-1.5 rounded-md bg-amber-500/15 px-3 py-2 text-xs text-amber-300 hover:bg-amber-500/25 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
          {uploading ? "Uploading…" : "Upload photos"}
        </button>
        <input ref={input} hidden multiple type="file" accept="image/*" onChange={(e) => upload(e.target.files)} />
      </div>
      {images.length ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
          {images.map((src, index) => (
            <div key={`${src}-${index}`} className="group relative aspect-square overflow-hidden rounded-md border border-white/10 bg-white/5">
              <img src={src} alt={`Product photo ${index + 1}`} className="h-full w-full object-cover" />
              {index === 0 && <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[8px] uppercase text-amber-300">Cover</span>}
              <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-black/75 p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className="p-1 text-white/70 disabled:opacity-20" aria-label="Move photo left"><ArrowLeft className="h-3 w-3" /></button>
                <button type="button" onClick={() => onChange(images.filter((_, i) => i !== index))} className="p-1 text-red-300" aria-label="Delete photo"><Trash2 className="h-3 w-3" /></button>
                <button type="button" disabled={index === images.length - 1} onClick={() => move(index, 1)} className="p-1 text-white/70 disabled:opacity-20" aria-label="Move photo right"><ArrowRight className="h-3 w-3" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : <p className="rounded-md border border-dashed border-white/10 py-6 text-center text-xs text-white/25">No product photos</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
