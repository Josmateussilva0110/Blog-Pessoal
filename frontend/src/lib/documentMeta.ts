import { SITE } from "@/config/constants";
import { isAdminRoute } from "@/lib/isAdminRoute";

export const PUBLIC_FAVICON = "/favicon.svg";
export const ADMIN_FAVICON = "/admin-favicon.svg";

let titleOverride: string | null = null;

function getAdminPageTitle(pathname: string): string {
  if (pathname === "/admin/login") return "login";
  if (pathname === "/admin/new-password") return "new password";
  if (pathname === "/admin") return "dashboard";
  if (pathname === "/admin/projects") return "projects";
  if (pathname === "/admin/projects/new") return "new project";
  if (/^\/admin\/projects\/[^/]+\/edit$/.test(pathname)) return "edit project";
  if (pathname === "/admin/settings") return "settings";
  if (pathname === "/admin/links") return "links";
  return "admin";
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
      title: `${getAdminPageTitle(pathname)} — admin`,
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
