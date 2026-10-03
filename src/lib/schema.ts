import { z } from "zod";

export const CATEGORIES = [
  "App",
  "App Store",
  "Tool",
  "Integration",
  "Guide",
  "Hardware",
  "Theme",
  "Other",
] as const;

export const STATUSES = ["active", "beta", "archived"] as const;

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const httpUrl = z
  .url({ protocol: /^https?$/, message: "Must be a valid http(s) URL" })
  .max(500);

const optionalUrl = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  httpUrl.optional(),
);

const optionalText = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().max(max).optional(),
  );

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export const projectSchema = z
  .object({
    slug: z
      .string()
      .min(2, "At least 2 characters")
      .max(60, "At most 60 characters")
      .regex(SLUG_PATTERN, "Lowercase letters, numbers and dashes only"),
    name: z.string().trim().min(2, "At least 2 characters").max(60, "At most 60 characters"),
    tagline: z.string().trim().min(10, "At least 10 characters").max(120, "At most 120 characters"),
    description: z.string().trim().min(20, "At least 20 characters").max(3000, "At most 3000 characters"),
    category: z.enum(CATEGORIES),
    tags: z
      .array(z.string().trim().toLowerCase().min(1).max(24).regex(SLUG_PATTERN, "Tags: lowercase, dashes"))
      .max(8, "Up to 8 tags")
      .default([]),
    url: httpUrl,
    repo: optionalUrl,
    docs: optionalUrl,
    icon: optionalUrl,
    screenshots: z.array(httpUrl).max(6, "Up to 6 screenshots").optional(),
    author: z.object({
      name: z.string().trim().min(1, "Required").max(60, "At most 60 characters"),
      url: optionalUrl,
    }),
    license: optionalText(40),
    zimaosVersion: optionalText(20),
    status: z.enum(STATUSES).default("active"),
    addedAt: isoDate,
    updatedAt: isoDate,
  })
  .strict();

export type Project = z.infer<typeof projectSchema>;
export type ProjectInput = z.input<typeof projectSchema>;

/** Fields a visitor fills in; dates are set by the server. */
export const projectDraftSchema = projectSchema.omit({ addedAt: true, updatedAt: true });
export type ProjectDraft = z.infer<typeof projectDraftSchema>;

export const submissionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("add"),
    project: projectDraftSchema,
    note: optionalText(1000),
    contact: optionalText(120),
    website: z.string().max(0).optional(), // honeypot
    turnstileToken: z.string().optional(),
  }),
  z.object({
    type: z.literal("edit"),
    slug: z.string().regex(SLUG_PATTERN),
    project: projectDraftSchema,
    note: optionalText(1000),
    contact: optionalText(120),
    website: z.string().max(0).optional(),
    turnstileToken: z.string().optional(),
  }),
  z.object({
    type: z.literal("remove"),
    slug: z.string().regex(SLUG_PATTERN),
    note: z.string().trim().min(10, "Please explain why (min. 10 characters)").max(1000),
    contact: optionalText(120),
    website: z.string().max(0).optional(),
    turnstileToken: z.string().optional(),
  }),
]);

export type Submission = z.infer<typeof submissionSchema>;

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
