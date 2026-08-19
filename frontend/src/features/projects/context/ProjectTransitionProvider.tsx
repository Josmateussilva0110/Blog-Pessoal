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

type SlidePhase = "idle" | "exit" | "enter";

type ProjectTransitionContextValue = {
  openProject: (project: Project, element: HTMLElement) => void;
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
    return document.startViewTransition(updateDom).finished.finally(() => {
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

export function ProjectTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [slideDirection, setSlideDirection] = useState<SlideDirection | null>(null);
  const [slidePhase, setSlidePhase] = useState<SlidePhase>("idle");
  const exitTimerRef = useRef<number | null>(null);

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
    (_project: Project, _element: HTMLElement) => {
      void _element;

      if (prefersReducedMotion()) {
        navigate(`/projects/${_project.slug}`);
        scrollToPageTop("instant");
        return;
      }

      clearExitTimer();
      setBodyTransitionLock(true);
      setSlideDirection("push");
      setSlidePhase("enter");

      void runViewTransition(() => {
        navigate(`/projects/${_project.slug}`);
        scrollToPageTop("instant");
      }, "push").finally(finishTransition);
    },
    [clearExitTimer, finishTransition, navigate],
  );

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
