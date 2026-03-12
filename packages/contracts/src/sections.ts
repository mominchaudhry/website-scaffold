import { z } from "zod";

const actionLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  target: z.enum(["_self", "_blank"]).optional(),
});

const sectionBaseSchema = z.object({
  id: z.number(),
  __component: z.string(),
  showInHeader: z.boolean().optional().nullable(),
  navLabel: z.string().optional().nullable(),
  anchorId: z.string().optional().nullable(),
  alignment: z.enum(["left", "center", "right"]).optional().nullable(),
  maxWidth: z.enum(["sm", "md", "lg", "full"]).optional().nullable(),
  spacing: z.enum(["compact", "normal", "large"]).optional().nullable(),
});

export const heroSectionSchema = sectionBaseSchema.extend({
  __component: z.literal("sections.hero"),
  eyebrow: z.string().optional().nullable(),
  heading: z.string().min(1),
  body: z.string().optional().nullable(),
  primaryAction: actionLinkSchema.optional().nullable(),
  secondaryAction: actionLinkSchema.optional().nullable(),
});

export const featureGridSectionSchema = sectionBaseSchema.extend({
  __component: z.literal("sections.feature-grid"),
  heading: z.string().min(1),
  body: z.string().optional().nullable(),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]),
  items: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().optional().nullable(),
      icon: z.string().optional().nullable(),
    })
  ),
});

export const richTextSectionSchema = sectionBaseSchema.extend({
  __component: z.literal("sections.rich-text"),
  heading: z.string().optional().nullable(),
  content: z.string().min(1),
});

export const ctaSectionSchema = sectionBaseSchema.extend({
  __component: z.literal("sections.cta"),
  heading: z.string().min(1),
  body: z.string().optional().nullable(),
  action: actionLinkSchema,
});

export const faqSectionSchema = sectionBaseSchema.extend({
  __component: z.literal("sections.faq"),
  heading: z.string().min(1),
  items: z.array(
    z.object({
      question: z.string().min(1),
      answer: z.string().min(1),
    })
  ),
});

export const gallerySectionSchema = sectionBaseSchema.extend({
  __component: z.literal("sections.gallery"),
  heading: z.string().optional().nullable(),
  images: z.array(
    z.object({
      id: z.number(),
      url: z.string().min(1),
      alternativeText: z.string().optional().nullable(),
    })
  ),
});

export const sectionSchema = z.discriminatedUnion("__component", [
  heroSectionSchema,
  featureGridSectionSchema,
  richTextSectionSchema,
  ctaSectionSchema,
  faqSectionSchema,
  gallerySectionSchema,
]);

export type SectionInput = z.infer<typeof sectionSchema>;
