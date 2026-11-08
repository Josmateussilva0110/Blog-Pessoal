/** Chaves de cache dos projetos: um só lugar para buscas e invalidações acertarem as mesmas chaves */
export const projectKeys = {
  all: ["projects"] as const,
  /** Tudo que só o admin vê: lista, projeto em edição e suas atualizações */
  admin: () => [...projectKeys.all, "admin"] as const,
  adminList: () => [...projectKeys.admin(), "list"] as const,
  adminDetail: (id: string) => [...projectKeys.admin(), "detail", id] as const,
  updates: (projectId: string) => [...projectKeys.admin(), "updates", projectId] as const,
  home: () => [...projectKeys.all, "home"] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  /** fresh separa a cópia revalidada do admin da cópia pública (cache HTTP) */
  detail: (slug: string, fresh = false) =>
    [...projectKeys.details(), slug, fresh ? FRESH_DETAIL : "public"] as const,
};

/** Marca da cópia do detalhe buscada como admin (sai do cache no logout) */
export const FRESH_DETAIL = "fresh";
