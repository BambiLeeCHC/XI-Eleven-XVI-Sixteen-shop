import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DialRimCarousel } from "../components/DialRimCarousel";
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
import { resolveColorwayArt } from "../lib/colorwayImage";
import {
  type DialGender,
  type DialProduct,
  type DialStep,
  type FamilyRecord,
  type StockMap,
  blackOptionIndex,
  blackProduct,
  colorNames,
  colorwayOptions,
  familiesFor,
  familyBySlug,
  parseGender,
  parseStep,
  productsInFamily,
  readLocalFavorites,
  sizeChoices,
  splitColorId,
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
  const remoteFamilies = useQuery(api.families.list, {}) as
    | FamilyRecord[]
    | undefined;
  const serverFavs = (useQuery(api.favorites.getIds, {}) ?? []) as string[];
  const addToCart = useMutation(api.cart.addItem);
  const toggleFavorite = useMutation(api.favorites.toggle);
  const [localFavs, setLocalFavs] = useState<string[]>(() =>
    readLocalFavorites(),
  );
  const [stock, setStock] = useState<StockMap>(null);
  const [menu, setMenu] = useState(false);
  const [added, setAdded] = useState(false);
  const hold = useRef<number | null>(null);
  const menuLock = useRef(false);

  const gender = parseGender(params.get("g"));
  const family = params.get("f") || "";
  const productId = params.get("p") || "";
  const size = params.get("size") || "";
  const colorParam = params.get("color") || "";
  const step = parseStep(params.get("step"));
  const sheet = params.get("sheet") === "1";

  useEffect(() => {
    if (!params.get("g")) {
      navigate(
        { pathname: "/dial", search: "g=all&step=families" },
        { replace: true },
      );
    }
  }, [params, navigate]);

  useEffect(() => {
    let live = true;
    fetch("/api/printful-sync")
      .then(response => (response.ok ? response.json() : null))
      .then(body => {
        if (!live) return;
        if (body?.ok && body.variants) setStock(body.variants);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);

  const go = (
    next: {
      g?: DialGender;
      f?: string;
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
    const pickedFamily = next.f === undefined ? family : next.f;
    const piece = next.p === undefined ? productId : next.p;
    const picked = next.size === undefined ? size : next.size;
    const tone = next.color === undefined ? colorParam : next.color;
    const nextStep = next.step ?? step;
    const open = next.sheet === undefined ? sheet : next.sheet;
    if (pickedFamily) query.set("f", pickedFamily);
    if (piece) query.set("p", piece);
    if (picked) query.set("size", picked);
    if (tone) query.set("color", tone);
    query.set("step", nextStep);
    if (open) query.set("sheet", "1");
    navigate({ pathname: "/dial", search: query.toString() }, { replace });
  };

  const families = familiesFor(gender, remoteFamilies);
  const familySlides = useMemo(
    () =>
      families.map(item => {
        const members = productsInFamily(
          catalog,
          gender,
          item.slug,
          remoteFamilies,
        );
        const black = blackProduct(members);
        const image = black
          ? resolveColorwayArt({
              images: black.images,
              name: black.name,
              fallback: black.images,
            }).images[0]
          : undefined;
        return {
          id: item.slug,
          label: item.name,
          image: image ? hiResProductImage(image, 900) : undefined,
          available: members.length > 0,
        };
      }),
    [families, catalog, gender, remoteFamilies],
  );
  const familyIndex = Math.max(
    0,
    family ? familySlides.findIndex(item => item.id === family) : 0,
  );
  const colorways = useMemo(
    () => productsInFamily(catalog, gender, family, remoteFamilies),
    [catalog, gender, family, remoteFamilies],
  );
  const colors = useMemo(
    () => colorwayOptions(colorways, stock),
    [colorways, stock],
  );
  const colorIndex = (() => {
    if (productId) {
      const match = colors.findIndex(item => {
        const parsed = splitColorId(item.id);
        if (parsed.productId !== productId) return false;
        if (parsed.color && colorParam) return parsed.color === colorParam;
        return true;
      });
      if (match >= 0) return match;
    }
    return blackOptionIndex(colors.map(item => item.label));
  })();
  const previewColor = colors[colorIndex];
  const previewProductId = previewColor
    ? splitColorId(previewColor.id).productId
    : "";
  const chosen =
    catalog.find(item => item._id === (productId || previewProductId)) ||
    (family ? colorways[0] : undefined);
  const sizes = chosen ? sizeChoices(chosen, stock, colorParam) : [];
  const hasAxis = chosen ? colorNames(chosen).length > 1 : false;
  const chosenSize = sizes.find(item => item.id === size || item.label === size);
  const colorFocus = colors.find(item => {
    const parsed = splitColorId(item.id);
    return parsed.productId === productId && (!parsed.color || parsed.color === colorParam);
  });
  const familyName =
    family === "all" ? "All" : familyBySlug(family, remoteFamilies)?.name || family;

  const previewFor = (id: string) => {
    const parsed = splitColorId(id);
    const product = catalog.find(item => item._id === parsed.productId);
    if (!product) return undefined;
    return resolveColorwayArt({
      images: product.images,
      name: product.name,
      fallback: product.images,
    }).images[0];
  };

  const backOne = () => {
    if (sheet) {
      go({ sheet: false });
      return;
    }
    if (step === "size") {
      go({ step: "color", size: "", sheet: false });
      return;
    }
    if (step === "color") {
      go({ step: "families", p: "", color: "", size: "", sheet: false });
      return;
    }
    if (family) go({ f: "", p: "", color: "", size: "", step: "families" });
  };

  const crumbs: Crumb[] = [
    {
      id: "gender",
      label: `Gender: ${gender === "all" ? "All" : gender === "women" ? "Women" : "Men"}`,
      apply: () =>
        go({
          f: "",
          p: "",
          color: "",
          size: "",
          step: "families",
          sheet: false,
        }),
    },
  ];
  if (family) {
    crumbs.push({
      id: "family",
      label: `Family: ${familyName}`,
      apply: () =>
        go({
          p: "",
          color: "",
          size: "",
          step: "families",
          sheet: false,
        }),
    });
  }
  if (chosen && (step === "size" || sheet) && colorFocus) {
    crumbs.push({
      id: "color",
      label: `Color: ${colorFocus.label}`,
      apply: () => go({ size: "", step: "color", sheet: false }),
    });
  }
  if (chosenSize && (step === "size" || sheet)) {
    crumbs.push({
      id: "size",
      label: `Size: ${chosenSize.label}`,
      apply: () => go({ step: "size", sheet: false }),
    });
  }

  const favIds = isAuthenticated ? serverFavs : localFavs;
  const favored = chosen ? favIds.includes(chosen._id) : false;

  const heart = async () => {
    if (!chosen) return;
    if (isAuthenticated) {
      await toggleFavorite({ productId: chosen._id });
      return;
    }
    const next = favored
      ? localFavs.filter(id => id !== chosen._id)
      : [...localFavs, chosen._id];
    setLocalFavs(next);
    writeLocalFavorites(next);
  };

  const buy = async () => {
    if (!chosen || !chosenSize?.available) return;
    await addToCart({
      sessionId,
      productId: chosen._id,
      size: chosenSize.id,
      color: hasAxis ? colorParam : undefined,
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
        description="Choose a gender, a family, a color, then a size. The XIXVI dial."
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
                  f: "",
                  p: "",
                  color: "",
                  size: "",
                  step: "families",
                  sheet: false,
                })
              }
            >
              {label}
            </button>
          ))}
        </div>

        <div className="dial-orbit" key={`${gender}-${family}-${step}-${productId}`}>
          {step === "families" && familySlides.length > 0 ? (
            <DialRimCarousel
              slides={familySlides}
              index={familyIndex}
              label="Product families"
              onIndex={next =>
                go(
                  {
                    f: familySlides[next]?.id || "",
                    p: "",
                    color: "",
                    size: "",
                    step: "families",
                    sheet: false,
                  },
                  true,
                )
              }
              onConfirm={slide =>
                go({
                  f: slide.id,
                  p: "",
                  color: "",
                  size: "",
                  step: "color",
                  sheet: false,
                })
              }
            />
          ) : null}

          {step === "color" && colors.length === 0 ? (
            <p className="dial-piece__count">Nothing in this family yet.</p>
          ) : null}

          {step === "color" && colors.length > 0 ? (
            <DialRimCarousel
              slides={colors.map(item => {
                const image = previewFor(item.id);
                return {
                  id: item.id,
                  label: item.label,
                  image: image ? hiResProductImage(image, 900) : undefined,
                  tint: item.hex,
                  available: item.available,
                };
              })}
              index={colorIndex}
              label="Colors"
              onIndex={next => {
                const item = colors[next];
                if (!item) return;
                const parsed = splitColorId(item.id);
                const product = catalog.find(
                  entry => entry._id === parsed.productId,
                );
                go(
                  {
                    p: parsed.productId,
                    color:
                      parsed.color ||
                      colorFromName(product?.name || "") ||
                      item.label,
                    size: "",
                    step: "color",
                    sheet: false,
                  },
                  true,
                );
              }}
              onConfirm={slide => {
                const parsed = splitColorId(slide.id);
                const product = catalog.find(
                  entry => entry._id === parsed.productId,
                );
                go({
                  p: parsed.productId,
                  color:
                    parsed.color ||
                    colorFromName(product?.name || "") ||
                    slide.label,
                  size: "",
                  step: "size",
                  sheet: false,
                });
              }}
            />
          ) : null}

          {step === "size" && chosen ? (
            <div className="dial-variant">
              <RadialVariantDial
                sizes={sizes}
                colors={[]}
                sizeId={chosenSize?.id || ""}
                colorId=""
                focus="size"
                selectOnTap
                onSize={() => undefined}
                onColor={() => undefined}
                onCommitSize={id => {
                  const option = sizes.find(item => item.id === id);
                  if (!option?.available) return;
                  go({ size: id, step: "size", sheet: true });
                }}
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

      {sheet && chosen ? (
        <div
          className="dial-sheet"
          role="dialog"
          aria-modal="true"
          aria-label={displayProductName(chosen.name)}
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
              {chosen.images?.[0] ? (
                <img
                  src={hiResProductImage(chosen.images[0], 1200)}
                  alt={displayProductName(chosen.name)}
                />
              ) : (
                <span>✦</span>
              )}
            </div>
            <div className="dial-sheet__copy">
              <p className="dial-sheet__kicker">
                {styleKeyFromName(chosen.name)}
              </p>
              <h2>{displayProductName(chosen.name)}</h2>
              <p className="dial-sheet__price">{formatPrice(chosen.price)}</p>
              <p className="dial-sheet__meta">
                {chosenSize?.label || "Size"}
                {chosenSize && !chosenSize.available ? " · Sold out" : ""} ·{" "}
                {colorFocus?.label || colorFromName(chosen.name) || "Color"}
              </p>
              <p className="dial-sheet__desc">
                {chosen.description?.trim() ||
                  "Cut and finished when you order it."}
              </p>
              <div className="dial-sheet__actions">
                <button
                  type="button"
                  className="cta-pist"
                  onClick={buy}
                  disabled={!chosenSize?.available}
                >
                  {!chosenSize?.available
                    ? "Sold out"
                    : added
                      ? "Added to cart"
                      : "Add to cart"}
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
