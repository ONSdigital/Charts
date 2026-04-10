import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { buildThemeStylesheet } from "../src/theme/cssVariables";
import { defaultTheme } from "../src/theme/theme";

const outputPath = resolve(process.cwd(), "src/styles/theme.css");
const stylesheet = [
  "/* Auto-generated from src/theme/theme.ts. */",
  buildThemeStylesheet(defaultTheme, ":root"),
  "",
].join("\n");

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, stylesheet, "utf8");

console.log(`Wrote ${outputPath}`);
