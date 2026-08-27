import { Link, useNavigate } from "react-router-dom";
import { SEO } from "../components/SEO";
import { PAGE_SEO } from "../data/seoMeta";
import { useSessionId } from "../hooks/useSessionId";
import { api, useMutation, useQuery } from "../lib/backend";
import { formatPrice, styleKeyFromName } from "../lib/brand";

export function CartPage() {
  const sessionId = useSessionId();
  const cartItems = useQuery(api.cart.getItems, { sessionId }) ?? [];
  const updateQuantity = useMutation(api.cart.updateQuantity);
  const removeItem = useMutation(api.cart.removeItem);
  const navigate = useNavigate();

  const subtotal = cartItems.reduce(
    (sum: number, item: any) => sum + item.product.price * item.quantity,
    0,
  );

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <h2 className="clash text-5xl mb-3">Your cart</h2>
        <p className="serif-quiet text-xl mb-6">
          Made on demand. Ships after we produce it.
        </p>
        <Link to="/shop" className="cta-pist">
          Continue shopping
        </Link>
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
      <section className="grid lg:grid-cols-[1.15fr_.85fr] min-h-[70vh]">
        <div className="px-10 py-8">
          <p className="clash text-6xl">Your cart</p>
          <p className="serif-quiet text-xl mt-3 mb-8">
            Made on demand. Ships after we produce it.
          </p>
          {cartItems.map((item: any) => (
            <div
              key={item._id}
              className="flex gap-5 py-5"
              style={{ borderBottom: "1px solid rgba(247,240,230,0.16)" }}
            >
              <div className="w-28 h-36 overflow-hidden shrink-0 bg-black">
                {item.product.images?.[0] ? (
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    ✦
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/product/${item.productId}`}
                  className="clash text-3xl"
                >
                  {styleKeyFromName(item.product.name)}
                </Link>
                <p className="serif-quiet">
                  {item.product.name}
                  {item.color ? ` · ${item.color}` : ""} · Size: {item.size}
                </p>
                <p className="mt-2 font-bold">
                  {formatPrice(item.product.price)}
                </p>
                <div className="flex items-center gap-2.5 mt-3.5">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity({
                        itemId: item._id,
                        quantity: item.quantity - 1,
                      })
                    }
                  >
                    <b className="w-9 h-9 border-2 border-[var(--cream)] inline-flex items-center justify-center font-extrabold">
                      −
                    </b>
                  </button>
                  <span className="w-7 text-center font-extrabold">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity({
                        itemId: item._id,
                        quantity: item.quantity + 1,
                      })
                    }
                  >
                    <b className="w-9 h-9 border-2 border-[var(--cream)] inline-flex items-center justify-center font-extrabold">
                      +
                    </b>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem({ itemId: item._id })}
                  className="mt-3 text-[11px] tracking-[0.2em] uppercase font-bold"
                  style={{ color: "var(--blush)" }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <aside
          className="px-8 py-10"
          style={{ background: "var(--cream)", color: "#0B0B0C" }}
        >
          <p className="clash text-4xl">Bag</p>
          <div className="mt-8">
            <div
              className="flex justify-between py-3"
              style={{ borderBottom: "1px solid #ddd" }}
            >
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div
              className="flex justify-between py-3"
              style={{ borderBottom: "1px solid #ddd" }}
            >
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between py-3 items-center">
              <span className="font-bold">Total</span>
              <span className="clash text-3xl">{formatPrice(subtotal)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/checkout")}
            className="cta-pist-block mt-6"
          >
            Checkout
          </button>
          <p className="serif-quiet mt-4">
            Secure checkout. Easy returns. Free shipping.
          </p>
          <Link to="/shop" className="serif-quiet mt-6 inline-block">
            Continue shopping
          </Link>
        </aside>
      </section>
    </>
  );
}
