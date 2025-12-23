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

  // 🆕 新方案：浏览器以 ZIP 形式打包，在启动时解压
  // 不再复制整个 .playwright-browsers 目录（节省打包时间和空间）
  // 浏览器 ZIP 文件通过 package.json extraResources 配置打包
  const browsersZipDir = path.join(outResources, "browsers-zip");
  if (fs.existsSync(browsersZipDir)) {
    console.log(`[prepare] browsers-zip directory found: ${browsersZipDir}`);
    const zipFiles = fs.readdirSync(browsersZipDir).filter(f => f.endsWith(".zip"));
    console.log(`[prepare] found ${zipFiles.length} browser ZIP files: ${zipFiles.join(", ")}`);
  } else {
    console.log(`[prepare] ⚠️  browsers-zip directory not found!`);
    console.log(`[prepare] Run 'prepare-browsers-zip.bat' before building`);
  }

  console.log("[prepare] done");
}

main();

