import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { SiteLinksForm } from "@/features/site-links/components/SiteLinksForm";

export default function LinksPage() {
  return (
    <div className="w-full max-w-4xl">
      <AdminPageHeader
        eyebrow="Site"
        title="Links"
        description="Configure navegação, redes sociais e links das skills exibidos no portfólio."
      />

      <SiteLinksForm />
    </div>
  );
}
