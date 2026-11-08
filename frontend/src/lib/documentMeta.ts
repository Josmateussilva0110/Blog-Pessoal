import { SITE } from "@/config/constants";
import { isAdminRoute } from "@/lib/isAdminRoute";

export const PUBLIC_FAVICON = "/favicon.svg";
export const ADMIN_FAVICON = "/admin-favicon.svg";

let titleOverride: string | null = null;

function getAdminPageTitle(pathname: string): string {
  if (pathname === "/admin/login") return "Login";
  if (pathname === "/admin/new-password") return "Nova senha";
  if (pathname === "/admin") return "Painel";
  if (pathname === "/admin/projects") return "Projetos";
  if (pathname === "/admin/projects/new") return "Novo projeto";
  if (/^\/admin\/projects\/[^/]+\/edit$/.test(pathname)) return "Editar projeto";
  if (pathname === "/admin/settings") return "Configurações";
  if (pathname === "/admin/links") return "Links";
  return "Admin";
}

export function resolveDocumentMeta(pathname: string) {
  const admin = isAdminRoute(pathname);

  if (titleOverride) {
    return {
      title: titleOverride,
      favicon: admin ? ADMIN_FAVICON : PUBLIC_FAVICON,
    };
  }

  if (admin) {
    return {
      title: `${getAdminPageTitle(pathname)} — Admin · ${SITE.name}`,
      favicon: ADMIN_FAVICON,
    };
  }

  return {
    title: SITE.name,
    favicon: PUBLIC_FAVICON,
  };
}

export function applyDocumentMeta(pathname: string) {
  const { title, favicon } = resolveDocumentMeta(pathname);

  document.title = title;

  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');

  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }

  link.type = "image/svg+xml";
  link.href = favicon;
}

export function setDocumentTitleOverride(title: string | null) {
  titleOverride = title;
  applyDocumentMeta(window.location.pathname);
}
