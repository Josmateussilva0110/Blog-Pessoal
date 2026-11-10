import type { Project } from "@blog/shared";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  applySlideTransitionVars,
  prefersReducedMotion,
  scrollToPageTop,
  scrollToProjectsSectionWhenReady,
  setSlideNavMode,
  SLIDE_TRANSITION_MS,
  supportsViewTransitions,
  type SlideDirection,
} from "@/lib/viewTransition";
import { ROUTES } from "@/config/routes";

type SlidePhase = "idle" | "exit" | "enter";

/** Tempo máximo esperando o código da página antes do slide: em rede lenta, o clique
 * não pode ficar sem resposta (o slide segue e mostra o carregamento) */
const PRELOAD_WAIT_MS = 800;

type ProjectTransitionContextValue = {
  openProject: (project: Project) => void;
  /** Baixa o código da página de projeto antes do clique (hover, foco) */
  preloadProjectPage: () => void;
  closeProject: (project: Project, onNavigate: () => void) => void;
  slideDirection: SlideDirection | null;
  slidePhase: SlidePhase;
  isTransitioning: boolean;
};

const ProjectTransitionContext = createContext<ProjectTransitionContextValue | null>(
  null,
);

function setBodyTransitionLock(locked: boolean) {
  document.body.classList.toggle("project-transition-active", locked);
}

function runViewTransition(updateDom: () => void, mode: SlideDirection | null) {
  setSlideNavMode(mode);

  if (supportsViewTransitions() && !prefersReducedMotion()) {
    const transition = document.startViewTransition(updateDom);
    // O navegador aborta a transição se a aba ficar oculta no meio: a navegação acontece
    // do mesmo jeito, só sem animação, então a rejeição não é erro
    transition.ready.catch(() => undefined);
    return transition.finished.finally(() => {
      setSlideNavMode(null);
    });
  }

  updateDom();
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, SLIDE_TRANSITION_MS);
  }).finally(() => {
    setSlideNavMode(null);
  });
}

type ProjectTransitionProviderProps = {
  children: ReactNode;
  /** Vem do router: a feature não conhece os módulos das páginas */
  preloadProjectPage?: () => Promise<unknown>;
};

export function ProjectTransitionProvider({
  children,
  preloadProjectPage = () => Promise.resolve(),
}: ProjectTransitionProviderProps) {
  const navigate = useNavigate();
  const [slideDirection, setSlideDirection] = useState<SlideDirection | null>(null);
  const [slidePhase, setSlidePhase] = useState<SlidePhase>("idle");
  const exitTimerRef = useRef<number | null>(null);
  // Cliques repetidos enquanto a página baixa não agendam várias navegações
  const openingRef = useRef(false);

  const clearExitTimer = useCallback(() => {
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    applySlideTransitionVars();
    return clearExitTimer;
  }, [clearExitTimer]);

  const finishTransition = useCallback(() => {
    setSlideDirection(null);
    setSlidePhase("idle");
    setBodyTransitionLock(false);
  }, []);

  const openProject = useCallback(
    (project: Project) => {
      if (prefersReducedMotion()) {
        navigate(ROUTES.project(project.slug));
        scrollToPageTop("instant");
        return;
      }

      if (openingRef.current) return;
      openingRef.current = true;

      const startTransition = () => {
        openingRef.current = false;
        clearExitTimer();
        setBodyTransitionLock(true);
        setSlideDirection("push");
        setSlidePhase("enter");

        void runViewTransition(() => {
          navigate(ROUTES.project(project.slug));
          scrollToPageTop("instant");
        }, "push").finally(finishTransition);
      };

      // Com o código da página já baixado, o slide mostra o projeto e não o "Carregando…".
      // Se o download falhar ou demorar, navega mesmo assim (erro ou carregamento da rota)
      const timeout = new Promise((resolve) => window.setTimeout(resolve, PRELOAD_WAIT_MS));
      void Promise.race([preloadProjectPage(), timeout])
        .catch(() => undefined)
        .then(startTransition);
    },
    [clearExitTimer, finishTransition, navigate, preloadProjectPage],
  );

  const handlePreload = useCallback(() => {
    void preloadProjectPage().catch(() => undefined);
  }, [preloadProjectPage]);

  const closeProject = useCallback(
    (_project: Project, onNavigate: () => void) => {
      const scrollAfterClose = () => {
        scrollToProjectsSectionWhenReady("instant");
      };

      if (prefersReducedMotion()) {
        onNavigate();
        scrollAfterClose();
        return;
      }

      clearExitTimer();
      setBodyTransitionLock(true);
      setSlideDirection("pop");
      setSlidePhase("exit");

      if (supportsViewTransitions() && !prefersReducedMotion()) {
        void runViewTransition(() => {
          onNavigate();
          setSlidePhase("enter");
        }, "pop")
          .finally(() => {
            finishTransition();
            scrollAfterClose();
          });
        return;
      }

      exitTimerRef.current = window.setTimeout(() => {
        onNavigate();
        setSlidePhase("enter");

        window.setTimeout(() => {
          finishTransition();
          scrollAfterClose();
        }, SLIDE_TRANSITION_MS);
      }, SLIDE_TRANSITION_MS);
    },
    [clearExitTimer, finishTransition],
  );

  return (
    <ProjectTransitionContext.Provider
      value={{
        openProject,
        preloadProjectPage: handlePreload,
        closeProject,
        slideDirection,
        slidePhase,
        isTransitioning: slideDirection !== null,
      }}
    >
      {children}
    </ProjectTransitionContext.Provider>
  );
}

export function useProjectTransition() {
  const context = useContext(ProjectTransitionContext);
  if (!context) {
    throw new Error("useProjectTransition must be used within ProjectTransitionProvider");
  }
  return context;
}
