import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SEO } from "../components/SEO";
import { PAGE_SEO } from "../data/seoMeta";
import { useSessionId } from "../hooks/useSessionId";
import { api, useMutation, useQuery } from "../lib/backend";
import { colorFromName, formatPrice, styleKeyFromName } from "../lib/brand";
import { cleanSizeLabel, sizeChoices, type StockMap } from "../lib/dialShop";
import { cartLimitHit, type LimitLine } from "../lib/orderLimits";
import { hiResProductImage } from "../lib/productImage";
import "../cart.css";

type CartItem = {
  _id: string;
  productId: string;
  size: string;
  color?: string | null;
  quantity: number;
  product: {
    name: string;
    price: number;
    images?: string[];
    sizes?: string[];
    printfulVariants?: Array<{
      id?: number;
      size?: string;
      color?: string | null;
      is_ignored?: boolean;
      availability_status?: string;
    }>;
  };
};

function toLines(items: CartItem[]): LimitLine[] {
  return items.map(item => ({
    productId: item.productId,
    color: item.color,
    size: item.size,
    quantity: item.quantity,
  }));
}

export function CartPage() {
  const sessionId = useSessionId();
  const cartItems = (useQuery(api.cart.getItems, { sessionId }) ?? []) as CartItem[];
  const updateQuantity = useMutation(api.cart.updateQuantity);
  const setSize = useMutation(api.cart.setSize);
  const removeItem = useMutation(api.cart.removeItem);
  const navigate = useNavigate();
  const [stock, setStock] = useState<StockMap>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    let live = true;
    fetch("/api/printful-sync")
      .then(response => (response.ok ? response.json() : null))
      .then(body => {
        if (live && body?.ok && body.variants) setStock(body.variants);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const bagHit = cartLimitHit(toLines(cartItems));

  const changeQty = async (item: CartItem, quantity: number) => {
    const next = cartItems.map(row =>
      row._id === item._id ? { ...row, quantity } : row,
    );
    const hit = quantity > item.quantity ? cartLimitHit(toLines(next)) : null;
    if (hit) {
      setNote(hit.message);
      return;
    }
    setNote("");
    await updateQuantity({ itemId: item._id, quantity });
  };

  const changeSize = async (item: CartItem, size: string) => {
    const next = cartItems.map(row =>
      row._id === item._id ? { ...row, size } : row,
    );
    const hit = cartLimitHit(toLines(next));
    if (hit) {
      setNote(hit.message);
      return;
    }
    setNote("");
    await setSize({ itemId: item._id, size });
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <div>
          <p className="cart-kicker">Bag</p>
          <h1>Your cart</h1>
          <p className="cart-lede">Made on demand. Ships after we produce it.</p>
          <Link to="/shop" className="cta-pist">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={PAGE_SEO.cart.title}
        description={PAGE_SEO.cart.description}
        url="/cart"
        noindex
      />
      <section className="cart-page">
        <p className="cart-kicker">Bag</p>
        <h1>Your cart</h1>
        <p className="cart-lede">Made on demand. Ships after we produce it.</p>
        <div className="cart-layout">
          <div>
            {cartItems.map(item => {
              const color = item.color || colorFromName(item.product.name);
              const choices = sizeChoices(
                item.product as never,
                stock,
                item.color || "",
              ).filter(
                choice =>
                  choice.available ||
                  cleanSizeLabel(choice.label) === cleanSizeLabel(item.size),
              );
              const plusHit = cartLimitHit(
                toLines(
                  cartItems.map(row =>
                    row._id === item._id
                      ? { ...row, quantity: row.quantity + 1 }
                      : row,
                  ),
                ),
              );
              return (
                <article key={item._id} className="cart-line">
                  {item.product.images?.[0] ? (
                    <img
                      src={hiResProductImage(item.product.images[0], 480)}
                      alt=""
                    />
                  ) : (
                    <div className="cart-line__empty">✦</div>
                  )}
                  <div>
                    <h2>
                      <Link to={`/product/${item.productId}`}>
                        {styleKeyFromName(item.product.name)}
                      </Link>
                    </h2>
                    <p>
                      {color || item.product.name} · {formatPrice(item.product.price)}
                    </p>
                    <div className="cart-line__controls">
                      <label className="sr-only" htmlFor={`size-${item._id}`}>
                        Size
                      </label>
                      <select
                        id={`size-${item._id}`}
                        value={cleanSizeLabel(item.size)}
                        onChange={event => changeSize(item, event.target.value)}
                      >
                        {(choices.length
                          ? choices
                          : [{ id: item.size, label: cleanSizeLabel(item.size), available: true }]
                        ).map(choice => (
                          <option key={choice.id} value={choice.label}>
                            {choice.label}
                          </option>
                        ))}
                      </select>
                      <div className="cart-qty">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => changeQty(item, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          disabled={Boolean(plusHit)}
                          onClick={() => changeQty(item, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="cart-remove"
                        onClick={() => removeItem({ itemId: item._id })}
                      >
                        Remove
                      </button>
                    </div>
                    {plusHit ? <p className="cart-note">{plusHit.message}</p> : null}
                  </div>
                </article>
              );
            })}
            {note && !cartItems.some(item => {
              const plusHit = cartLimitHit(
                toLines(
                  cartItems.map(row =>
                    row._id === item._id
                      ? { ...row, quantity: row.quantity + 1 }
                      : row,
                  ),
                ),
              );
              return plusHit?.message === note;
            }) ? (
              <p className="cart-note">{note}</p>
            ) : null}
          </div>
          <aside className="cart-summary">
            <h2>Summary</h2>
            <div>
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div>
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div>
              <span>Total</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            {bagHit ? <p className="cart-note">{bagHit.message}</p> : null}
            <button
              type="button"
              className="cta-pist-block"
              disabled={Boolean(bagHit)}
              onClick={() => navigate("/checkout")}
            >
              Checkout
            </button>
            <Link to="/shop" className="cart-lede">
              Continue shopping
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}
