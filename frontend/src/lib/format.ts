export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: string, locale = "pt-BR") {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/** Converte ISO para valor de `<input type="date">` (YYYY-MM-DD). */
export function toDateInputValue(isoDate?: string): string {
  const date = isoDate ? new Date(isoDate) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Converte YYYY-MM-DD do input para ISO (meio-dia local, evita shift de fuso). */
export function dateInputToIso(dateValue: string): string {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0).toISOString();
}
