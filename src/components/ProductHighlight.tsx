import { useMemo, useState } from "react";
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

export function ProductHighlight({
  products,
}: {
  products: HighlightProduct[] | undefined;
}) {
  const groups = useMemo(
    () => groupProductsByStyle(products ?? []),
    [products],
  );
  const preferredKey =
    groups.find(g => g.key === "B-Lift")?.key ?? groups[0]?.key ?? null;
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const current =
    groups.find(g => g.key === (activeKey ?? preferredKey)) ?? groups[0];
  const selected =
    current?.items.find(p => p._id === selectedId) ?? current?.items[0];

  if (!current || !selected) return null;

  const copy = highlightCopy(current.key);
  const facts = [...copy.facts];
  if (
    current.items.length > 1 &&
    !facts.some(line => line.toLowerCase().includes("color"))
  ) {
    facts.push(`${colorCountLabel(current.items.length)}.`);
  }

  return (
    <section
      className="grid md:grid-cols-[240px_1fr] min-h-[72vh]"
      style={{ background: "var(--cream)", color: "#0B0B0C" }}
    >
      <aside
        className="p-7"
        style={{
          background: "var(--cream)",
          borderRight: "4px solid var(--pist)",
        }}
      >
        <p className="label-lock mb-5" style={{ color: "#6b6358" }}>
          Style index
        </p>
        {groups.map(group => {
          const on = group.key === current.key;
          const price = group.items[0]?.price;
          return (
            <button
              type="button"
              key={group.key}
              onClick={() => {
                setActiveKey(group.key);
                setSelectedId(group.items[0]?._id ?? null);
              }}
              className="flex items-center w-full text-left py-3 uppercase tracking-[0.16em] text-[12px]"
              style={{
                color: on ? "#0B0B0C" : "#6b6358",
                background: on ? "rgba(216,240,196,0.55)" : "transparent",
                margin: on ? "0 -18px" : 0,
                paddingLeft: on ? 18 : 0,
                paddingRight: on ? 18 : 0,
              }}
            >
              <span
                className="inline-block mr-2.5 rounded-full"
                style={{
                  width: on ? 10 : 8,
                  height: on ? 10 : 8,
                  background: on ? "#0B0B0C" : "#c9bfb3",
                }}
              />
              <span
                className="clash mr-2"
                style={{ fontSize: 22, textTransform: "none" }}
              >
                {group.key}
              </span>
              {price ? formatPrice(price) : "—"}
            </button>
          );
        })}
      </aside>

      <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(280px,1fr)] min-h-[72vh] items-stretch">
        <div
          className="flex items-center justify-center p-6"
          style={{ background: "#111" }}
        >
          {selected.images?.[0] ? (
            <img
              src={selected.images[0]}
              alt={displayProductName(selected.name)}
              className="max-h-[62vh] max-w-[520px] w-full object-contain"
            />
          ) : null}
        </div>

        <div
          className="relative grid gap-5 md:grid-cols-[1.2fr_auto] items-end"
          style={{
            background: "var(--cream)",
            color: "#0B0B0C",
            border: "3px solid #0B0B0C",
            padding: "18px 20px",
          }}
        >
          <div>
            <p className="label-lock mb-2" style={{ color: "#6b6358" }}>
              {copy.eyebrow}
            </p>
            <p className="clash" style={{ fontSize: "clamp(36px, 5vw, 64px)" }}>
              {current.key}
            </p>
            <p
              className="serif-quiet mt-1"
              style={{ fontSize: 22, textTransform: "none" }}
            >
              {copy.accent}
            </p>
            <ul className="mt-3 space-y-1">
              {facts.slice(0, 4).map(line => (
                <li key={line} className="serif-quiet text-[17px]">
                  {line}
                </li>
              ))}
            </ul>
            {current.items.length > 1 ? (
              <div className="mt-4">
                <p className="label-lock mb-2" style={{ color: "#6b6358" }}>
                  Select a colour
                </p>
                <div className="flex gap-2.5 flex-wrap">
                  {current.items.map(item => {
                    const color = colorFromName(item.name) || item.name;
                    const on = item._id === selected._id;
                    return (
                      <button
                        type="button"
                        key={item._id}
                        aria-label={color}
                        className={`snap ${on ? "on" : ""}`}
                        style={{
                          background: snapHex(color),
                          borderColor: "#0B0B0C",
                        }}
                        onClick={() => setSelectedId(item._id)}
                      />
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex flex-col items-start md:items-end gap-3">
            <p
              className="clash"
              style={{ fontSize: 42, letterSpacing: "-0.06em" }}
            >
              {formatPrice(selected.price)}
            </p>
            <Link
              to={`/product/${selected._id}`}
              className="cta-pist text-center"
              style={{ boxShadow: "5px 5px 0 var(--blush)" }}
            >
              Shop {current.key}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
