/* Regenerates schema/project.schema.json from the zod schema. */
import fs from "node:fs";
import { z } from "zod";
import { projectSchema } from "../src/lib/schema";

const schema = z.toJSONSchema(projectSchema, { io: "input", unrepresentable: "any" });
fs.writeFileSync(
  "schema/project.schema.json",
  JSON.stringify({ title: "Awesome Zima project", ...schema }, null, 2) + "\n",
);
console.log("Wrote schema/project.schema.json");
