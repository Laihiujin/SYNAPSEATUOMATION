"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron"), index = require("./index-Bf0u4cvK.js");
require("path"), require("fs/promises"), require("fs");
class CrashHandler {
  crashLogPath;
  constructor() {
    this.crashLogPath = index.getAppStorage().getPath("logs", "crash-logs");
    this.ensureLogDirectory();
    this.setupGlobalErrorHandlers();
  }
  async ensureLogDirectory() {
    try {
      await index.getAppStorage().fs.createDirectory("logs", "crash-logs");
    } catch (error) {
      console.error("Failed to create crash log directory:", error);
    }
  }
  setupGlobalErrorHandlers() {
    process.on("unhandledRejection", (reason, promise) => {
      if (this.shouldIgnoreReason(reason)) {
        console.warn("[CrashHandler] Ignoring benign unhandled rejection:", reason);
        return;
      }
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
      this.logCrash(reason, "unhandledRejection");
    });
    process.on("uncaughtException", (error) => {
      if (this.shouldIgnoreReason(error)) {
        console.warn("[CrashHandler] Ignoring benign uncaught exception:", error);
        return;
      }
      console.error("Uncaught Exception:", error);
      this.logCrash(error, "uncaughtException");
      setTimeout(() => {
        process.exit(1);
      }, 5e3);
    });
    electron.app.on("render-process-gone", (_event, webContents, details) => {
      console.error("Render process gone:", details);
      this.logCrash(details, "render-process-gone", webContents.getURL());
    });
    electron.app.on("child-process-gone", (_event, details) => {
      console.error("Child process gone:", details);
      this.logCrash(details, "child-process-gone");
    });
  }
  shouldIgnoreReason(reason) {
    if (!reason || typeof reason !== "object") {
      return false;
    }
    const err = reason;
    if (err.code === "ERR_ABORTED" || err.errno === -3) {
      return true;
    }
    if (typeof err.message === "string" && err.message.includes("ERR_ABORTED")) {
      return true;
    }
    return false;
  }
  async logCrash(error, context, url) {
    try {
      const crashInfo = {
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        error,
        context,
        stackTrace: error instanceof Error ? error.stack : void 0,
        processInfo: {
          pid: process.pid,
          platform: process.platform,
          arch: process.arch,
          version: process.version,
          electronVersion: process.versions.electron
        }
      };
      if (url) {
        ;
        crashInfo.url = url;
      }
      const logFileName = `crash-${Date.now()}.json`;
      await index.getAppStorage().fs.writeJSON("logs", `crash-logs/${logFileName}`, crashInfo);
      console.log(`Crash logged to: ${this.crashLogPath}/${logFileName}`);
      await this.cleanupOldLogs();
    } catch (logError) {
      console.error("Failed to log crash:", logError);
    }
  }
  async cleanupOldLogs() {
    try {
      await index.getAppStorage().fs.cleanup("logs", {
        pattern: "crash-logs/crash-*.json",
        recursive: true
      });
      console.log("Cleaned up old crash logs");
    } catch (error) {
      console.error("Failed to cleanup old crash logs:", error);
    }
  }
  async showCrashDialog(error) {
    try {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const result = await electron.dialog.showMessageBox({
        type: "error",
        title: "Application Error",
        message: "An unexpected error occurred",
        detail: `${errorMessage}

The error has been logged for debugging purposes.`,
        buttons: ["Restart", "Close"],
        defaultId: 0,
        cancelId: 1
      });
      if (result.response === 0) {
        electron.app.relaunch();
        electron.app.exit();
      } else {
        electron.app.quit();
      }
    } catch (dialogError) {
      console.error("Failed to show crash dialog:", dialogError);
      electron.app.quit();
    }
  }
  // 为特定的WebContents操作添加安全包装
  static safeWebContentsOperation(webContents, operation, fallback) {
    try {
      if (!webContents || webContents.isDestroyed()) {
        console.warn("WebContents is null or destroyed, skipping operation");
        return fallback;
      }
      return operation(webContents);
    } catch (error) {
      console.error("WebContents operation failed:", error);
      globalCrashHandler.logCrash(error, "webContents-operation");
      return fallback;
    }
  }
  // 为 view 操作添加安全包装
  static safeViewOperation(view, operation, fallback) {
    try {
      if (!view || !view.webContents || view.webContents.isDestroyed()) {
        console.warn("View or WebContents is null or destroyed, skipping operation");
        return fallback;
      }
      return operation(view);
    } catch (error) {
      console.error("View operation failed:", error);
      globalCrashHandler.logCrash(error, "view-operation");
      return fallback;
    }
  }
}
const globalCrashHandler = new CrashHandler();
exports.globalCrashHandler = globalCrashHandler;
