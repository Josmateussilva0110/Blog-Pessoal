import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
// Fontes servidas pelo próprio site (antes vinham do Google Fonts e bloqueavam o primeiro
// paint): versão variável, um arquivo por alfabeto cobre todos os pesos, com font-display: swap
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./styles/tailwind.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
