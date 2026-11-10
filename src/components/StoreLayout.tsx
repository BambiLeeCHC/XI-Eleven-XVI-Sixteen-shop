import { Outlet, useLocation } from "react-router-dom";
import { LiveSky } from "./LiveSky";
import { StoreHeader } from "./StoreHeader";
import { StoreFooter } from "./StoreFooter";
import { StyleAssistant } from "./StyleAssistant";

export function StoreLayout() {
  const { pathname } = useLocation();
  const north = pathname === "/chart" || pathname.startsWith("/chart/");

  return (
    <div className={`store-shell flex flex-col min-h-screen${north ? " is-north" : " is-shop"}`}>
      {north ? <LiveSky /> : <div className="shop-field" aria-hidden="true" />}
      <StoreHeader />
      <main className="store-main flex-1">
        <Outlet />
      </main>
      <StoreFooter />
      <StyleAssistant />
    </div>
  );
}
