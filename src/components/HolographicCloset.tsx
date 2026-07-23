import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

type StoreProduct = {
  _id: string;
  name: string;
  gender: string;
  images?: string[];
  price?: number;
};

type ClosetSide = "women" | "men";

export function HolographicCloset({
  side,
  products,
  onTryOn,
}: {
  side: ClosetSide;
  products: StoreProduct[];
  onTryOn: (product: StoreProduct) => void;
}) {
  const selected = products.slice(0, 5);
  const accent = side === "women" ? "#ff78bf" : "#67c8ff";

  return (
    <aside className={`holo-closet holo-closet-${side}`} aria-label={`${side}'s holographic closet`}>
      <div className="holo-glass" style={{ "--holo-accent": accent } as React.CSSProperties}>
        <div className="holo-scan" />
        <div className="holo-heading">
          <span>{side === "women" ? "11" : "16"}</span>
          <small>LIVE WARDROBE</small>
        </div>
        <div className="holo-shelves">
          {selected.map((product, index) => (
            <button
              type="button"
              className="folded-product"
              key={product._id}
              onClick={() => onTryOn(product)}
              aria-label={`Open virtual try-on for ${product.name}`}
            >
              <span className="folded-stack">
                <img src={product.images?.[0]} alt="" loading={index > 2 ? "lazy" : "eager"} />
              </span>
              <span className="folded-meta">
                <b>{product.name}</b>
                <em>TOUCH TO TRY ON</em>
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function VirtualTryOn({
  product,
  onClose,
}: {
  product: StoreProduct;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState("");
  const [scale, setScale] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  const startCamera = async () => {
    setCameraError("");
    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(nextStream);
    } catch {
      setCameraError("Camera access was not available. You can still preview the product on the mirror.");
    }
  };

  useEffect(() => {
    let initialStream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      .then((nextStream) => {
        initialStream = nextStream;
        setStream(nextStream);
      })
      .catch(() => {
        setCameraError("Camera access was not available. You can still preview the product on the mirror.");
      });
    return () => initialStream?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
    return () => stream?.getTracks().forEach((track) => track.stop());
  }, [stream]);

  return (
    <div className="tryon-shell" role="dialog" aria-modal="true" aria-label={`Virtual try-on: ${product.name}`}>
      <div className="tryon-topbar">
        <div>
          <span>XI · XVI / LIVE MIRROR</span>
          <strong>{product.name}</strong>
        </div>
        <button type="button" onClick={onClose} aria-label="Close virtual try-on">×</button>
      </div>

      <div className="tryon-stage">
        {stream ? (
          <video ref={videoRef} autoPlay playsInline muted />
        ) : (
          <div className="tryon-camera-placeholder">
            <span>LIVE MIRROR</span>
            <p>{cameraError || "Requesting camera access…"}</p>
            {cameraError && <button type="button" onClick={startCamera}>TRY CAMERA AGAIN</button>}
          </div>
        )}
        <img
          className="tryon-garment"
          src={product.images?.[0]}
          alt={product.name}
          style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})` }}
        />
        <div className="tryon-reticle" aria-hidden="true" />
      </div>

      <div className="tryon-controls">
        <div className="tryon-nudge">
          <button type="button" onClick={() => setY((v) => v - 12)} aria-label="Move garment up">↑</button>
          <button type="button" onClick={() => setX((v) => v - 12)} aria-label="Move garment left">←</button>
          <button type="button" onClick={() => { setX(0); setY(0); setScale(1); }} aria-label="Reset garment">◆</button>
          <button type="button" onClick={() => setX((v) => v + 12)} aria-label="Move garment right">→</button>
          <button type="button" onClick={() => setY((v) => v + 12)} aria-label="Move garment down">↓</button>
        </div>
        <label>
          SCALE
          <input
            type="range"
            min="0.55"
            max="1.8"
            step="0.05"
            value={scale}
            onChange={(event) => setScale(Number(event.target.value))}
          />
        </label>
        <Link
          to={product._id.startsWith("printful-") ? "/shop" : `/product/${product._id}`}
          className="tryon-product-link"
        >
          VIEW PRODUCT
        </Link>
      </div>
      <p className="tryon-note">Camera-assisted visual preview. Fit and scale are approximate.</p>
    </div>
  );
}
