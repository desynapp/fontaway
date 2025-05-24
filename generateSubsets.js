const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const SOURCE_DIR = path.resolve("./dist/google-fonts");
const OUTPUT_DIR = path.resolve("./fonts");
const STYLES = ["Regular", "Bold", "Italic", "BoldItalic"];
const basicCharacters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?-() ";
const specialCharacters = ":&%$#@!\"'`~^*+=_<>/\\|;{}[]";
const FONT_TEXT = basicCharacters + specialCharacters;

// Escape shell special characters
function escapeShellArg(str) {
  return str.replace(/(["\\$`])/g, "\\$1");
}

// Ensure output root exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

// Process only direct subfolders of SOURCE_DIR
function processTopLevelFontFamilies(rootDir) {
  const fontFamilies = {};
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const familyName = entry.name;
      const familyDir = path.join(rootDir, familyName);
      const created = processFontFamily(familyDir, familyName);
      if (created) fontFamilies[familyName] = true;
    }
  }

  return fontFamilies;
}

// Process 1 font family directory
function processFontFamily(familyDir, familyName) {
  let createdAny = false;

  for (const style of STYLES) {
    const fontFiles = findFontFile(familyDir, style);
    if (fontFiles.length === 0) continue;

    const inputPath = fontFiles[0];
    const cleanedOutputName = `${familyName}-${style}.ttf`;
    const outputSubfolder = path.join(OUTPUT_DIR, familyName);
    const outputPath = path.join(outputSubfolder, cleanedOutputName);

    if (!fs.existsSync(outputSubfolder)) {
      fs.mkdirSync(outputSubfolder, { recursive: true });
    }

    try {
      execSync(
        `pyftsubset "${inputPath}" ` +
        `--output-file="${outputPath}" ` +
        `--text="${escapeShellArg(FONT_TEXT)}" ` +
        `--drop-tables+=DSIG`
      );
      console.log(`✅ Subset created: ${outputPath}`);
      createdAny = true;
    } catch (err) {
      console.warn(`⚠️ Failed to subset: ${inputPath}`);
    }
  }

  return createdAny;
}

// Find matching style file inside a directory tree
function findFontFile(baseDir, style) {
  const matches = [];
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(baseDir, entry.name);
    if (entry.isDirectory()) {
      matches.push(...findFontFile(fullPath, style));
    } else if (entry.isFile() && entry.name.endsWith(`-${style}.ttf`)) {
      matches.push(fullPath);
    }
  }
  return matches;
}

// Recursively generate folder/file JSON structure
function generateStructure(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  const children = entries
    .filter((entry) => !entry.name.startsWith("."))
    .map((entry) => {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        return generateStructure(fullPath);
      } else {
        return {
          name: entry.name,
          type: "file",
        };
      }
    });

  return {
    name: path.basename(dirPath),
    type: "folder",
    children,
  };
}

// Run
const familiesMap = processTopLevelFontFamilies(SOURCE_DIR);

// Write pretty folder structure
const fontStructure = generateStructure(OUTPUT_DIR);
fs.writeFileSync(
  path.join(OUTPUT_DIR, "font-structure.json"),
  JSON.stringify(fontStructure, null, 2),
  "utf-8"
);

// Write flat font family list
fs.writeFileSync(
  path.join(OUTPUT_DIR, "font-families.json"),
  JSON.stringify(familiesMap, null, 2),
  "utf-8"
);

console.log("\n📦 Font structure saved to fonts/font-structure.json");
console.log("📘 Font families map saved to fonts/font-families.json");
