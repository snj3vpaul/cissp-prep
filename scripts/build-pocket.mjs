// Builds the standalone CISSP Pocket Trainer: inlines pocket/qbank.js into
// pocket/app.html and writes public/pocket/index.html (served at /pocket).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "pocket/app.html"), "utf8");
const bank = readFileSync(join(root, "pocket/qbank.js"), "utf8");
if (!html.includes("/*QBANK*/")) throw new Error("pocket/app.html is missing the /*QBANK*/ placeholder");

const outDir = join(root, "public/pocket");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "index.html"), html.replace("/*QBANK*/", () => bank));
console.log("Built public/pocket/index.html");
