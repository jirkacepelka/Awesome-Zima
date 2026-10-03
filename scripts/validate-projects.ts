/* Validates every projects/*.json file. Used in CI and before builds. */
import fs from "node:fs";
import path from "node:path";
import { projectSchema } from "../src/lib/schema";

const dir = path.join(process.cwd(), "projects");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
let failed = 0;
const urls = new Map<string, string>();

for (const file of files) {
  const fail = (msg: string) => {
    failed++;
    console.error(`✗ ${file}: ${msg}`);
  };
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  } catch (e) {
    fail(`invalid JSON (${(e as Error).message})`);
    continue;
  }
  const result = projectSchema.safeParse(raw);
  if (!result.success) {
    for (const issue of result.error.issues) fail(`${issue.path.join(".") || "(root)"}: ${issue.message}`);
    continue;
  }
  const p = result.data;
  if (`${p.slug}.json` !== file) fail(`slug "${p.slug}" must match the file name`);
  if (p.updatedAt < p.addedAt) fail("updatedAt is before addedAt");
  const dup = urls.get(p.url);
  if (dup) fail(`same url as ${dup}`);
  urls.set(p.url, file);
}

if (failed) {
  console.error(`\n${failed} problem(s) in ${files.length} project file(s).`);
  process.exit(1);
}
console.log(`✓ ${files.length} project file(s) valid.`);
