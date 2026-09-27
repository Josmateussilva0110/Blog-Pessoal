import type { Project } from "@blog/shared";
import { useRef, type MouseEvent } from "react";
import { useProjectTransition } from "@/features/projects/context/ProjectTransitionProvider";

/** Clique simples abre o projeto com a transição; cliques com modificador seguem o link normal. */
export function useProjectCardLink(project: Project) {
  const { openProject } = useProjectTransition();
  const cardRef = useRef<HTMLElement>(null);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    if (!cardRef.current) return;

    event.preventDefault();
    openProject(project, cardRef.current);
  }

  return { cardRef, handleClick };
}
