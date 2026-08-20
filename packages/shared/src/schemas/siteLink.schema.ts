import { z } from "zod";

export const siteLinkCategorySchema = z.enum(["nav", "social", "skill"]);

export const siteLinkSchema = z.object({
  id: z.string().uuid(),
  category: siteLinkCategorySchema,
  label: z.string().min(1),
  href: z.string().optional(),
  icon: z.string().optional(),
  external: z.boolean().default(false),
  sortOrder: z.number().int().min(0),
});

export type SiteLinkCategory = z.infer<typeof siteLinkCategorySchema>;
export type SiteLink = z.infer<typeof siteLinkSchema>;

const linkHrefSchema = z.string().trim().min(1, "URL obrigatória.");

const optionalHrefSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value));

export const siteLinkInputSchema = z.object({
  id: z.string().uuid().optional(),
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

export const siteLinksGroupedSchema = z.object({
  nav: z.array(siteLinkSchema),
  social: z.array(siteLinkSchema),
  skill: z.array(siteLinkSchema),
});

export type SiteLinksGrouped = z.infer<typeof siteLinksGroupedSchema>;
