import { z } from "zod";
import { SAFE_HREF_PATTERN } from "../constants/link.constants";

export const siteLinkCategorySchema = z.enum(["nav", "social", "skill"]);

export const siteLinkSchema = z.object({
  id: z.uuid(),
  category: siteLinkCategorySchema,
  label: z.string().min(1),
  href: z.string().optional(),
  icon: z.string().optional(),
  external: z.boolean().default(false),
  sortOrder: z.number().int().min(0),
});

export type SiteLinkCategory = z.infer<typeof siteLinkCategorySchema>;
export type SiteLink = z.infer<typeof siteLinkSchema>;

// Outros esquemas (javascript:, data:) virariam XSS ou rastreamento no href do rodapé e do contato
const SAFE_HREF_MESSAGE = "Use um caminho do site (/...), um endereço http(s) ou mailto.";

const linkHrefSchema = z
  .string()
  .trim()
  .min(1, "URL obrigatória.")
  .regex(SAFE_HREF_PATTERN, SAFE_HREF_MESSAGE);

const optionalHrefSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value))
  .refine((value) => value === undefined || SAFE_HREF_PATTERN.test(value), SAFE_HREF_MESSAGE);

export const siteLinkInputSchema = z.object({
  id: z.uuid().optional(),
  label: z.string().trim().min(1, "Rótulo obrigatório."),
  href: optionalHrefSchema,
  icon: z.string().trim().optional(),
  external: z.boolean().default(false),
});

export const navLinkInputSchema = siteLinkInputSchema.extend({
  href: linkHrefSchema,
});

export const socialLinkInputSchema = siteLinkInputSchema.extend({
  href: linkHrefSchema,
});

export const skillLinkInputSchema = siteLinkInputSchema.extend({
  icon: z.string().trim().min(1, "Ícone obrigatório."),
});

export const updateSiteLinksSchema = z.object({
  nav: z.array(navLinkInputSchema),
  social: z.array(socialLinkInputSchema),
  skill: z.array(skillLinkInputSchema),
});

export type SiteLinkInput = z.infer<typeof siteLinkInputSchema>;
export type UpdateSiteLinksInput = z.infer<typeof updateSiteLinksSchema>;
/** Valores do formulário antes das transformações (href vazio ainda é "") */
export type UpdateSiteLinksFormInput = z.input<typeof updateSiteLinksSchema>;

export const siteLinksGroupedSchema = z.object({
  nav: z.array(siteLinkSchema),
  social: z.array(siteLinkSchema),
  skill: z.array(siteLinkSchema),
});

export type SiteLinksGrouped = z.infer<typeof siteLinksGroupedSchema>;
