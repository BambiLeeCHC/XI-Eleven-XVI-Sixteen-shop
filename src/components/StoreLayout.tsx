import { Outlet, useLocation } from "react-router-dom";
import { useTrueNorthAccess } from "../lib/trueNorthGate";
import { LiveSky } from "./LiveSky";
import { StoreHeader } from "./StoreHeader";
import { StoreFooter } from "./StoreFooter";
import { StyleAssistant } from "./StyleAssistant";

export function StoreLayout() {
  const { pathname } = useLocation();
  const northPath = pathname === "/chart" || pathname.startsWith("/chart/");
  const skyPath = northPath || pathname === "/profile" || pathname.startsWith("/profile/");
  const access = useTrueNorthAccess();
  const north = northPath && access.allowed;
  const dial = pathname === "/" || pathname === "/dial";
  const piece = pathname.startsWith("/product/");
  const plain =
    pathname === "/shop" ||
    pathname === "/cart" ||
    (skyPath && !access.allowed);

  return (
    <div className={`store-shell flex flex-col min-h-screen${north ? " is-north" : " is-shop"}${dial ? " is-dial" : ""}${piece ? " is-pdp" : ""}${plain ? " is-plain" : ""}`}>
      {north ? <LiveSky /> : dial || piece || plain ? null : <div className="shop-field" aria-hidden="true" />}
      <StoreHeader />
      <main className="store-main flex-1">
        <Outlet />
      </main>
      <StoreFooter />
      <StyleAssistant />
    </div>
  );
}
