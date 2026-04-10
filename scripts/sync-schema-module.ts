import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const sourcePath = resolve(process.cwd(), "schema.JSON");
const outputPath = resolve(process.cwd(), "src/schema/chartConfigSchema.ts");
const schemaSource = readFileSync(sourcePath, "utf8");
const moduleSource = `/* Auto-generated from schema.JSON. */\nexport const chartConfigSchema = (${schemaSource}) as const;\n\nexport default chartConfigSchema;\n`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, moduleSource, "utf8");

console.log(`Wrote ${outputPath}`);
