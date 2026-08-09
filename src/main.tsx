import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { BackendProvider } from "./lib/backend";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <BackendProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </BackendProvider>
    </HelmetProvider>
  </StrictMode>,
);
