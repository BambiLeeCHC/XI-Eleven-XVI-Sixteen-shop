import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RadialVariantDial } from "../components/RadialVariantDial";
import { SEO } from "../components/SEO";
import { useSessionId } from "../hooks/useSessionId";
import { api, useAuthStatus, useMutation, useQuery } from "../lib/backend";
import {
  colorFromName,
  displayProductName,
  formatPrice,
  styleKeyFromName,
} from "../lib/brand";
import { namedColorway, resolveColorwayArt } from "../lib/colorwayImage";
import {
  categoriesFor,
  categoryById,
  colorNames,
  type DialGender,
  type DialProduct,
  type DialStep,
  parseGender,
  parseStep,
  productsFor,
  readLocalFavorites,
  siblingColors,
  sizeChoices,
  writeLocalFavorites,
} from "../lib/dialShop";
import { hiResProductImage } from "../lib/productImage";

type Crumb = { id: string; label: string; apply: () => void };

export function DialShopPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sessionId = useSessionId();
  const { isAuthenticated } = useAuthStatus();
  const catalog = (useQuery(api.products.list, {}) ?? []) as DialProduct[];
  const serverFavs = (useQuery(api.favorites.getIds, {}) ?? []) as string[];
  const addToCart = useMutation(api.cart.addItem);
  const toggleFavorite = useMutation(api.favorites.toggle);
  const [localFavs, setLocalFavs] = useState<string[]>(() =>
    readLocalFavorites(),
  );
  const [menu, setMenu] = useState(false);
  const [added, setAdded] = useState(false);
  const [hotCategory, setHotCategory] = useState<string | null>(null);
  const hold = useRef<number | null>(null);
  const menuLock = useRef(false);

  const gender = parseGender(params.get("g"));
  const category = params.get("c") || "";
  const productId = params.get("p") || "";
  const size = params.get("size") || "";
  const colorParam = params.get("color") || "";
  const step = parseStep(params.get("step"));
  const sheet = params.get("sheet") === "1";

  useEffect(() => {
    if (!params.get("g")) {
      navigate(
        { pathname: "/dial", search: "g=all&step=categories" },
        { replace: true },
      );
    }
  }, [params, navigate]);

  const go = (
    next: {
      g?: DialGender;
      c?: string;
      p?: string;
      size?: string;
      color?: string;
      step?: DialStep;
      sheet?: boolean;
    },
    replace = false,
  ) => {
    const query = new URLSearchParams();
    query.set("g", next.g ?? gender);
    const cat = next.c === undefined ? category : next.c;
    const piece = next.p === undefined ? productId : next.p;
    const picked = next.size === undefined ? size : next.size;
    const tone = next.color === undefined ? colorParam : next.color;
    const nextStep = next.step ?? step;
    const open = next.sheet === undefined ? sheet : next.sheet;
    if (cat) query.set("c", cat);
    if (piece) query.set("p", piece);
    if (picked) query.set("size", picked);
    if (tone) query.set("color", tone);
    query.set("step", nextStep);
    if (open) query.set("sheet", "1");
    navigate({ pathname: "/dial", search: query.toString() }, { replace });
  };

  const categories = categoriesFor(gender);
  const pieces = useMemo(
    () => productsFor(catalog, gender, category),
    [catalog, gender, category],
  );
  const pieceIndex = Math.max(
    0,
    pieces.findIndex(item => item._id === productId),
  );
  const piece = pieces[pieceIndex] || pieces[0];
  const sizes = piece ? sizeChoices(piece) : [];
  const colors = piece ? siblingColors(piece, catalog, size) : [];
  const hasAxis = piece ? colorNames(piece).length > 1 : false;
  const chosenSize = sizes.find(
    item => item.id === size || item.label === size,
  );
  const colorFocus =
    colors.find(item => item.id === colorParam) ||
    colors.find(item => item.id === productId);

  const previewFor = (id: string) => {
    if (!piece) return undefined;
    if (hasAxis) {
      return resolveColorwayArt({
        name: namedColorway(piece.name, id),
        fallback: piece.images,
      }).images[0];
    }
    const sibling = catalog.find(item => item._id === id) || piece;
    return resolveColorwayArt({
      images: sibling.images,
      name: sibling.name,
      fallback: piece.images,
    }).images[0];
  };

  const sheetProduct = (() => {
    if (!piece) return undefined;
    if (!hasAxis && colorFocus && colorFocus.id !== piece._id) {
      return catalog.find(item => item._id === colorFocus.id) || piece;
    }
    return piece;
  })();

  const backOne = () => {
    if (sheet) {
      go({ sheet: false });
      return;
    }
    if (step === "color") {
      go({ step: "size" });
      return;
    }
    if (step === "size") {
      go({ step: "pieces", size: "" });
      return;
    }
    if (step === "pieces") {
      go({ step: "categories", p: "", size: "" });
      return;
    }
    if (category) go({ c: "", p: "", size: "", step: "categories" });
  };

  const crumbs: Crumb[] = [
    {
      id: "gender",
      label: `Gender: ${gender === "all" ? "All" : gender === "women" ? "Women" : "Men"}`,
      apply: () =>
        go({ c: "", p: "", size: "", step: "categories", sheet: false }),
    },
  ];
  if (category) {
    crumbs.push({
      id: "category",
      label: `Category: ${category === "all" ? "All" : categoryById(category)?.label || category}`,
      apply: () => go({ p: "", size: "", step: "pieces", sheet: false }),
    });
  }
  if (piece && (step === "pieces" || step === "size" || step === "color")) {
    crumbs.push({
      id: "product",
      label: `Product: ${displayProductName(piece.name)}`,
      apply: () => go({ size: "", step: "pieces", sheet: false }),
    });
  }
  if (chosenSize && (step === "size" || step === "color")) {
    crumbs.push({
      id: "size",
      label: `Size: ${chosenSize.label}`,
      apply: () => go({ step: "size", sheet: false }),
    });
  }
  if (step === "color" && colorFocus) {
    crumbs.push({
      id: "color",
      label: `Color: ${colorFocus.label}`,
      apply: () => go({ step: "color", sheet: false }),
    });
  }

  const favIds = isAuthenticated ? serverFavs : localFavs;
  const favored = sheetProduct ? favIds.includes(sheetProduct._id) : false;

  const heart = async () => {
    if (!sheetProduct) return;
    if (isAuthenticated) {
      await toggleFavorite({ productId: sheetProduct._id });
      return;
    }
    const next = favored
      ? localFavs.filter(id => id !== sheetProduct._id)
      : [...localFavs, sheetProduct._id];
    setLocalFavs(next);
    writeLocalFavorites(next);
  };

  const buy = async () => {
    if (!sheetProduct || !chosenSize) return;
    await addToCart({
      sessionId,
      productId: sheetProduct._id,
      size: chosenSize.id,
      color: hasAxis ? colorFocus?.label : undefined,
      quantity: 1,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  // Close uses the params from the render that opened the sheet.
  // biome-ignore lint/correctness/useExhaustiveDependencies: sheet toggle only
  useEffect(() => {
    if (!sheet) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        go({ sheet: false });
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sheet]);

  const openMenu = () => {
    menuLock.current = true;
    setMenu(true);
  };

  return (
    <div className="dial-shop">
      <SEO
        title="Shop the dial"
        description="Choose a gender, a category, a piece, then size and color. The XIXVI dial."
        url="/dial"
      />
      <div className="dial-shop__stage">
        <div className="dial-gender" role="radiogroup" aria-label="Clothing">
          <span
            className="dial-gender__thumb"
            style={{
              transform:
                gender === "women"
                  ? "translateX(0)"
                  : gender === "all"
                    ? "translateX(100%)"
                    : "translateX(200%)",
            }}
            aria-hidden="true"
          />
          {(
            [
              ["women", "Women"],
              ["all", "All"],
              ["men", "Men"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={gender === id}
              className={gender === id ? "is-on" : ""}
              onClick={() =>
                go({
                  g: id,
                  c: "",
                  p: "",
                  size: "",
                  step: "categories",
                  sheet: false,
                })
              }
            >
              {label}
            </button>
          ))}
        </div>

        <div
          className="dial-orbit"
          key={`${gender}-${category}-${step}-${piece?._id || ""}`}
        >
          {step === "categories" ? (
            <CategoryRing
              items={categories.map(item => ({
                id: item.id,
                label: item.label,
              }))}
              hot={hotCategory}
              onHot={setHotCategory}
              onPick={id =>
                go({ c: id, p: "", size: "", step: "pieces", sheet: false })
              }
            />
          ) : null}

          {step === "pieces" && !piece ? (
            <p className="dial-piece__count">Nothing in this category yet.</p>
          ) : null}

          {step === "pieces" && piece ? (
            <PieceCarousel
              pieces={pieces}
              index={pieceIndex}
              onIndex={index =>
                go(
                  { p: pieces[index]?._id || "", size: "", step: "pieces" },
                  true,
                )
              }
              onPick={() =>
                go({ p: piece._id, size: "", step: "size", sheet: false })
              }
            />
          ) : null}

          {(step === "size" || step === "color") && piece ? (
            <div className="dial-variant">
              <RadialVariantDial
                sizes={sizes}
                colors={colors}
                sizeId={chosenSize?.id || ""}
                colorId={colorParam || (hasAxis ? "" : piece._id)}
                focus={step === "color" ? "color" : "size"}
                previews={Object.fromEntries(
                  colors.map(item => [item.id, previewFor(item.id)]),
                )}
                selectOnTap
                onSize={id =>
                  go({
                    size: id,
                    color: "",
                    step: colors.length ? "color" : "size",
                    sheet: false,
                  })
                }
                onColor={() => undefined}
                onCommit={id =>
                  go({
                    p: hasAxis ? piece._id : id,
                    color: id,
                    step: "color",
                    sheet: true,
                  })
                }
                onCommitSize={id =>
                  go({
                    size: id,
                    color: "",
                    step: "color",
                    sheet: colors.length === 0,
                  })
                }
              />
            </div>
          ) : null}
        </div>

        <div className="dial-back">
          <button
            type="button"
            className="dial-back__btn"
            aria-expanded={menu}
            aria-haspopup="menu"
            onPointerEnter={event => {
              if (event.pointerType === "mouse") openMenu();
            }}
            onFocus={openMenu}
            onPointerDown={() => {
              hold.current = window.setTimeout(openMenu, 420);
            }}
            onPointerUp={() => {
              if (hold.current) window.clearTimeout(hold.current);
            }}
            onClick={() => {
              if (menuLock.current) {
                menuLock.current = false;
                return;
              }
              if (menu) {
                setMenu(false);
                return;
              }
              backOne();
            }}
          >
            ← Back
          </button>
          {menu ? (
            <div className="dial-back__menu" role="menu">
              {crumbs.map(crumb => (
                <button
                  key={crumb.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenu(false);
                    crumb.apply();
                  }}
                >
                  {crumb.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {sheet && sheetProduct ? (
        <div
          className="dial-sheet"
          role="dialog"
          aria-modal="true"
          aria-label={displayProductName(sheetProduct.name)}
        >
          <button
            type="button"
            className="dial-sheet__scrim"
            aria-label="Close product"
            onClick={() => go({ sheet: false })}
          />
          <div className="dial-sheet__panel">
            <button
              type="button"
              className="dial-sheet__x"
              aria-label="Close"
              onClick={() => go({ sheet: false })}
            >
              ×
            </button>
            <div className="dial-sheet__photo">
              {sheetProduct.images?.[0] ? (
                <img
                  src={hiResProductImage(sheetProduct.images[0], 1200)}
                  alt={displayProductName(sheetProduct.name)}
                />
              ) : (
                <span>✦</span>
              )}
            </div>
            <div className="dial-sheet__copy">
              <p className="dial-sheet__kicker">
                {styleKeyFromName(sheetProduct.name)}
              </p>
              <h2>{displayProductName(sheetProduct.name)}</h2>
              <p className="dial-sheet__price">
                {formatPrice(sheetProduct.price)}
              </p>
              <p className="dial-sheet__meta">
                {chosenSize?.label || "Size"} ·{" "}
                {colorFocus?.label ||
                  colorFromName(sheetProduct.name) ||
                  "Color"}
              </p>
              <p className="dial-sheet__desc">
                {sheetProduct.description?.trim() ||
                  "Cut and finished when you order it."}
              </p>
              <div className="dial-sheet__actions">
                <button
                  type="button"
                  className="cta-pist"
                  onClick={buy}
                  disabled={!chosenSize}
                >
                  {added ? "Added to cart" : "Add to cart"}
                </button>
                <button
                  type="button"
                  className="dial-sheet__heart"
                  aria-pressed={favored}
                  onClick={heart}
                >
                  {favored ? "♥ Saved" : "♡ Favorite"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CategoryRing({
  items,
  hot,
  onHot,
  onPick,
}: {
  items: Array<{ id: string; label: string }>;
  hot: string | null;
  onHot: (id: string | null) => void;
  onPick: (id: string) => void;
}) {
  const step = items.length ? 360 / items.length : 360;
  const hotIndex = Math.max(
    0,
    items.findIndex(item => item.id === hot),
  );
  return (
    <div
      className="dial-cat"
      style={
        {
          "--from": `${hotIndex * step - step / 2}deg`,
          "--span": `${step}deg`,
        } as React.CSSProperties
      }
    >
      <div
        className={`dial-cat__ring${hot ? " is-hot" : ""}`}
        aria-hidden="true"
      />
      <p className="dial-cat__hub">
        {items.find(item => item.id === hot)?.label || "Category"}
      </p>
      <div role="listbox" aria-label="Categories">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="option"
            aria-selected={hot === item.id}
            className="dial-cat__seg"
            style={
              { "--i": index, "--step": `${step}deg` } as React.CSSProperties
            }
            onMouseEnter={() => onHot(item.id)}
            onFocus={() => onHot(item.id)}
            onClick={() => onPick(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PieceCarousel({
  pieces,
  index,
  onIndex,
  onPick,
}: {
  pieces: DialProduct[];
  index: number;
  onIndex: (index: number) => void;
  onPick: () => void;
}) {
  const piece = pieces[index];
  if (!piece) return null;
  const prev = () => onIndex((index - 1 + pieces.length) % pieces.length);
  const next = () => onIndex((index + 1) % pieces.length);
  return (
    <div
      className="dial-piece"
      role="group"
      aria-label="Pieces"
      onKeyDown={event => {
        if (event.key === "ArrowLeft") prev();
        if (event.key === "ArrowRight") next();
      }}
      onTouchStart={event => {
        event.currentTarget.dataset.x = String(event.touches[0].clientX);
      }}
      onTouchEnd={event => {
        const start = Number(event.currentTarget.dataset.x || 0);
        const dx = event.changedTouches[0].clientX - start;
        if (dx > 36) prev();
        if (dx < -36) next();
      }}
    >
      <button
        type="button"
        className="dial-piece__arrow dial-piece__arrow--left"
        aria-label="Previous piece"
        onClick={prev}
      >
        ‹
      </button>
      <button type="button" className="dial-piece__card" onClick={onPick}>
        {piece.images?.[0] ? (
          <img src={hiResProductImage(piece.images[0], 900)} alt="" />
        ) : (
          <span>✦</span>
        )}
        <span className="dial-piece__name">
          {displayProductName(piece.name)}
        </span>
        <span className="dial-piece__count">
          {index + 1} / {pieces.length}
        </span>
      </button>
      <button
        type="button"
        className="dial-piece__arrow dial-piece__arrow--right"
        aria-label="Next piece"
        onClick={next}
      >
        ›
      </button>
    </div>
  );
}
