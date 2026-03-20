/**
 * tsc does not emit JSON imports to dist/; copy JSON assets next to compiled JS.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const srcContracts = path.join(root, "src", "contracts");
const distContracts = path.join(root, "dist", "contracts");
const srcSchema = path.join(root, "src", "schema.json");
const distSchema = path.join(root, "dist", "schema.json");

fs.mkdirSync(distContracts, { recursive: true });
for (const name of fs.readdirSync(srcContracts)) {
  fs.copyFileSync(path.join(srcContracts, name), path.join(distContracts, name));
}
fs.copyFileSync(srcSchema, distSchema);
console.log("copy-assets: JSON copied to dist/");
