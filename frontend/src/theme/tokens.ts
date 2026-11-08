/**
 * Tokens de cor do tema, espelhando o @theme de styles/tailwind.css.
 * No JSX prefira as classes do Tailwind (bg-surface, text-accent…); estes
 * valores são para onde classes não chegam (ex.: atributos SVG dos gráficos).
 * Ao mudar uma cor, atualize os dois lugares.
 */
export const colors = {
  surface: "#080810",
  surfaceRaised: "rgb(34 211 238 / 0.03)",
  surfaceOverlay: "rgb(34 211 238 / 0.06)",
  surfaceInset: "#0b0b14",
  surfaceMuted: "rgb(255 255 255 / 0.05)",

  border: "rgb(34 211 238 / 0.12)",
  borderSubtle: "rgb(34 211 238 / 0.06)",
  hairline: "rgb(255 255 255 / 0.08)",
  hairlineSubtle: "rgb(255 255 255 / 0.06)",
  hairlineStrong: "rgb(255 255 255 / 0.1)",
  hairlineHover: "rgb(255 255 255 / 0.2)",

  accent: "#22d3ee",
  accentMuted: "#06b6d4",
  accentSoft: "rgb(34 211 238 / 0.12)",

  terminal: "#4ade80",
  terminalMuted: "rgb(74 222 128 / 0.7)",
  success: "#10b981",
  successText: "#6ee7b7",
  warning: "#fbbf24",
  warningText: "#fcd34d",
  danger: "#ef4444",
  dangerText: "#fca5a5",

  text: "#f1f5f9",
  textMuted: "#94a3b8",
  textSubtle: "#64748b",
  textInverse: "#0f172a",

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
