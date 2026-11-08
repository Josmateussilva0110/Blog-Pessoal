/**
 * Tokens de cor do tema, espelhando o @theme de styles/tailwind.css.
 * No JSX prefira as classes do Tailwind (bg-surface, text-accent…); estes
 * valores são para onde classes não chegam (ex.: atributos SVG dos gráficos).
 * Ao mudar uma cor, atualize os dois lugares.
 */
export const colors = {
  surface: "#09090b",
  surfaceRaised: "#1e1e23",
  surfaceOverlay: "#2e2e35",
  surfaceInset: "#1e1e23",
  surfaceMuted: "rgb(255 255 255 / 0.05)",

  border: "#2e2e35",
  borderSubtle: "#222227",
  hairline: "rgb(255 255 255 / 0.08)",
  hairlineSubtle: "rgb(255 255 255 / 0.06)",
  hairlineStrong: "rgb(255 255 255 / 0.1)",
  hairlineHover: "rgb(255 255 255 / 0.2)",

  accent: "#4c8dff",
  accentMuted: "#3b7bf0",
  accentSoft: "rgb(76 141 255 / 0.14)",

  terminal: "#4ade80",
  terminalMuted: "rgb(74 222 128 / 0.7)",
  success: "#10b981",
  successText: "#6ee7b7",
  warning: "#fbbf24",
  warningText: "#fcd34d",
  danger: "#ef4444",
  dangerText: "#fca5a5",

  text: "#f2f2f4",
  textMuted: "#9a9da8",
  textSubtle: "#82858f",
  textInverse: "#0b0b0d",

  homeBg: "#09090b",
  homeCard: "#141417",
  homeLine: "#222227",
  homeInset: "#1e1e23",
  homeRaised: "#2e2e35",
  homeInk: "#f2f2f4",
  homeBody: "#c4c6ce",
  homeMuted: "#9a9da8",
  homeDevice: "#0b0b0d",
  brand: "#4c8dff",
} as const;

export type ThemeColors = typeof colors;

export const theme = { colors } as const;

export type Theme = typeof theme;
