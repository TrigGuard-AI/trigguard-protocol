/**
 * Copies core/contracts/decision_contract.json into this package so the npm package is self-contained.
 * Run from repo root: npm run sync-contract --prefix implementations/typescript
 * Or: cd implementations/typescript && npm run sync-contract
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..", "..");
const source = path.join(repoRoot, "core", "contracts", "decision_contract.json");
const dest = path.join(__dirname, "..", "src", "contracts", "decision_contract.json");

if (!fs.existsSync(source)) {
  const isMonorepo = fs.existsSync(path.join(repoRoot, ".git"));
  if (isMonorepo) {
    console.error("sync-contract: monorepo checkout detected but source is missing:", source);
    process.exit(1);
  }
  // Git/npm installs that only extract `implementations/typescript` have no monorepo `core/`.
  // The committed snapshot under src/contracts is the fallback source of truth.
  if (!fs.existsSync(dest)) {
    console.error("sync-contract: missing both monorepo source and committed snapshot:", source, dest);
    process.exit(1);
  }
  console.warn(
    "sync-contract: no monorepo core/contracts (subpath/git install); using committed snapshot:",
    dest
  );
  process.exit(0);
}

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(source, dest);
console.log("sync-contract: copied", source, "->", dest);
