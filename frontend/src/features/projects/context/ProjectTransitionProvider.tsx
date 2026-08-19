import type { Project, ProjectStatus } from "@blog/shared";
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
import { normalizeProjectStatus } from "@/lib/projectStatus";
import {
  prefersReducedMotion,
  projectTransitionName,
  supportsViewTransitions,
} from "@/lib/viewTransition";

const OPEN_DURATION_MS = 560;

type ProjectTransitionContextValue = {
  openProject: (project: Project, element: HTMLElement) => void;
  closeProject: (slug: string, onNavigate: () => void) => void;
};

const ProjectTransitionContext = createContext<ProjectTransitionContextValue | null>(
  null,
);

type OverlayState = {
  project: Project;
  rect: DOMRect;
  phase: "idle" | "open" | "exit";
};

const TERMINAL_STATUS: Record<
  ProjectStatus,
  { label: string; icon: string; className: string }
> = {
  planned: { label: "PLANEJADO", icon: "▲", className: "text-amber-400" },
  wip: { label: "EM ANDAMENTO", icon: "●", className: "text-terminal" },
  completed: { label: "CONCLUÍDO", icon: "✓", className: "text-accent" },
};

function TransitionWindow({ project }: { project: Project }) {
  const status = normalizeProjectStatus(project.status);
  const statusInfo = TERMINAL_STATUS[status];

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-subtle bg-surface-raised shrink-0">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-terminal/80" />
        <span className="font-mono text-[11px] ml-2 truncate">
          <span className="text-terminal">mateus@dev</span>
          <span className="text-text-subtle">:</span>
          <span className="text-accent">~/{project.slug}</span>
        </span>
      </div>
      <div className="p-5 flex flex-col gap-3 overflow-hidden min-h-0 flex-1">
        <p className="font-mono text-xs shrink-0">
          <span className="text-terminal">$ </span>
          <span className="text-accent">open</span>
          <span className="text-text-muted"> ./{project.slug}</span>
        </p>
        <h3 className="text-lg font-semibold text-text shrink-0">{project.title}</h3>
        <p className="text-sm text-text-muted leading-relaxed line-clamp-4">
          {project.description}
        </p>
        <div className="mt-auto pt-2 border-t border-border-subtle shrink-0">
          <span
            className={`font-mono text-[10px] uppercase tracking-wider ${statusInfo.className}`}
          >
            {statusInfo.icon} {statusInfo.label}
          </span>
        </div>
      </div>
    </>
  );
}

function ProjectTransitionOverlay({
  overlay,
}: {
  overlay: OverlayState;
}) {
  const isOpen = overlay.phase === "open";
  const isExit = overlay.phase === "exit";
  const { rect } = overlay;

  const targetStyle = isExit
    ? {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      }
    : {
        top: "1.25rem",
        left: "50%",
        width: "min(calc(100vw - 2rem), 72rem)",
        height: "calc(100dvh - 2.5rem)",
        transform: "translateX(-50%)",
      };

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none" aria-hidden>
      <div
        className="absolute inset-0 mac-backdrop transition-opacity duration-500"
        style={{
          opacity: isOpen && !isExit ? 1 : 0,
          transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      />
      <div
        className="mac-window-shell terminal-card overflow-hidden flex flex-col shadow-2xl shadow-black/50"
        style={{
          position: "fixed",
          borderRadius: "0.75rem",
          transitionProperty: "top, left, width, height, transform, opacity, border-radius",
          transitionDuration: "560ms",
          transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
          top: isOpen || isExit ? targetStyle.top : rect.top,
          left: isOpen || isExit ? targetStyle.left : rect.left,
          width: isOpen || isExit ? targetStyle.width : rect.width,
          height: isOpen || isExit ? targetStyle.height : rect.height,
          transform: isOpen && !isExit ? "translateX(-50%)" : "none",
          opacity: isExit ? 0.85 : 1,
        }}
      >
        <TransitionWindow project={overlay.project} />
      </div>
    </div>
  );
}

export function ProjectTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [overlay, setOverlay] = useState<OverlayState | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const runManualOpen = useCallback(
    (project: Project, element: HTMLElement) => {
      clearTimers();
      const rect = element.getBoundingClientRect();

      setOverlay({ project, rect, phase: "idle" });

      const startId = window.setTimeout(() => {
        setOverlay((current) =>
          current ? { ...current, phase: "open" } : current,
        );
      }, 16);

      const navigateId = window.setTimeout(() => {
        navigate(`/projects/${project.slug}`);
        window.setTimeout(() => setOverlay(null), 120);
      }, OPEN_DURATION_MS);

      timersRef.current.push(startId, navigateId);
    },
    [clearTimers, navigate],
  );

  const openProject = useCallback(
    (project: Project, element: HTMLElement) => {
      if (prefersReducedMotion()) {
        navigate(`/projects/${project.slug}`);
        return;
      }

      if (supportsViewTransitions()) {
        element.style.viewTransitionName = projectTransitionName(project.slug);
        document.startViewTransition(() => {
          navigate(`/projects/${project.slug}`);
        });
        return;
      }

      runManualOpen(project, element);
    },
    [navigate, runManualOpen],
  );

  const closeProject = useCallback(
    (_slug: string, onNavigate: () => void) => {
      if (prefersReducedMotion()) {
        onNavigate();
        return;
      }

      if (supportsViewTransitions()) {
        document.startViewTransition(onNavigate);
        return;
      }

      onNavigate();
    },
    [],
  );

  return (
    <ProjectTransitionContext.Provider value={{ openProject, closeProject }}>
      {children}
      {overlay && <ProjectTransitionOverlay overlay={overlay} />}
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
