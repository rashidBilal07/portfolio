import type { Content } from "@/lib/schema";
import { profile, terminalLines } from "./profile";
import { projects } from "./projects";
import { experience } from "./experience";
import { skillGroups, certifications, education, principles } from "./skills";

/**
 * The content the site ships with, and the fallback whenever the runtime store
 * is absent or invalid. Edit the files in this directory to change the
 * defaults; edit via /admin to change what is actually served.
 */
export const defaultContent: Content = {
  profile: { ...profile, terminalLines: [...terminalLines] },
  projects,
  experience,
  skillGroups,
  certifications,
  education,
  principles,
};
