import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateSiteLinksSchema,
  type SiteLink,
  type SiteLinkInput,
  type SiteLinksGrouped,
  type UpdateSiteLinksFormInput,
  type UpdateSiteLinksInput,
} from "@blog/shared";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/toast";
import { LinkListEditor } from "@/features/site-links/components/LinkListEditor";
import {
  useSiteLinks,
  useUpdateSiteLinks,
} from "@/features/site-links/hooks/useSiteLinks";

/** Item do formulário: href sempre string para o input controlado */
type SiteLinkFormItem = Omit<SiteLinkInput, "href"> & { href: string };

function toInput(links: SiteLink[]): SiteLinkFormItem[] {
  return links.map(({ id, label, href, icon, external }) => ({
    id,
    label,
    href: href ?? "",
    icon,
    external,
  }));
}

function toFormValues(data: SiteLinksGrouped): UpdateSiteLinksFormInput {
  return {
    nav: toInput(data.nav),
    social: toInput(data.social),
    // Skill exige ícone: começa como "" para o campo controlado
    skill: toInput(data.skill).map((link) => ({ ...link, icon: link.icon ?? "" })),
  };
}

export function SiteLinksForm() {
  const toast = useToast();
  const { data, isError, isRefetching, refetch } = useSiteLinks();
  const updateSiteLinks = useUpdateSiteLinks();
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateSiteLinksFormInput, unknown, UpdateSiteLinksInput>({
    resolver: zodResolver(updateSiteLinksSchema),
    defaultValues: { nav: [], social: [], skill: [] },
  });

  useEffect(() => {
    if (data) reset(toFormValues(data));
  }, [data, reset]);

  async function onSubmit(values: UpdateSiteLinksInput) {
    try {
      await updateSiteLinks.mutateAsync(values);
      toast.success("Links atualizados com sucesso.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar os links.");
    }
  }

  // Sem os links reais o form não abre: salvar valores vazios apagaria os cadastrados
  if (!data) {
    return isError ? (
      <ErrorState
        message="Não foi possível carregar os links."
        onRetry={() => void refetch()}
        isRetrying={isRefetching}
      />
    ) : (
      <p role="status" className="animate-pulse text-sm text-home-muted">
        Carregando links…
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, () => toast.error("Verifique os campos destacados."))}
      className="space-y-4"
      noValidate
    >
      <LinkListEditor
        name="nav"
        control={control}
        register={register}
        errors={errors.nav}
        title="Navegação"
        description="Links exibidos no cabeçalho do site."
        showExternal
      />

      <LinkListEditor
        name="social"
        control={control}
        register={register}
        errors={errors.social}
        title="Redes sociais"
        description="Links exibidos no rodapé e na seção Sobre."
      />

      <LinkListEditor
        name="skill"
        control={control}
        register={register}
        errors={errors.skill}
        title="Skills"
        description="Tecnologias da home. O link é opcional — sem URL, o ícone não será clicável."
        showIcon
        hrefRequired={false}
      />

      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={updateSiteLinks.isPending}>
          {updateSiteLinks.isPending ? "Salvando..." : "Salvar links"}
        </Button>
      </div>
    </form>
  );
}
