import { Outlet } from "react-router-dom";
import { LiveSky } from "./LiveSky";
import { StoreHeader } from "./StoreHeader";
import { StoreFooter } from "./StoreFooter";
import { StyleAssistant } from "./StyleAssistant";

export function StoreLayout() {
  return (
    <div className="store-shell flex flex-col min-h-screen">
      <LiveSky />
      <StoreHeader />
      <main className="store-main flex-1">
        <Outlet />
      </main>
      <StoreFooter />
      <StyleAssistant />
    </div>
  );
}
