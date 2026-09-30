import type { NavigateFunction } from "react-router-dom";
import { SECTION_IDS } from "@/config/routes";

export function projectTransitionName(slug: string) {
  return `project-${slug}`;
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function supportsViewTransitions() {
  return typeof document !== "undefined" && "startViewTransition" in document;
}

export function scrollToProjectsSection(behavior: ScrollBehavior = "smooth") {
  document.getElementById(SECTION_IDS.projects)?.scrollIntoView({ behavior, block: "start" });
}

export function scrollToProjectsSectionWhenReady(
  behavior: ScrollBehavior = "instant",
  maxAttempts = 20,
) {
  let attempts = 0;

  const tryScroll = () => {
    const section = document.getElementById(SECTION_IDS.projects);
    if (section) {
      section.scrollIntoView({ behavior, block: "start" });
      return;
    }

    if (attempts < maxAttempts) {
      attempts += 1;
      requestAnimationFrame(tryScroll);
    }
  };

  tryScroll();
}

export type HomeLocationState = {
  scrollTo?: typeof SECTION_IDS.projects;
};

export function scrollToPageTop(behavior: ScrollBehavior = "instant") {
  window.scrollTo({ top: 0, behavior });
}

export type SlideDirection = "push" | "pop";

export const SLIDE_TRANSITION_MS = 460;
export const SLIDE_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";

export function applySlideTransitionVars() {
  const root = document.documentElement;
  root.style.setProperty("--slide-duration", `${SLIDE_TRANSITION_MS}ms`);
  root.style.setProperty("--slide-easing", SLIDE_EASING);
}

export function setSlideNavMode(mode: SlideDirection | null) {
  document.documentElement.classList.toggle("ios-nav-pop", mode === "pop");
  document.documentElement.classList.toggle("ios-nav-push", mode === "push");
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
