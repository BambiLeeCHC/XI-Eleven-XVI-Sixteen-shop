import { useEffect } from "react";

/**
 * Glass pop-over shell used by every Journal dock (Almanac, Draw, Code).
 * Flanks the feed on desktop, becomes a bottom sheet on mobile.
 * Always closable with the X button or Escape.
 */
export function DockPanel({
  open,
  onClose,
  title,
  eyebrow,
  side = "left",
  accent = "#c48dff",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  side?: "left" | "right";
  accent?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Mobile scrim */}
      <button
        aria-label="Close panel"
        onClick={onClose}
        className="lg:hidden fixed inset-0 z-40"
        style={{ background: "rgba(12,22,40,.45)", backdropFilter: "blur(2px)" }}
      />
      <aside
        className={`journal-dock-panel journal-dock-panel--${side}`}
        style={{ ["--dock-accent" as any]: accent }}
        role="dialog"
        aria-label={title}
      >
        <div className="journal-dock-panel__glow" aria-hidden="true" />
        <header className="relative flex items-start justify-between gap-3 px-5 pt-4 pb-3">
          <div>
            {eyebrow && (
              <p className="text-[9px] tracking-[0.34em] uppercase" style={{ color: "rgba(21,36,61,.38)" }}>
                {eyebrow}
              </p>
            )}
            <h3
              className="text-[15px] font-semibold tracking-[0.06em] mt-0.5"
              style={{ color: "rgba(17,30,52,.9)", fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="journal-dock-close shrink-0"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>
        <div className="journal-dock-panel__body px-5 pb-5">{children}</div>
      </aside>
    </>
  );
}

/** Vertical rail tab that opens a dock. */
export function DockTab({
  label,
  glyph,
  active,
  onClick,
  accent = "#c48dff",
}: {
  label: string;
  glyph: string;
  active: boolean;
  onClick: () => void;
  accent?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`journal-dock-tab ${active ? "is-active" : ""}`}
      style={{ ["--dock-accent" as any]: accent }}
      aria-expanded={active}
    >
      <span className="journal-dock-tab__glyph" aria-hidden="true">{glyph}</span>
      <span className="journal-dock-tab__label">{label}</span>
    </button>
  );
}
