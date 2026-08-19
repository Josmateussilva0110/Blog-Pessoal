import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useProjectTransition } from "@/features/projects/context/ProjectTransitionProvider";
import { supportsViewTransitions } from "@/lib/viewTransition";

export function IosNavPage({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { slideDirection, slidePhase } = useProjectTransition();
  const isDetail = location.pathname.startsWith("/projects/");
  const useManualSlide = !supportsViewTransitions();

  let motionClass = "";

  if (useManualSlide) {
    if (slideDirection === "push" && slidePhase === "enter" && isDetail) {
      motionClass = "ios-page-enter-right";
    } else if (slideDirection === "pop" && slidePhase === "exit" && isDetail) {
      motionClass = "ios-page-exit-right";
    } else if (slideDirection === "pop" && slidePhase === "enter" && !isDetail) {
      motionClass = "ios-page-enter-left";
    }
  }

  return (
    <div
      key={location.pathname}
      className={`ios-nav-page bg-surface${motionClass ? ` ${motionClass}` : ""}`}
    >
      {children}
    </div>
  );
}
