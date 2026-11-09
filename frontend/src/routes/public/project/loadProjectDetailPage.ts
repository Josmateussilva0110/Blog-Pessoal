import { lazyWithPreload } from "@/lib/lazyWithPreload";

/**
 * Página de projeto num lugar só: o router a renderiza e o pré-carregamento (hover nos
 * cards, tempo ocioso da home, clique antes do slide) baixa o mesmo módulo uma vez
 */
const projectDetailPage = lazyWithPreload(() =>
  import("./ProjectDetailPage").then((module) => ({ default: module.ProjectDetailPage })),
);

export const ProjectDetailPageLazy = projectDetailPage.Component;
export const loadProjectDetailPage = projectDetailPage.preload;

/** Prazo máximo do requestIdleCallback e espera do fallback sem ele (Safari) */
const IDLE_TIMEOUT_MS = 4000;
const IDLE_FALLBACK_DELAY_MS = 2000;

/** Pré-carrega quando o navegador estiver ocioso, respeitando o modo de economia de dados */
export function prefetchProjectDetailPageWhenIdle() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return () => undefined;

  const load = () => void loadProjectDetailPage();

  // Safari não tem requestIdleCallback
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(load, { timeout: IDLE_TIMEOUT_MS });
    return () => window.cancelIdleCallback(id);
  }

  const id = window.setTimeout(load, IDLE_FALLBACK_DELAY_MS);
  return () => window.clearTimeout(id);
}
