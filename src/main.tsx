import "@fontsource-variable/geist";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { SpeecherWidget } from "./features/speecher/components/SpeecherWidget";
import { isSpeecherWindow } from "./features/speecher/windowConfig";

if (import.meta.env.DEV) {
  void import("./lib/convenioTest").then(({ generateTestConvenios }) => {
    Object.assign(window, { generateTestConvenios });
  });
}

const isWidgetWindow = isSpeecherWindow();
if (isWidgetWindow) document.documentElement.classList.add("window-transparent");

const root = document.getElementById("root");
if (!root) throw new Error("No se encontró el nodo #root.");

createRoot(root).render(
  <StrictMode>
    {isWidgetWindow ? <SpeecherWidget /> : <App />}
  </StrictMode>,
);
