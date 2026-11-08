import { useEffect } from "react";
import { setPageMetaOverride, type PageMeta } from "@/lib/documentMeta";

/** Título, descrição e imagem da página atual; null enquanto os dados carregam */
export function usePageMeta(meta: PageMeta | null) {
  const title = meta?.title;
  const description = meta?.description;
  const image = meta?.image;

  useEffect(() => {
    setPageMetaOverride(title ? { title, description, image } : null);

    return () => {
      setPageMetaOverride(null);
    };
  }, [title, description, image]);
}
