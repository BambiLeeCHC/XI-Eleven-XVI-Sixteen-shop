import { Link } from "react-router-dom";
import { SHOWROOM_CATALOG } from "../data/showroomCatalog";

type ClosetSide = "women" | "men";

const MIRROR_PRODUCTS = {
  women: [
    ["D-Slip Dress [Black]", "https://files.cdn.printful.com/files/643/643fe98a15860efe432874d55096fcb4_preview.png"],
    ["B-Lift Sports Bra [Ivory]", "https://files.cdn.printful.com/files/336/336ad99d58f0773b9d808759e5bbfba3_preview.png"],
    ["L-Flow Yoga Leggings [Onyx]", "https://files.cdn.printful.com/files/c15/c15470469965f47041126eee252e1b51_preview.png"],
  ],
  men: [
    ["J-Glitch Jersey [Black]", "https://files.cdn.printful.com/files/d3e/d3eafe96e16d5a3d6770d74ce93c7033_preview.png"],
    ["S-Glitch 6.3” Shorts [Black]", "https://files.cdn.printful.com/files/3ba/3bab909a91cf850af641465b79f6377f_preview.png"],
    ["T-Icon Oversized Tee", "https://files.cdn.printful.com/files/229/229bc6690aeddc92647f2fb6bb83e122_preview.png"],
  ],
} as const;

export function HolographicCloset({
  side,
  onActivate,
}: {
  side: ClosetSide;
  onActivate: () => void;
}) {
  const products = SHOWROOM_CATALOG.filter((product) => product.gender === side);
  const hangingCount = side === "women" ? 5 : 6;

  return (
    <aside className={`holo-closet holo-closet-${side}`} aria-label={`${side}'s holographic closet`}>
      <button type="button" className="holo-hotspot" onClick={onActivate}>
        <span className="closet-merchandise" aria-label={`${products.length} exact Printful products`}>
          <span className="closet-hanging-rail">
            {products.slice(0, hangingCount).map((product) => (
              <span className="closet-hanging-product" key={product.printfulId}>
                <span className="closet-hanger" />
                <img src={product.src} alt={product.name} title={product.name} />
              </span>
            ))}
          </span>
          <span className="closet-folded-shelves">
            {products.slice(hangingCount).map((product) => (
              <span className="closet-folded-product" key={product.printfulId}>
                <img src={product.src} alt={product.name} title={product.name} />
              </span>
            ))}
          </span>
        </span>
        <span className="holo-corner holo-corner-one" />
        <span className="holo-corner holo-corner-two" />
        <span className="holo-screen-scan" />
        <span className="holo-interaction-label">
          <b>{side === "women" ? "11" : "16"} / LIVE WARDROBE</b>
          <small>TOUCH TO ACTIVATE MIRROR</small>
        </span>
      </button>
    </aside>
  );
}

export function VirtualTryOn({
  side,
  onClose,
}: {
  side: ClosetSide;
  onClose: () => void;
}) {
  const accent = side === "women" ? "#ff84c8" : "#78d4ff";
  const mannequin = side === "women" ? "/mannequin-women-v37.png" : "/mannequin-men-v31.png";

  return (
    <div
      className="tryon-shell"
      role="dialog"
      aria-modal="true"
      aria-label={`${side}'s live mirror visual preview`}
      style={{ "--mirror-accent": accent } as React.CSSProperties}
    >
      <div className="tryon-topbar">
        <div>
          <span>XI · XVI / HOLOGRAPHIC SCREEN</span>
          <strong>LIVE MIRROR — {side.toUpperCase()}</strong>
        </div>
        <button type="button" onClick={onClose} aria-label="Close live mirror">×</button>
      </div>

      <div className="mirror-stage">
        <div className="mirror-grid" />
        <div className="mirror-rings" />
        <img className="mirror-mannequin" src={mannequin} alt={`${side}'s XI XVI mannequin preview`} />
        <div className="mirror-readout mirror-readout-left">
          <span>GARMENT MAP</span>
          <b>ACTIVE</b>
        </div>
        <div className="mirror-readout mirror-readout-right">
          <span>VISUAL SESSION</span>
          <b>01 / 16</b>
        </div>
      </div>

      <div className="mirror-product-rail">
        {MIRROR_PRODUCTS[side].map(([name, image]) => (
          <div className="mirror-product" key={name}>
            <img src={image} alt="" />
            <span>{name}</span>
          </div>
        ))}
        <Link to={`/shop?gender=${side}`} className="tryon-product-link">
          EXPLORE COLLECTION
        </Link>
      </div>
      <p className="tryon-note">Concept visualization of the in-store holographic mirror experience.</p>
    </div>
  );
}
