import { useEffect, useRef, useState } from "react";
import { api, useAction } from "../lib/backend";

const defaultInputClass =
  "w-full bg-white border border-[rgba(92,155,205,0.25)] text-[15px] placeholder-slate-400 px-4 py-3 outline-none focus:border-[rgba(185,149,69,0.55)] transition-colors rounded-md";

/**
 * Birth location field with live autocomplete, backed by a real geocoding
 * search (OpenStreetMap Nominatim, via /api/chart?kind=geocode-search) —
 * not a static list. Debounced as-you-type; picking a suggestion locks in
 * the exact place name Nominatim resolved, which is what actually drives
 * chart accuracy. Shared between sign-up and the account page.
 */
export function LocationAutocomplete({
  value,
  onChange,
  inputClassName,
  className,
  required = false,
}: {
  value: string;
  onChange: (value: string) => void;
  inputClassName?: string;
  /** Restyle AuthPages passed className; keep it as an alias. */
  className?: string;
  required?: boolean;
}) {
  const resolvedClass = inputClassName || className || defaultInputClass;
  const search = useAction(api.geocode.search);
  const [suggestions, setSuggestions] = useState<{ displayName: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (text: string) => {
    onChange(text);
    setOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestRef.current;
      try {
        const result = await search({ q: text });
        if (requestId !== requestRef.current) return; // stale response
        setSuggestions(result?.suggestions ?? []);
      } catch {
        if (requestId === requestRef.current) setSuggestions([]);
      } finally {
        if (requestId === requestRef.current) setLoading(false);
      }
    }, 350);
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => value.trim().length >= 2 && setOpen(true)}
        placeholder="City, State/Country"
        autoComplete="off"
        className={resolvedClass}
        required={required}
      />
      {open && (loading || suggestions.length > 0) && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-[rgba(92,155,205,0.25)] rounded-md shadow-lg max-h-60 overflow-auto">
          {loading && suggestions.length === 0 && (
            <div className="px-4 py-3 text-[13px] text-slate-400">Searching...</div>
          )}
          {suggestions.map((s, i) => (
            <button
              key={`${s.displayName}-${i}`}
              type="button"
              onClick={() => {
                onChange(s.displayName);
                setSuggestions([]);
                setOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-[13px] text-slate-600 hover:bg-[rgba(185,149,69,0.08)] transition-colors"
            >
              {s.displayName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
