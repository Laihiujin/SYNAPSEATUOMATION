"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron"), AbstractModalViewManager = require("./AbstractModalViewManager-aig2dJrA.js");
require("@electron-toolkit/utils"), require("path"), require("../index.js"), require("p-queue");
class DownloadNotificationManager extends AbstractModalViewManager.A {
  static instance = null;
  hideTimer = null;
  constructor() {
    super("downloadNotification", "download-notification:ready");
    this.setupIpcHandlers();
  }
  static getInstance() {
    if (!DownloadNotificationManager.instance) {
      DownloadNotificationManager.instance = new DownloadNotificationManager();
    }
    return DownloadNotificationManager.instance;
  }
  setupIpcHandlers() {
    electron.ipcMain.handle("downloadNotification:openDownloads", async () => {
      try {
        const { tabManager } = await Promise.resolve().then(() => require("./index-vXB5mSwm.js")).then((n) => n.a7);
        await tabManager.createTab("flowith://settings/download", void 0, true);
        this.hide();
        return { success: true };
      } catch (error) {
        console.error("[DownloadNotification] 打开下载页面失败:", error);
        return { success: false };
      }
    });
    electron.ipcMain.handle("downloadNotification:dismiss", () => {
      this.hide();
      return { success: true };
    });
  }
  getViewBounds(parentBounds) {
    const width = 320;
    const height = 80;
    const padding = 16;
    return {
      x: parentBounds.width - width - padding,
      y: padding,
      width,
      height
    };
  }
  /**
   * 显示下载开始通知
   */
  async notify(data) {
    console.log("[DownloadNotification] 显示下载通知:", data.filename);
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    await super.show();
    if (!this.view.webContents.isDestroyed()) {
      this.view.webContents.send("download-notification:show", data);
    }
  }
  /**
   * 隐藏通知
   */
  hide() {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    super.hide();
  }
}
const downloadNotification = DownloadNotificationManager.getInstance();
exports.downloadNotification = downloadNotification;
