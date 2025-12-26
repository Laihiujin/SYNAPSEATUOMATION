"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron"), fs = require("node:fs/promises"), path = require("node:path"), path$1 = require("path");
const FILESYSTEM_JSON = "fileSystem.json";
const INDEX_META_JSON = "__index__.meta.json";
const META_JSON_SUFFIX = ".meta.json";
async function migrateFileSystem251120() {
  const userDataPath = electron.app.getPath("userData");
  const sourceRoot = path.join(userDataPath, "data/agent-data/tasks");
  const destRoot = path.join(userDataPath, "data/agent-data-v2/tasks");
  const defaultTaskFilesRoot = path.join(userDataPath, "data/defaultTaskFiles");
  try {
    await fs.access(sourceRoot);
  } catch {
    return;
  }
  const entries = await fs.readdir(sourceRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith("task_")) {
      continue;
    }
    const taskDirName = entry.name;
    const sourceTaskDir = path.join(sourceRoot, taskDirName);
    const destTaskDir = path.join(destRoot, taskDirName);
    const newTaskFilesDir = path.join(defaultTaskFilesRoot, taskDirName);
    await migrateSingleTask(taskDirName, sourceTaskDir, destTaskDir, newTaskFilesDir);
  }
}
async function migrateSingleTask(taskDirName, sourceTaskDir, destTaskDir, newTaskFilesDir) {
  try {
    await fs.mkdir(destTaskDir, { recursive: true });
    await fs.mkdir(newTaskFilesDir, { recursive: true });
    const metaData = {
      path: newTaskFilesDir
    };
    await fs.writeFile(
      path.join(destTaskDir, FILESYSTEM_JSON),
      JSON.stringify(metaData, null, 2),
      "utf-8"
    );
    const files = await fs.readdir(sourceTaskDir, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) continue;
      if (file.name === INDEX_META_JSON) continue;
      if (file.name.endsWith(META_JSON_SUFFIX)) {
        const dataFileName = file.name.slice(0, -META_JSON_SUFFIX.length);
        const dataFileEntry = files.find((f) => f.name === dataFileName);
        if (dataFileEntry && !dataFileEntry.isDirectory()) {
          const sourceFilePath = path.join(sourceTaskDir, dataFileName);
          const destFilePath = path.join(newTaskFilesDir, dataFileName);
          const metaFilePath = path.join(sourceTaskDir, file.name);
          await fs.rename(sourceFilePath, destFilePath);
          await fs.unlink(metaFilePath);
        }
      }
    }
    const remainingFiles = await fs.readdir(sourceTaskDir, {
      withFileTypes: true
    });
    for (const file of remainingFiles) {
      if (file.isDirectory()) continue;
      if (file.name === INDEX_META_JSON) continue;
      if (file.name.endsWith(META_JSON_SUFFIX)) continue;
      const sourceFilePath = path.join(sourceTaskDir, file.name);
      const destFilePath = path.join(newTaskFilesDir, file.name);
      try {
        await fs.rename(sourceFilePath, destFilePath);
      } catch (err) {
        console.warn(`移动剩余文件失败 ${file.name}:`, err);
      }
    }
    const finalFiles = await fs.readdir(sourceTaskDir);
    if (finalFiles.length === 0) {
      await fs.rmdir(sourceTaskDir);
    }
  } catch (err) {
    console.error(`迁移任务失败 ${taskDirName}:`, err);
  }
}
function getFirstString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return null;
}
function getFirstNumber(...values) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }
  return null;
}
async function deleteDirIfEmpty(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir);
  } catch {
    return;
  }
  if (entries.length === 0) {
    await fs.rmdir(dir);
  }
}
async function readJsonIfExists(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
const TASK_PREFIX = "task_";
const INDEX_META_FILE = "__index__.meta.json";
const LEGACY_INDEX_META_FILE = "index.meta.json";
const HISTORY_FILE = "history.v2.json";
const ARCHIVE_FILE_V2 = "archived.v2.json";
const META_FILE = "meta.json";
const ARCHIVE_FILE_V3 = "archived.v3.json";
async function migrateTaskMetaData251124() {
  const userDataPath = electron.app.getPath("userData");
  const sourceRoot = path$1.join(userDataPath, "data/agent-data/tasks");
  const destRoot = path$1.join(userDataPath, "data/agent-data-v2/tasks");
  await fs.mkdir(destRoot, { recursive: true });
  await moveLegacyIndexes(sourceRoot, destRoot);
  await deleteLegacyIndexList(path$1.join(sourceRoot, LEGACY_INDEX_META_FILE));
  await deleteDirIfEmpty(sourceRoot);
  await writeMetaFiles(destRoot);
  await upgradeArchiveFormat(destRoot);
}
async function moveLegacyIndexes(sourceRoot, destRoot) {
  for await (const { taskId, taskDir } of iterateTaskDirs(sourceRoot)) {
    const legacyIndexPath = path$1.join(taskDir, INDEX_META_FILE);
    if (!await fileExists(legacyIndexPath)) continue;
    const destTaskDir = path$1.join(destRoot, taskId);
    await fs.mkdir(destTaskDir, { recursive: true });
    const destIndexPath = path$1.join(destTaskDir, INDEX_META_FILE);
    if (await fileExists(destIndexPath)) {
      await fs.unlink(destIndexPath);
    }
    await fs.rename(legacyIndexPath, destIndexPath);
    await deleteDirIfEmpty(taskDir);
  }
}
async function writeMetaFiles(destRoot) {
  for await (const { taskId, taskDir: destTaskDir } of iterateTaskDirs(destRoot)) {
    const metaFilePath = path$1.join(destTaskDir, META_FILE);
    if (await fileExists(metaFilePath)) continue;
    await fs.mkdir(destTaskDir, { recursive: true });
    const historyPath = path$1.join(destTaskDir, HISTORY_FILE);
    const legacyIndexPath = path$1.join(destTaskDir, INDEX_META_FILE);
    let meta = null;
    if (await fileExists(historyPath)) {
      const historyData = await readJsonIfExists(historyPath);
      if (!historyData) continue;
      meta = buildMetaFromHistory(historyData, taskId);
    } else if (await fileExists(legacyIndexPath)) {
      const legacyIndex = await readJsonIfExists(legacyIndexPath);
      if (!legacyIndex) continue;
      meta = buildMetaFromLegacyIndex(legacyIndex, taskId);
    }
    if (meta) {
      await fs.writeFile(metaFilePath, JSON.stringify(meta, null, 2), "utf-8");
    }
  }
}
function buildMetaFromHistory(historyData, taskId) {
  const instruction = getFirstString(historyData.instruction) ?? "instructions not found";
  const createdAt = getFirstNumber(historyData.createdAt) ?? Date.now();
  let stopReason = historyData.stopReason;
  if (stopReason !== "user" && stopReason !== "complete" && stopReason !== "maxSteps") {
    stopReason = "user";
  }
  return {
    id: taskId,
    instruction,
    createdAt,
    stopReason
  };
}
function buildMetaFromLegacyIndex(legacyIndex, taskId) {
  const instruction = getFirstString(legacyIndex.instructions, legacyIndex.instruction) ?? "instruction not found";
  const createdAt = getFirstNumber(legacyIndex.createdAt, legacyIndex.created_at, legacyIndex.timestamp) ?? Date.now();
  const stopReason = legacyIndex.success === true ? "complete" : "user";
  return {
    id: taskId,
    instruction,
    createdAt,
    stopReason
  };
}
async function upgradeArchiveFormat(destRoot) {
  for await (const { taskDir: destTaskDir } of iterateTaskDirs(destRoot)) {
    const archivedV2Path = path$1.join(destTaskDir, ARCHIVE_FILE_V2);
    if (!await fileExists(archivedV2Path)) continue;
    const archivedData = await readJsonIfExists(archivedV2Path);
    const archivedAt = getFirstNumber(archivedData?.archivedAt, archivedData?.archived_at) ?? Date.now();
    const archivedV3Path = path$1.join(destTaskDir, ARCHIVE_FILE_V3);
    await fs.writeFile(
      archivedV3Path,
      JSON.stringify(
        {
          archivedAt
        },
        null,
        2
      ),
      "utf-8"
    );
    await fs.unlink(archivedV2Path);
  }
}
async function* iterateTaskDirs(root) {
  let entries;
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith(TASK_PREFIX)) continue;
    const taskId = entry.name;
    yield { taskId, taskDir: path$1.join(root, taskId) };
  }
}
async function deleteLegacyIndexList(indexPath) {
  try {
    await fs.unlink(indexPath);
  } catch {
  }
}
async function migrate() {
  await migrateFileSystem251120();
  await migrateTaskMetaData251124();
}
exports.migrate = migrate;
