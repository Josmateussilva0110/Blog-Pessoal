import { createContext, useContext, type ReactNode } from "react";
import { theme, type Theme } from "./tokens";

const ThemeContext = createContext<Theme>(theme);

/** Disponibiliza os tokens do tema para componentes que precisam dos valores em JS */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
