import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProjectTransition } from "@/features/projects/context/ProjectTransitionProvider";
import {
  scrollToProjectsSectionWhenReady,
  type HomeLocationState,
} from "@/lib/viewTransition";

/** Tempo em que a seção fica "presa" enquanto o conteúdo acima termina de carregar */
const ANCHOR_MS = 2000;
const USER_SCROLL_EVENTS = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

/**
 * Mantém a seção de projetos no topo enquanto o que está acima dela muda de
 * altura (gráficos, imagens). A âncora de scroll nativa não ajuda aqui porque
 * os painéis animados mudam de transform a cada frame.
 */
function anchorProjectsSection() {
  const scroll = () => scrollToProjectsSectionWhenReady("instant");
  const observer = new ResizeObserver(scroll);
  let timeout = 0;

  const stop = () => {
    observer.disconnect();
    window.clearTimeout(timeout);
    for (const type of USER_SCROLL_EVENTS) window.removeEventListener(type, stop);
  };

  scroll();
  observer.observe(document.body);
  timeout = window.setTimeout(stop, ANCHOR_MS);
  for (const type of USER_SCROLL_EVENTS) {
    window.addEventListener(type, stop, { passive: true });
  }

  return stop;
}

export function useRestoreProjectsScroll() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isTransitioning } = useProjectTransition();
  const state = location.state as HomeLocationState | null;
  const returningToProjects = state?.scrollTo === "projetos";
  const stopAnchorRef = useRef<(() => void) | null>(null);

  // Não depende do estado da rota: segue ancorando mesmo depois de limpá-lo
  useEffect(() => {
    if (!returningToProjects) return;
    stopAnchorRef.current?.();
    stopAnchorRef.current = anchorProjectsSection();
  }, [location.pathname, returningToProjects]);

  useEffect(() => () => stopAnchorRef.current?.(), []);

  // Terminada a transição de volta, limpa o estado para as animações voltarem a rodar
  useEffect(() => {
    if (!returningToProjects || isTransitioning) return;

    navigate(
      { pathname: location.pathname, search: location.search, hash: location.hash },
      { replace: true, state: null, preventScrollReset: true },
    );
  }, [returningToProjects, isTransitioning, location, navigate]);
}
