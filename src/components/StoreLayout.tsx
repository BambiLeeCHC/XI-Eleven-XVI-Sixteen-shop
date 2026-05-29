import { Outlet } from "react-router-dom";
import { StoreHeader } from "./StoreHeader";
import { StoreFooter } from "./StoreFooter";
import { StyleAssistant } from "./StyleAssistant";

export function StoreLayout() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#0a0a0a" }}>
      <StoreHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <StoreFooter />
      <StyleAssistant />
    </div>
  );
}
