import type { MouseEvent } from "react";

/** Clique que o navegador trata sozinho (nova aba, janela, download): não interceptar */
export function isModifiedClick(event: MouseEvent) {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}
