/**
 * Maintenance helper: normalizes src/lib/i18n/en.ts (Dictionary export format).
 * English strings live in en.ts — not language-context.tsx.
 */
import fs from "fs";

const sourcePath = "src/lib/i18n/en.ts";
const s = fs.readFileSync(sourcePath, "utf8");
const start = s.indexOf("export const en: Dictionary = {");
const end = s.indexOf("\n};", start) + 3;
if (start === -1 || end === 2) {
  throw new Error(`en block not found in ${sourcePath}`);
}

const body = s.slice(start + "export const en: Dictionary = ".length, end);
fs.writeFileSync(
  sourcePath,
  `export type Dictionary = Record<string, string>;\n\nexport const en: Dictionary = ${body}\n`,
);
