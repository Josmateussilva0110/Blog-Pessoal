/**
 * Endpoints que a home busca ao abrir. Também usados pelo pré-carregamento do index.html
 * (vite.config.ts): o preload só é aproveitado se a URL for exatamente a mesma do fetch.
 * Sem imports aqui, porque o vite.config.ts carrega este arquivo fora do app.
 */
export const API_ENDPOINTS = {
  projectsHome: "/projects/home",
  publicProfileImageMeta: "/public/profile-image/meta",
} as const;
