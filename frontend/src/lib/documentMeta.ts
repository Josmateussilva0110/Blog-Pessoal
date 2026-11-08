import { SITE } from "@/config/constants";
import { ROUTES } from "@/config/routes";
import { isAdminRoute } from "@/lib/isAdminRoute";

export const PUBLIC_FAVICON = "/favicon.svg";
export const ADMIN_FAVICON = "/admin-favicon.svg";

/** Metadados que uma página pode definir (detalhe de projeto, atualização) */
export type PageMeta = {
  title: string;
  description?: string;
  /** URL absoluta da imagem do card ao compartilhar */
  image?: string;
};

let pageMetaOverride: PageMeta | null = null;

/** Título de cada página do admin (as rotas fixas; a de edição tem id no meio) */
const ADMIN_PAGE_TITLES: Record<string, string> = {
  [ROUTES.adminLogin]: "Login",
  [ROUTES.adminNewPassword]: "Nova senha",
  [ROUTES.admin]: "Painel",
  [ROUTES.adminProjects]: "Projetos",
  [ROUTES.adminProjectNew]: "Novo projeto",
  [ROUTES.adminSettings]: "Configurações",
  [ROUTES.adminLinks]: "Links",
};

const ADMIN_PROJECT_EDIT_PATTERN = new RegExp(`^${ROUTES.adminProjects}/[^/]+/edit$`);

function getAdminPageTitle(pathname: string): string {
  if (ADMIN_PROJECT_EDIT_PATTERN.test(pathname)) return "Editar projeto";
  return ADMIN_PAGE_TITLES[pathname] ?? "Admin";
}

export function resolveDocumentMeta(pathname: string) {
  const admin = isAdminRoute(pathname);
  const favicon = admin ? ADMIN_FAVICON : PUBLIC_FAVICON;

  if (pageMetaOverride) {
    return {
      favicon,
      admin,
      title: pageMetaOverride.title,
      description: pageMetaOverride.description ?? SITE.description,
      image: pageMetaOverride.image,
    };
  }

  return {
    favicon,
    admin,
    title: admin ? `${getAdminPageTitle(pathname)} — Admin · ${SITE.name}` : SITE.name,
    description: SITE.description,
    image: undefined,
  };
}

/** Cria ou atualiza uma tag <meta>/<link> do head, identificada pelo seletor */
function upsertHeadTag<T extends HTMLElement>(
  selector: string,
  create: () => T,
  update: (element: T) => void,
) {
  const element = document.head.querySelector<T>(selector) ?? document.head.appendChild(create());
  update(element);
}

function setMeta(attribute: "name" | "property", key: string, content: string | undefined) {
  const selector = `meta[${attribute}="${key}"]`;

  if (content === undefined) {
    document.head.querySelector(selector)?.remove();
    return;
  }

  upsertHeadTag(
    selector,
    () => {
      const meta = document.createElement("meta");
      meta.setAttribute(attribute, key);
      return meta;
    },
    (meta) => meta.setAttribute("content", content),
  );
}

/**
 * Título, favicon, description, Open Graph e canonical da rota atual. Como o site é uma
 * SPA, isso vale para o Google (que executa JS); os cards de redes sociais leem só o HTML.
 */
export function applyDocumentMeta(pathname: string) {
  const { title, description, image, favicon, admin } = resolveDocumentMeta(pathname);
  // Canonical sem query string nem hash (ex.: ?utm=, /#projetos)
  const canonicalUrl = `${window.location.origin}${pathname}`;

  document.title = title;

  upsertHeadTag(
    'link[rel="icon"]',
    () => Object.assign(document.createElement("link"), { rel: "icon" }),
    (link: HTMLLinkElement) => {
      link.type = "image/svg+xml";
      link.href = favicon;
    },
  );
  upsertHeadTag(
    'link[rel="canonical"]',
    () => Object.assign(document.createElement("link"), { rel: "canonical" }),
    (link: HTMLLinkElement) => {
      link.href = canonicalUrl;
    },
  );

  setMeta("name", "description", description);
  // Painel não deve aparecer em buscadores
  setMeta("name", "robots", admin ? "noindex, nofollow" : undefined);
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:url", canonicalUrl);
  setMeta("property", "og:image", image);
  setMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
}

export function setPageMetaOverride(meta: PageMeta | null) {
  pageMetaOverride = meta;
  applyDocumentMeta(window.location.pathname);
}
