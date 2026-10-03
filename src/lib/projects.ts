import "server-only";
import fs from "node:fs";
import path from "node:path";
import { projectSchema, type Project } from "./schema";

const PROJECTS_DIR = path.join(process.cwd(), "projects");

let cache: Project[] | null = null;

/** Reads and validates every `projects/*.json` file. Runs at build time. */
export function getProjects(): Project[] {
  if (cache) return cache;
  const files = fs.readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".json"));
  const projects = files.map((file) => {
    const raw = JSON.parse(fs.readFileSync(path.join(PROJECTS_DIR, file), "utf8"));
    const result = projectSchema.safeParse(raw);
    if (!result.success) {
      throw new Error(`Invalid project file ${file}: ${result.error.message}`);
    }
    if (`${result.data.slug}.json` !== file) {
      throw new Error(`Slug "${result.data.slug}" does not match file name ${file}`);
    }
    return result.data;
  });
  cache = projects.sort((a, b) => b.addedAt.localeCompare(a.addedAt) || a.name.localeCompare(b.name));
  return cache;
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}
