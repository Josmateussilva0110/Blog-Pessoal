import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  scrollToProjectsSectionWhenReady,
  type HomeLocationState,
} from "@/lib/viewTransition";

export function useRestoreProjectsScroll() {
  const location = useLocation();

  useEffect(() => {
    const state = location.state as HomeLocationState | null;
    if (state?.scrollTo !== "projetos") return;

    scrollToProjectsSectionWhenReady("instant");
  }, [location.pathname, location.state]);
}
