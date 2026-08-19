import type { NavigateFunction } from "react-router-dom";

export function projectTransitionName(slug: string) {
  return `project-${slug}`;
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function supportsViewTransitions() {
  return typeof document !== "undefined" && "startViewTransition" in document;
}

export function navigateWithViewTransition(
  navigate: NavigateFunction,
  to: string,
) {
  if (supportsViewTransitions() && !prefersReducedMotion()) {
    document.startViewTransition(() => {
      navigate(to);
    });
    return;
  }

  navigate(to);
}
