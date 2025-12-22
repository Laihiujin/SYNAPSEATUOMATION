const fs = require("fs");
const path = require("path");

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else if (entry.isFile()) {
      fs.mkdirSync(path.dirname(d), { recursive: true });
      fs.copyFileSync(s, d);
    }
  }
}

function main() {
  const desktopRoot = path.resolve(__dirname, "..");
  const repoRoot = path.resolve(desktopRoot, "..");

  const outResources = path.join(desktopRoot, "resources");
  fs.mkdirSync(outResources, { recursive: true });

  const playwrightSrc = path.join(repoRoot, ".playwright-browsers");
  const playwrightDst = path.join(outResources, "playwright-browsers");
  if (fs.existsSync(playwrightSrc)) {
    console.log(`[prepare] copy playwright browsers: ${playwrightSrc} -> ${playwrightDst}`);
    fs.rmSync(playwrightDst, { recursive: true, force: true });
    copyDir(playwrightSrc, playwrightDst);
  } else {
    console.log(`[prepare] skip playwright browsers (not found): ${playwrightSrc}`);
  }

  console.log("[prepare] done");
}

main();

