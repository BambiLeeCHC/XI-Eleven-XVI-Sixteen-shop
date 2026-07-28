import { useState } from "react";

const SITE = "https://xixvi.shop";

export interface ShareTarget {
  id: string;
  label: string;
  href: (url: string, title: string, text: string) => string;
  icon: React.ReactNode;
}

const I = (d: string, filled = true) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} strokeWidth="1.7" aria-hidden="true">
    <path d={d} />
  </svg>
);

export const SHARE_TARGETS: ShareTarget[] = [
  {
    id: "linkedin",
    label: "LinkedIn",
    href: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`,
    icon: I("M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.76V21h-4v-5.5c0-1.38-.5-2.32-1.74-2.32-.95 0-1.5.63-1.75 1.24-.09.22-.11.53-.11.84V21H9z"),
  },
  {
    id: "facebook",
    label: "Facebook",
    href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
    icon: I("M14 9h3V5.5h-3c-2.2 0-4 1.8-4 4V12H7.5v3.5H10V22h3.5v-6.5H16l.5-3.5H13.5v-1.9c0-.6.4-1.1 1-1.1z"),
  },
  {
    id: "x",
    label: "X",
    href: (u, t) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`,
    icon: I("M18.2 2H21l-6.1 7L21.8 22h-6.3l-4.3-6-4.9 6H3.4l6.5-7.6L2.5 2h6.4l4 5.6zM16.9 20h1.7L7.2 4H5.4z"),
  },
  {
    id: "pinterest",
    label: "Pinterest",
    href: (u, t) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(u)}&description=${encodeURIComponent(t)}`,
    icon: I("M12 2a10 10 0 00-3.6 19.3c-.1-.8-.2-2 .04-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.6 2.2-.9 3.4-.2 1 .5 1.9 1.6 1.9 1.9 0 3.2-2.4 3.2-5.3 0-2.2-1.5-3.8-4.2-3.8-3 0-4.9 2.3-4.9 4.7 0 .9.3 1.6.7 2.1.2.2.2.3.1.6l-.2.9c-.1.3-.3.4-.6.3-1.5-.6-2.3-2.4-2.3-4.2C6 8.1 8.3 5 12.6 5c3.5 0 5.8 2.5 5.8 5.2 0 3.6-2 6.3-4.9 6.3-1 0-2-.5-2.3-1.2l-.6 2.4c-.2.9-.8 2-1.2 2.7A10 10 0 1012 2z"),
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: (u, t) => `https://wa.me/?text=${encodeURIComponent(`${t} ${u}`)}`,
    icon: I("M12 2a10 10 0 00-8.6 15L2 22l5.1-1.3A10 10 0 1012 2zm5.3 13.6c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-1.7-.1-.4-.1-1-.3-1.7-.6-2.4-1.1-4-3.6-4.1-3.8-.1-.2-1-1.3-1-2.5s.6-1.8.9-2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.4.5c-.1.2-.3.3-.1.6.1.3.6 1 1.3 1.7.9.8 1.6 1 1.9 1.2.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.8.9c.5.2.5.4.5.6s0 .8-.2 1.4z"),
  },
  {
    id: "email",
    label: "Email",
    href: (u, t) => `mailto:?subject=${encodeURIComponent(t)}&body=${encodeURIComponent(`${t}\n\n${u}`)}`,
    icon: I("M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zm9 8L4.2 7.2 4 7v.6l8 5.9 8-5.9V7l-.2.2z"),
  },
];

/** Quick-share row attached to every post in the feed and on every post page. */
export function ShareRow({
  slug,
  title,
  excerpt,
  size = "md",
}: {
  slug: string;
  title: string;
  excerpt?: string;
  size?: "sm" | "md";
}) {
  const [copied, setCopied] = useState(false);
  const url = `${SITE}/journal/${slug}`;
  const text = `${title} — XI · XVI`;

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: excerpt || text, url });
        return;
      } catch {
        /* user cancelled */
      }
    }
    copyLink();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className={`journal-share journal-share--${size}`}>
      <span className="journal-share__label">Share</span>
      {SHARE_TARGETS.map((t) => (
        <a
          key={t.id}
          href={t.href(url, text, excerpt || "")}
          target="_blank"
          rel="noopener noreferrer"
          className="journal-share__btn"
          aria-label={`Share on ${t.label}`}
          title={`Share on ${t.label}`}
          onClick={(e) => e.stopPropagation()}
        >
          {t.icon}
        </a>
      ))}
      <button
        className="journal-share__btn"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          copyLink();
        }}
        aria-label="Copy link"
        title="Copy link"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M10 13a5 5 0 007 0l2-2a5 5 0 00-7-7l-1 1" />
          <path d="M14 11a5 5 0 00-7 0l-2 2a5 5 0 007 7l1-1" />
        </svg>
      </button>
      <button
        className="journal-share__btn journal-share__btn--native"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          nativeShare();
        }}
        aria-label="More share options"
        title="More options"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" />
          <path d="M8.2 10.8l7.6-4.3M8.2 13.2l7.6 4.3" />
        </svg>
      </button>
      {copied && <span className="journal-share__copied">Link copied ✓</span>}
    </div>
  );
}
