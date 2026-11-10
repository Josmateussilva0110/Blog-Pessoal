import type { Project } from "@blog/shared";
import type { MouseEvent } from "react";
import { useProjectTransition } from "@/features/projects/context/ProjectTransitionProvider";

/** Clique simples abre o projeto com a transição; cliques com modificador seguem o link normal. */
export function useProjectCardLink(project: Project) {
  const { openProject, preloadProjectPage } = useProjectTransition();

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

    event.preventDefault();
    openProject(project);
  }

  // Intenção de abrir (mouse em cima, foco pelo teclado): baixa a página antes do clique
  const prefetchProps = {
    onPointerEnter: preloadProjectPage,
    onFocus: preloadProjectPage,
  };

  return { handleClick, prefetchProps };
}
