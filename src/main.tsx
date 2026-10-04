import "@fontsource-variable/geist";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

if (import.meta.env.DEV) {
  void import("./lib/convenioTest").then(({ generateTestConvenios }) => {
    Object.assign(window, { generateTestConvenios });
  });
}

const root = document.getElementById("root");
if (!root) throw new Error("No se encontró el nodo #root.");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
