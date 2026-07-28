import { useEffect, useRef, useState } from "react";

/**
 * Dependency-free rich text editor for the admin Journal composer.
 * Emits clean HTML that matches the .journal-prose styles on the public post page.
 */

type Cmd =
  | { kind: "exec"; cmd: string; arg?: string; label: string; title: string }
  | { kind: "block"; tag: string; label: string; title: string }
  | { kind: "link"; label: string; title: string }
  | { kind: "image"; label: string; title: string }
  | { kind: "divider" };

const TOOLBAR: Cmd[] = [
  { kind: "block", tag: "h2", label: "H2", title: "Section heading" },
  { kind: "block", tag: "h3", label: "H3", title: "Sub heading" },
  { kind: "block", tag: "p", label: "¶", title: "Paragraph" },
  { kind: "divider" },
  { kind: "exec", cmd: "bold", label: "B", title: "Bold" },
  { kind: "exec", cmd: "italic", label: "I", title: "Italic" },
  { kind: "exec", cmd: "underline", label: "U", title: "Underline" },
  { kind: "exec", cmd: "strikeThrough", label: "S", title: "Strikethrough" },
  { kind: "divider" },
  { kind: "exec", cmd: "insertUnorderedList", label: "• List", title: "Bulleted list" },
  { kind: "exec", cmd: "insertOrderedList", label: "1. List", title: "Numbered list" },
  { kind: "block", tag: "blockquote", label: "❝", title: "Pull quote" },
  { kind: "divider" },
  { kind: "link", label: "Link", title: "Insert link" },
  { kind: "image", label: "Image", title: "Insert image by URL" },
  { kind: "divider" },
  { kind: "exec", cmd: "removeFormat", label: "Clear", title: "Clear formatting" },
  { kind: "exec", cmd: "undo", label: "↺", title: "Undo" },
  { kind: "exec", cmd: "redo", label: "↻", title: "Redo" },
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write the piece…",
  minHeight = 380,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [showHtml, setShowHtml] = useState(false);

  // Only write into the DOM when the incoming value differs (avoids caret jumps)
  useEffect(() => {
    const el = ref.current;
    if (el && !showHtml && el.innerHTML !== value) el.innerHTML = value || "";
  }, [value, showHtml]);

  const emit = () => {
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const run = (c: Cmd) => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    if (c.kind === "exec") {
      document.execCommand(c.cmd, false, c.arg);
    } else if (c.kind === "block") {
      document.execCommand("formatBlock", false, c.tag);
    } else if (c.kind === "link") {
      const url = window.prompt("Link URL (https://…)");
      if (url) document.execCommand("createLink", false, url);
    } else if (c.kind === "image") {
      const url = window.prompt("Image URL (https://…)");
      if (url) document.execCommand("insertImage", false, url);
    }
    emit();
  };

  const words = (value || "").replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;

  return (
    <div className="rte">
      <div className="rte__toolbar">
        {TOOLBAR.map((c, i) =>
          c.kind === "divider" ? (
            <span key={i} className="rte__divider" />
          ) : (
            <button
              key={i}
              type="button"
              title={c.title}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => run(c)}
              className="rte__btn"
            >
              {c.label}
            </button>
          )
        )}
        <button
          type="button"
          className={`rte__btn rte__btn--toggle ml-auto ${showHtml ? "is-on" : ""}`}
          onClick={() => setShowHtml((s) => !s)}
          title="Toggle HTML source"
        >
          {showHtml ? "Visual" : "HTML"}
        </button>
      </div>

      {showHtml ? (
        <textarea
          className="rte__source"
          style={{ minHeight }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
        />
      ) : (
        <div
          ref={ref}
          className="rte__surface journal-prose"
          style={{ minHeight }}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={emit}
          onBlur={emit}
          onPaste={(e) => {
            // paste as plain text to keep the HTML clean
            e.preventDefault();
            const text = e.clipboardData.getData("text/plain");
            document.execCommand("insertText", false, text);
            emit();
          }}
        />
      )}

      <div className="rte__status">
        <span>{words} words · ~{Math.max(1, Math.round(words / 200))} min read</span>
        <span>Paste arrives as plain text · ⌘B / ⌘I work as expected</span>
      </div>
    </div>
  );
}
