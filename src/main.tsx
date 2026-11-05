import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { BackendProvider } from "./lib/backend";
import "./index.css";
import "./tn-lock.css";
import "./tn-landing.css";
import "./tn-landing-atmo.css";
import "./tn-glass.css";

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
