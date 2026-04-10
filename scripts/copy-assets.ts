import { copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const copyJobs = [
  {
    from: resolve(root, "schema.JSON"),
    to: resolve(root, "dist/schema.JSON"),
  },
  {
    from: resolve(root, "src/styles/theme.css"),
    to: resolve(root, "dist/styles/theme.css"),
  },
];

for (const job of copyJobs) {
  mkdirSync(resolve(job.to, ".."), { recursive: true });
  copyFileSync(job.from, job.to);
  console.log(`Copied ${job.from} -> ${job.to}`);
}
