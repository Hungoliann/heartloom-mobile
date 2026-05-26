#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { relative, dirname, posix } from "node:path";

const root = process.cwd();
const files = execSync(`git ls-files "*.tsx" "*.ts"`, { cwd: root, encoding: "utf8" })
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((f) => f.startsWith("app/") || f.startsWith("src/"));

let touched = 0;
let italicHits = 0;
let regularHits = 0;

for (const rel of files) {
  const abs = `${root.replace(/\\/g, "/")}/${rel}`;
  let src = readFileSync(abs, "utf8");
  if (!src.includes('fontFamily: "Georgia"') && !src.includes("fontFamily: 'Georgia'")) continue;

  // Regex matches: fontFamily: "Georgia"  (with double or single quotes)
  const re = /fontFamily:\s*['"]Georgia['"]/g;

  const newSrc = src.replace(re, (match, offset) => {
    // Look for `fontStyle: "italic"` within +/-200 chars of this fontFamily
    const start = Math.max(0, offset - 200);
    const end = Math.min(src.length, offset + 200);
    const window = src.slice(start, end);
    const italic = /fontStyle:\s*['"]italic['"]/.test(window);
    if (italic) {
      italicHits++;
      return "fontFamily: SERIF_ITALIC";
    }
    regularHits++;
    return "fontFamily: SERIF";
  });

  // Add import if missing
  const usesItalic = newSrc.includes("SERIF_ITALIC");
  const usesRegular = /\bSERIF\b(?!_)/.test(newSrc);

  const importNames = [];
  if (usesRegular) importNames.push("SERIF");
  if (usesItalic) importNames.push("SERIF_ITALIC");

  // Compute relative path from this file to src/constants/fonts
  const fileDir = dirname(rel).replace(/\\/g, "/");
  let relImport = posix.relative(fileDir, "src/constants/fonts");
  if (!relImport.startsWith(".")) relImport = "./" + relImport;

  const importLine = `import { ${importNames.join(", ")} } from "${relImport}";`;

  // Insert import at the very top of the file (always safe; TS/ESLint will sort later)
  let finalSrc = newSrc;
  if (!/from\s+["'][^"']*constants\/fonts["']/.test(newSrc)) {
    finalSrc = importLine + "\n" + newSrc;
  }

  writeFileSync(abs, finalSrc, "utf8");
  touched++;
}

console.log(`Files modified: ${touched}`);
console.log(`Regular replacements: ${regularHits}`);
console.log(`Italic replacements:  ${italicHits}`);
