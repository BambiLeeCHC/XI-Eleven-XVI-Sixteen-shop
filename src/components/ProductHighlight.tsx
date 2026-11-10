import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DEFAULT_LANDING_CONTENT } from "../data/landingContent";
import {
  colorCountLabel,
  colorFromName,
  displayProductName,
  formatPrice,
  groupProductsByStyle,
  snapHex,
} from "../lib/brand";
import { hiResProductImage } from "../lib/productImage";

type HighlightProduct = {
  _id: string;
  name: string;
  price: number;
  images?: string[];
};

function highlightCopy(key: string): {
  eyebrow: string;
  accent: string;
  facts: string[];
} {
  const landing = DEFAULT_LANDING_CONTENT;
  switch (key) {
    case "B-Lift":
      return {
        eyebrow: landing.bra.eyebrow,
        accent: landing.bra.accent,
        facts: [
          "Removable cups.",
          "Moisture-wicking fabric.",
          "Your fit, your way.",
        ],
      };
    case "S-Glitch 2.5":
      return {
        eyebrow: landing.shorts.eyebrow,
        accent: '2.5" Shorts',
        facts: [
          "Statement performance shorts.",
          "Engineered for movement.",
          "Made on demand.",
        ],
      };
    case "S-Glitch 6.3":
      return {
        eyebrow: landing.shorts.eyebrow,
        accent: '6.3" Shorts',
        facts: [
          "Statement performance shorts.",
          "Engineered for movement.",
          "Made on demand.",
        ],
      };
    case "D-Slip":
      return {
        eyebrow: "Cut to move with you",
        accent: "Slip Dress",
        facts: ["Soft drape.", "Your fit, your way.", "Made on demand."],
      };
    case "J-Glitch":
      return {
        eyebrow: "On and off the pitch",
        accent: "Jersey",
        facts: [
          "Performance jersey.",
          "Your fit, your way.",
          "Made on demand.",
        ],
      };
    case "L-Flow":
      return {
        eyebrow: "Engineered for Movement",
        accent: "Leggings",
        facts: ["Yoga leggings.", "Your fit, your way.", "Made on demand."],
      };
    case "T-Icon Oversized":
      return {
        eyebrow: "The everyday mark",
        accent: "Oversized Tee",
        facts: ["Relaxed oversized fit.", "Made on demand."],
      };
    case "T-Icon Tie-Dye":
      return {
        eyebrow: "The everyday mark",
        accent: "Tie-Dye Tee",
        facts: ["Tie-dye tee.", "Made on demand."],
      };
    case "T-Icon":
      return {
        eyebrow: "The everyday mark",
        accent: "Tee",
        facts: ["Relaxed fit.", "Made on demand."],
      };
    default:
      return {
        eyebrow: "Made on demand",
        accent: key,
        facts: ["Your fit, your way.", "Made on demand."],
      };
  }
}


const LENSES: { id: string; label: string; match: (key: string) => boolean }[] = [
  { id: "all", label: "All", match: () => true },
  { id: "women", label: "Women", match: key => ["D-Slip", "B-Lift", "L-Flow"].includes(key) },
  { id: "men", label: "Men", match: key => key.startsWith("J-") || key.startsWith("S-") || key.startsWith("T-") },
  { id: "dress", label: "Dress", match: key => key === "D-Slip" },
  { id: "bra", label: "Bra", match: key => key === "B-Lift" },
  { id: "legging", label: "Legging", match: key => key === "L-Flow" },
  { id: "jersey", label: "Jersey", match: key => key === "J-Glitch" },
  { id: "short", label: "Short", match: key => key.startsWith("S-Glitch") },
  { id: "tee", label: "Tee", match: key => key.startsWith("T-Icon") },
];

export function ProductHighlight({
  products,
}: {
  products: HighlightProduct[] | undefined;
}) {
  const groups = useMemo(() => groupProductsByStyle(products ?? []), [products]);
  const [lens, setLens] = useState("all");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flash, setFlash] = useState(0);

  const visible = useMemo(() => {
    const rule = LENSES.find(item => item.id === lens) ?? LENSES[0];
    const next = groups.filter(group => rule.match(group.key));
    return next.length ? next : groups;
  }, [groups, lens]);

  const current = visible.find(group => group.key === activeKey) ?? visible[0];
  const selected = current?.items.find(item => item._id === selectedId) ?? current?.items[0];

  useEffect(() => {
    if (!current) return;
    if (!visible.some(group => group.key === current.key)) {
      setActiveKey(visible[0]?.key ?? null);
      setSelectedId(visible[0]?.items[0]?._id ?? null);
    }
  }, [visible, current]);

  if (!current || !selected) return null;

  const copy = highlightCopy(current.key);
  const facts = [...copy.facts];
  if (current.items.length > 1 && !facts.some(line => line.toLowerCase().includes("color"))) {
    facts.push(colorCountLabel(current.items.length));
  }
  const index = visible.findIndex(group => group.key === current.key);

  const choose = (key: string, id: string | null) => {
    setActiveKey(key);
    setSelectedId(id);
    setFlash(value => value + 1);
  };

  return (
    <section className="fx-index" id="index">
      <header className="fx-index__head">
        <div>
          <p className="label-lock">Fashion index</p>
          <h2 className="clash fx-index__title">The cuts.</h2>
        </div>
        <p className="fx-index__count">
          {String(index + 1).padStart(2, "0")} / {String(visible.length).padStart(2, "0")}
        </p>
      </header>

      <div className="fx-index__lenses" role="tablist" aria-label="Categories">
        {LENSES.map(item => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={lens === item.id}
            className={lens === item.id ? "is-on" : undefined}
            onClick={() => {
              setLens(item.id);
              setActiveKey(null);
              setSelectedId(null);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="fx-index__body">
        <aside className="fx-index__rail" aria-label="Styles">
          {visible.map((group, i) => {
            const on = group.key === current.key;
            return (
              <button
                key={group.key}
                type="button"
                className={on ? "is-on" : undefined}
                onClick={() => choose(group.key, group.items[0]?._id ?? null)}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                <strong>{group.key}</strong>
                <em>{formatPrice(group.items[0]?.price)}</em>
              </button>
            );
          })}
        </aside>

        <div className="fx-index__stage">
          {flash > 0 ? <span key={flash} className="fx-index__flash" aria-hidden="true" /> : null}
          {selected.images?.[0] ? (
            <img
              src={hiResProductImage(selected.images[0], 1400)}
              alt={displayProductName(selected.name)}
            />
          ) : null}
          <div className="fx-index__sheet">
            <p className="label-lock">{copy.eyebrow}</p>
            <p className="clash fx-index__name">{current.key}</p>
            <p className="serif-quiet fx-index__accent">{copy.accent}</p>
            <ul>
              {facts.slice(0, 3).map(line => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            {current.items.length > 1 ? (
              <div className="fx-index__colors">
                {current.items.map(item => {
                  const color = colorFromName(item.name) || item.name;
                  const on = item._id === selected._id;
                  return (
                    <button
                      key={item._id}
                      type="button"
                      aria-label={color}
                      className={`snap${on ? " on" : ""}`}
                      style={{ background: snapHex(color) }}
                      onClick={() => setSelectedId(item._id)}
                    />
                  );
                })}
              </div>
            ) : null}
            <div className="fx-index__buy">
              <p className="clash">{formatPrice(selected.price)}</p>
              <Link to={`/product/${selected._id}`} className="cta-pist">
                Shop {current.key}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
