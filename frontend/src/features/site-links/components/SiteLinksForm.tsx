import { useEffect, useState } from "react";
import type { SiteLink, SiteLinkInput } from "@blog/shared";
import { updateSiteLinksSchema } from "@blog/shared";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import { DEFAULT_SITE_LINKS } from "@/config/siteLinks.defaults";
import { LinkListEditor } from "@/features/site-links/components/LinkListEditor";
import {
  useSiteLinks,
  useUpdateSiteLinks,
} from "@/features/site-links/hooks/useSiteLinks";

function toInput(links: SiteLink[]): SiteLinkInput[] {
  return links.map(({ id, label, href, icon, external }) => ({
    id,
    label,
    href,
    icon,
    external,
  }));
}

export function SiteLinksForm() {
  const toast = useToast();
  const { data, isLoading } = useSiteLinks();
  const updateSiteLinks = useUpdateSiteLinks();
  const [navLinks, setNavLinks] = useState<SiteLinkInput[]>([]);
  const [socialLinks, setSocialLinks] = useState<SiteLinkInput[]>([]);
  const [skillLinks, setSkillLinks] = useState<SiteLinkInput[]>([]);

  useEffect(() => {
    const source = data ?? DEFAULT_SITE_LINKS;
    setNavLinks(toInput(source.nav));
    setSocialLinks(toInput(source.social));
    setSkillLinks(toInput(source.skill));
  }, [data]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const payload = {
      nav: navLinks,
      social: socialLinks,
      skill: skillLinks,
    };

    const parsed = updateSiteLinksSchema.safeParse(payload);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      toast.error(firstIssue?.message ?? "Verifique os campos dos links.");
      return;
    }

    try {
      await updateSiteLinks.mutateAsync(parsed.data);
      toast.success("Links atualizados com sucesso.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível salvar os links.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <LinkListEditor
        title="Navegação"
        description="Links exibidos no cabeçalho do site."
        items={navLinks}
        onChange={setNavLinks}
        showExternal
      />

      <LinkListEditor
        title="Redes sociais"
        description="Links exibidos no rodapé e na seção Sobre."
        items={socialLinks}
        onChange={setSocialLinks}
      />

      <LinkListEditor
        title="Skills"
        description="Tecnologias da home. O link é opcional — sem URL, o ícone não será clicável."
        items={skillLinks}
        onChange={setSkillLinks}
        showIcon
        hrefRequired={false}
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          className="font-mono"
          disabled={isLoading || updateSiteLinks.isPending}
        >
          {updateSiteLinks.isPending ? "Salvando..." : "save_links()"}
        </Button>
      </div>
    </form>
  );
}
