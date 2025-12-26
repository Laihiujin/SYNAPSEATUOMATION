"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
function parseComposerId(composerId) {
  const parts = composerId.split("@@");
  if (parts.length < 3) return null;
  const prefix = parts[0];
  const middle = parts[1];
  const filename = decodeURIComponent(parts[2]);
  if (prefix === "local") {
    try {
      const filePath = Buffer.from(middle, "base64").toString("utf-8");
      return {
        type: "local",
        filePath,
        filename
      };
    } catch {
      return null;
    }
  } else if (prefix === "__intel__") {
    return {
      type: "intelligence",
      fileId: middle,
      filename
    };
  } else {
    try {
      const decodedFilename = Buffer.from(middle, "base64").toString("utf-8");
      return {
        type: "task",
        taskId: prefix,
        fileId: middle,
        // 保留 base64 格式的 fileId
        filename: decodedFilename
      };
    } catch {
      return null;
    }
  }
}
function extractComposerIdFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const composerMatch = pathname.match(/\/(?:[a-z]{2}-[A-Z]{2}\/)?composer\/([^/]+)/);
    if (composerMatch && composerMatch[1]) {
      return composerMatch[1];
    }
    return null;
  } catch {
    return null;
  }
}
function extractFilePathFromEditorUrl(url) {
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== "flowith:" || urlObj.hostname !== "editor") {
      return null;
    }
    const fileUrl = urlObj.searchParams.get("url");
    if (!fileUrl) {
      return null;
    }
    const decodedFileUrl = decodeURIComponent(fileUrl);
    if (!decodedFileUrl.startsWith("file://")) {
      return null;
    }
    if (typeof require !== "undefined") {
      try {
        const { fileURLToPath } = require("url");
        return fileURLToPath(decodedFileUrl);
      } catch {
      }
    }
    return decodedFileUrl.replace(/^file:\/\//, "").replace(/^\/+/, "");
  } catch {
    return null;
  }
}
class UrlMigration {
  static migrateUrl(oldUrl) {
    if (oldUrl.includes("/composer/")) {
      const composerId = extractComposerIdFromUrl(oldUrl);
      if (composerId) {
        const info = parseComposerId(composerId);
        if (info?.type === "local" && info.filePath) {
          return `file://${info.filePath}`;
        }
      }
      return oldUrl;
    }
    if (oldUrl.startsWith("flowith://editor")) {
      const filePath = extractFilePathFromEditorUrl(oldUrl);
      if (filePath) return `file://${filePath}`;
    }
    return oldUrl;
  }
  static async migrateHistory() {
    const { getHistoryRepository } = await Promise.resolve().then(() => require("./index-CR4vSMhM.js"));
    const repository = getHistoryRepository();
    const items = await repository.getAll();
    let count = 0;
    for (const item of items) {
      const newUrl = this.migrateUrl(item.url);
      if (newUrl !== item.url) {
        await repository.deleteByUrl(item.url);
        await repository.add({
          id: item.id,
          url: newUrl,
          title: item.title,
          favicon: item.favicon,
          timestamp: new Date(item.timestamp)
        });
        count++;
      }
    }
    console.log(`[UrlMigration] History: ${count} items`);
    return count;
  }
  static async migrateBookmarks() {
    try {
      const { getBookmarkRepository } = await Promise.resolve().then(() => require("./index-CR4vSMhM.js"));
      const repository = getBookmarkRepository();
      const items = await repository.getAll();
      let count = 0;
      const migrate = async (item) => {
        if (item.type === "bookmark" && item.url) {
          const newUrl = this.migrateUrl(item.url);
          if (newUrl !== item.url) {
            await repository.update(item.id, { url: newUrl });
            count++;
          }
        }
        if (item.children) {
          for (const child of item.children) await migrate(child);
        }
      };
      for (const item of items) await migrate(item);
      console.log(`[UrlMigration] Bookmarks: ${count} items`);
      return count;
    } catch (error) {
      console.error("[UrlMigration] Bookmark migration failed:", error);
      return 0;
    }
  }
  static async migrateAll() {
    const [history, bookmarks] = await Promise.all([
      this.migrateHistory(),
      this.migrateBookmarks()
    ]);
    console.log(`[UrlMigration] Complete: ${history + bookmarks} items`);
  }
}
exports.UrlMigration = UrlMigration;
