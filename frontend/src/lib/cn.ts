/** Junta classes condicionais (sem tailwind-merge: quem vence é a ordem do CSS gerado) */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
