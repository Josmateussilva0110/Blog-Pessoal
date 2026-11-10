import { useMemo } from "react";
import { createTechResolver, type TechResolver } from "@/lib/skillicons";
import { usePublicSiteLinks } from "./useSiteLinks";

/**
 * Resolve nome e ícone de uma tecnologia usando também as skills cadastradas no admin.
 * Mesma query dos links do cabeçalho e rodapé: no site público o dado já está em cache.
 * Enquanto carrega (ou se falhar), só o KNOWN_TECH é usado.
 */
export function useTechMeta(): TechResolver {
  const { data } = usePublicSiteLinks();
  const skills = data?.skill;
  return useMemo(() => createTechResolver(skills), [skills]);
}
