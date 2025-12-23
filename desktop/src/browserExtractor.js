/**
 * 浏览器解压模块
 * 在 Electron 启动时解压 zip 格式的浏览器文件
 */
const fs = require("fs");
const path = require("path");
const { Extract } = require("unzipper");
const { promisify } = require("util");
const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);

/**
 * 检查目录是否存在且非空
 */
async function isDirPopulated(dir) {
  try {
    await access(dir, fs.constants.F_OK);
    const files = fs.readdirSync(dir);
    return files.length > 0;
  } catch {
    return false;
  }
}

/**
 * 解压单个浏览器 zip 文件
 */
async function extractBrowserZip(zipPath, targetDir, onProgress) {
  const zipName = path.basename(zipPath);

  if (!fs.existsSync(zipPath)) {
    throw new Error(`浏览器 zip 文件不存在: ${zipPath}`);
  }

  // 如果目标目录已存在且有文件，跳过解压
  if (await isDirPopulated(targetDir)) {
    onProgress?.(`[skip] ${zipName} 已解压，跳过`);
    return { skipped: true };
  }

  onProgress?.(`[extract] 正在解压 ${zipName}...`);
  await mkdir(targetDir, { recursive: true });

  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    fs.createReadStream(zipPath)
      .pipe(Extract({ path: targetDir }))
      .on("close", () => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        onProgress?.(`[ok] ${zipName} 解压完成 (${elapsed}s)`);
        resolve({ extracted: true, elapsed });
      })
      .on("error", (err) => {
        onProgress?.(`[error] ${zipName} 解压失败: ${err.message}`);
        reject(err);
      });
  });
}

/**
 * 解压所有浏览器
 * @param {string} resourcesDir - 资源目录（包含 zip 文件）
 * @param {string} targetBrowsersDir - 目标浏览器目录
 * @param {function} onProgress - 进度回调
 */
async function extractAllBrowsers(resourcesDir, targetBrowsersDir, onProgress) {
  const browsersZipDir = path.join(resourcesDir, "browsers-zip");

  if (!fs.existsSync(browsersZipDir)) {
    onProgress?.(`[skip] 未找到 browsers-zip 目录，跳过浏览器解压`);
    return { skipped: true, reason: "no-zip-dir" };
  }

  // 查找所有 zip 文件
  const zipFiles = fs.readdirSync(browsersZipDir)
    .filter(f => f.endsWith(".zip"))
    .map(f => path.join(browsersZipDir, f));

  if (zipFiles.length === 0) {
    onProgress?.(`[skip] browsers-zip 目录为空，跳过浏览器解压`);
    return { skipped: true, reason: "no-zip-files" };
  }

  onProgress?.(`[info] 找到 ${zipFiles.length} 个浏览器 zip 文件`);

  // 确保目标目录存在
  await mkdir(targetBrowsersDir, { recursive: true });

  const results = [];
  for (const zipPath of zipFiles) {
    const zipName = path.basename(zipPath, ".zip");
    const targetDir = path.join(targetBrowsersDir, zipName);

    try {
      const result = await extractBrowserZip(zipPath, targetDir, onProgress);
      results.push({ zip: zipName, ...result });
    } catch (err) {
      onProgress?.(`[error] ${zipName} 解压失败: ${err.message}`);
      results.push({ zip: zipName, error: err.message });
    }
  }

  const extracted = results.filter(r => r.extracted).length;
  const skipped = results.filter(r => r.skipped).length;
  const failed = results.filter(r => r.error).length;

  onProgress?.(`[summary] 解压完成: ${extracted}个, 跳过: ${skipped}个, 失败: ${failed}个`);

  return {
    total: zipFiles.length,
    extracted,
    skipped,
    failed,
    results,
  };
}

/**
 * 检查并解压 Playwright 浏览器
 */
async function ensurePlaywrightBrowsers(app, onLog) {
  const resourcesDir = app.isPackaged
    ? path.join(process.resourcesPath, "synapse-resources")
    : path.join(__dirname, "..", "resources");

  const userDataPath = app.getPath("userData");
  const targetBrowsersDir = path.join(userDataPath, "playwright-browsers");

  onLog?.("browser-extract", `[info] 检查浏览器文件...\n`);
  onLog?.("browser-extract", `[info] 资源目录: ${resourcesDir}\n`);
  onLog?.("browser-extract", `[info] 目标目录: ${targetBrowsersDir}\n`);

  try {
    const result = await extractAllBrowsers(
      resourcesDir,
      targetBrowsersDir,
      (msg) => onLog?.("browser-extract", `${msg}\n`)
    );

    return {
      success: true,
      browsersPath: targetBrowsersDir,
      ...result,
    };
  } catch (err) {
    onLog?.("browser-extract", `[error] 浏览器解压失败: ${err.message}\n`);
    return {
      success: false,
      error: err.message,
    };
  }
}

module.exports = {
  extractBrowserZip,
  extractAllBrowsers,
  ensurePlaywrightBrowsers,
};
