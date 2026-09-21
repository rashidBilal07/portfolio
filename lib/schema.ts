import { z } from "zod";

/**
 * Every content type is defined once, as a Zod schema, and the TS types are
 * inferred from it. The admin API validates untrusted input against exactly the
 * shape the pages render, so there is no second definition to drift.
 */

const nonEmpty = z.string().trim().min(1);
const url = z.string().trim().url();
/** Site-relative asset path, e.g. "/screenshots/app/1.png". No protocol, no traversal. */
const assetPath = z
  .string()
  .trim()
  .regex(/^\/[A-Za-z0-9._\-/]*$/, "must be a site-relative path like /icons/app.png")
  .refine((v) => !v.includes(".."), "must not contain '..'");

/* -------------------------------------------------------------------------- */
/* Profile                                                                    */
/* -------------------------------------------------------------------------- */

export const statSchema = z.object({
  value: z.number().finite(),
  suffix: z.string().max(8).default(""),
  label: nonEmpty.max(60),
  decimals: z.number().int().min(0).max(3).optional(),
});

export const profileSchema = z.object({
  name: nonEmpty.max(80),
  firstName: nonEmpty.max(40),
  role: nonEmpty.max(80),
  roleShort: nonEmpty.max(40),
  /** Two lines read better than one. Extra entries are rendered, but the accent only applies to the second. */
  headline: z.array(nonEmpty.max(60)).min(1).max(3),
  headlineAccent: nonEmpty.max(40),
  bio: nonEmpty.max(1200),
  location: nonEmpty.max(80),
  locationShort: nonEmpty.max(40),
  email: z.string().trim().email(),
  phone: z.string().trim().max(40),
  /** Optional: not everyone publishes code or owns a Play developer page. */
  github: url.optional(),
  githubHandle: nonEmpty.max(80).optional(),
  linkedin: url,
  linkedinHandle: nonEmpty.max(80),
  playStoreDeveloper: url.optional(),
  resumeUrl: z.string().trim().max(300),
  availability: z.string().trim().max(40),
  avatar: assetPath,
  orbitBadges: z.array(nonEmpty.max(30)).max(8),
  marquee: z.array(nonEmpty.max(40)).max(40),
  stats: z.array(statSchema).max(6),
  terminalLines: z.array(z.string().max(120)).max(8),
});

/* -------------------------------------------------------------------------- */
/* Projects                                                                   */
/* -------------------------------------------------------------------------- */

export const projectStatuses = [
  "LIVE ON PLAY",
  "IN PRODUCTION",
  "IN DEVELOPMENT",
  "SUNSET",
  "CLIENT WORK",
] as const;

export const projectMetricSchema = z.object({
  label: nonEmpty.max(24),
  value: nonEmpty.max(16),
});

export const caseStudyBlockSchema = z.object({
  heading: nonEmpty.max(80),
  body: nonEmpty.max(3000),
  points: z.array(nonEmpty.max(600)).max(12).optional(),
});

export const projectSchema = z.object({
  /** URL segment. Lowercase, hyphens only — this lands in a route path. */
  slug: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "lowercase letters, numbers and single hyphens only"),
  name: nonEmpty.max(80),
  summary: nonEmpty.max(600),
  punchline: nonEmpty.max(120),
  client: nonEmpty.max(60),
  status: z.enum(projectStatuses),
  year: z.string().trim().max(20),
  role: nonEmpty.max(120),
  featured: z.boolean().optional(),

  playStoreUrl: url.optional(),
  githubUrl: url.optional(),
  installs: z.string().trim().max(20).optional(),
  rating: z.string().trim().max(8).optional(),
  reviews: z.string().trim().max(12).optional(),

  icon: assetPath.optional(),
  screenshots: z.array(assetPath).max(12).default([]),
  tech: z.array(nonEmpty.max(40)).max(12).default([]),
  metrics: z.array(projectMetricSchema).max(8).optional(),
  caseStudy: z.array(caseStudyBlockSchema).max(10).optional(),
});

/** PATCH body: any subset of a project, except the slug, which is the identity. */
export const projectPatchSchema = projectSchema.omit({ slug: true }).partial();

/* -------------------------------------------------------------------------- */
/* Experience, stack, and the rest                                            */
/* -------------------------------------------------------------------------- */

export const jobSchema = z.object({
  company: nonEmpty.max(80),
  title: nonEmpty.max(80),
  from: nonEmpty.max(20),
  to: nonEmpty.max(20),
  location: nonEmpty.max(60),
  intro: z.string().trim().max(600).optional(),
  bullets: z.array(nonEmpty.max(600)).max(15).default([]),
  tech: z.array(nonEmpty.max(40)).max(15).default([]),
});

export const skillGroupSchema = z.object({
  label: nonEmpty.max(40),
  items: z.array(nonEmpty.max(60)).max(20).default([]),
});

export const certificationSchema = z.object({
  name: nonEmpty.max(120),
  issuer: z.string().trim().max(60).optional(),
  meta: z.string().trim().max(20),
  url: url.optional(),
});

export const educationSchema = z.object({
  degree: nonEmpty.max(120),
  school: nonEmpty.max(120),
  years: z.string().trim().max(20),
});

export const principleSchema = z.object({
  n: z.string().trim().max(4),
  title: nonEmpty.max(80),
  body: nonEmpty.max(800),
});

/* -------------------------------------------------------------------------- */
/* The whole document                                                         */
/* -------------------------------------------------------------------------- */

export const contentSchema = z.object({
  profile: profileSchema,
  projects: z.array(projectSchema),
  experience: z.array(jobSchema),
  skillGroups: z.array(skillGroupSchema),
  certifications: z.array(certificationSchema),
  education: z.array(educationSchema),
  principles: z.array(principleSchema),
});

/** PATCH body for the whole document — any subset of top-level sections. */
export const contentPatchSchema = contentSchema.partial();

export type Stat = z.infer<typeof statSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type ProjectStatus = (typeof projectStatuses)[number];
export type ProjectMetric = z.infer<typeof projectMetricSchema>;
export type CaseStudyBlock = z.infer<typeof caseStudyBlockSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Job = z.infer<typeof jobSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Principle = z.infer<typeof principleSchema>;
export type Content = z.infer<typeof contentSchema>;

/** Flattens a ZodError into `{ "path.to.field": "message" }` for API responses. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
