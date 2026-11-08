import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "summary",
  "[tabindex]",
].join(",");

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    // tabIndex -1 (ex.: fundo clicável do modal) e elementos ocultos ficam de fora do Tab
    (element) => element.tabIndex >= 0 && element.getClientRects().length > 0,
  );
}

/**
 * Diálogo modal: move o foco para dentro ao abrir, prende o Tab nele e devolve o foco
 * a quem abriu ao fechar. O container precisa de tabIndex={-1} para o caso sem focáveis.
 */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  initialFocusRef?: RefObject<HTMLElement | null>,
) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!active || !container) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    (initialFocusRef?.current ?? getFocusableElements(container)[0] ?? container).focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab" || !container) return;

      const focusable = getFocusableElements(container);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) {
        event.preventDefault();
        container.focus();
        return;
      }

      const current = document.activeElement;
      const outside = !container.contains(current);

      if (event.shiftKey && (current === first || outside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || outside)) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [active, initialFocusRef]);

  return containerRef;
}
