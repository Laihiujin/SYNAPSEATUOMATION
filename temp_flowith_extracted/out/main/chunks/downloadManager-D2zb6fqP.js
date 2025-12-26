"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron"), path = require("path"), fs = require("fs"), index$1 = require("./index-B34KkOYs.js"), index = require("./index-CR4vSMhM.js"), mainEventBus = require("./mainEventBus-D2ZkkKhI.js");
require("crypto"), require("drizzle-orm/libsql/migrator"), require("drizzle-orm/libsql"), require("@libsql/client"), require("drizzle-orm/sqlite-core"), require("drizzle-orm"), require("mitt");
class DownloadManager {
  static instance = null;
  activeDownloads = /* @__PURE__ */ new Map();
  downloadRepository = index.getDownloadRepository();
  processingUrls = /* @__PURE__ */ new Set();
  // 防止重复下载同一 URL
  constructor() {
    console.log("[DownloadManager] 初始化下载管理器");
  }
  static getInstance() {
    if (!DownloadManager.instance) {
      DownloadManager.instance = new DownloadManager();
    }
    return DownloadManager.instance;
  }
  /**
   * 处理下载事件（由全局 session 调用）
   */
  async handleDownload(item, webContents) {
    const url = item.getURL();
    const filename = item.getFilename();
    const dedupeKey = `${url}:${filename}`;
    if (this.processingUrls.has(dedupeKey)) {
      console.log(`[DownloadManager] 跳过重复下载: ${filename}`);
      return;
    }
    this.processingUrls.add(dedupeKey);
    setTimeout(() => {
      this.processingUrls.delete(dedupeKey);
    }, 5e3);
    const downloadId = index$1.n();
    const totalBytes = item.getTotalBytes();
    const mimeType = item.getMimeType();
    console.log(`[DownloadManager] 开始下载: ${filename} (${totalBytes} bytes)`);
    const downloadPath = electron.app.getPath("downloads");
    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath, { recursive: true });
    }
    const savePath = this.getUniqueSavePath(downloadPath, filename);
    const finalFilename = path.join(savePath).split("/").pop() || filename;
    item.setSavePath(savePath);
    const downloadRecord = {
      id: downloadId,
      url,
      filename: finalFilename,
      savePath,
      fileSize: totalBytes,
      downloadedBytes: 0,
      state: "progressing",
      mimeType,
      error: null,
      canResume: item.canResume()
    };
    try {
      await this.downloadRepository.add(downloadRecord);
    } catch (error) {
      console.error("[DownloadManager] 保存下载记录失败:", error);
    }
    this.activeDownloads.set(downloadId, {
      id: downloadId,
      item,
      startTime: Date.now(),
      lastBytes: 0,
      lastTime: Date.now()
    });
    mainEventBus.m.emit("download:started", {
      id: downloadId,
      filename: finalFilename,
      fileSize: totalBytes
    });
    const showNotification = async () => {
      const { downloadNotification } = await Promise.resolve().then(() => require("./index-GfVwZ7mz.js"));
      downloadNotification.notify({
        id: downloadId,
        filename: finalFilename,
        fileSize: totalBytes
      });
    };
    showNotification().catch((err) => {
      console.error("[DownloadManager] 显示下载通知失败:", err);
    });
    item.on("updated", (_event, state) => {
      if (state === "interrupted") {
        console.log(`[DownloadManager] 下载中断: ${filename}`);
        this.handleDownloadInterrupted(downloadId, item);
      } else if (state === "progressing") {
        if (item.isPaused()) {
          console.log(`[DownloadManager] 下载暂停: ${filename}`);
          this.handleDownloadPaused(downloadId);
        } else {
          const receivedBytes = item.getReceivedBytes();
          void this.handleDownloadProgress(downloadId, receivedBytes, totalBytes);
        }
      }
    });
    item.once("done", (_event, state) => {
      if (state === "completed") {
        console.log(`[DownloadManager] 下载完成: ${filename}`);
        void this.handleDownloadCompleted(downloadId, totalBytes);
      } else if (state === "cancelled") {
        console.log(`[DownloadManager] 下载取消: ${filename}`);
        void this.handleDownloadCancelled(downloadId);
      } else if (state === "interrupted") {
        console.log(`[DownloadManager] 下载失败: ${filename}`);
        void this.handleDownloadFailed(downloadId, "Download interrupted");
      }
      this.activeDownloads.delete(downloadId);
    });
  }
  /**
   * 获取唯一的保存路径（处理文件名冲突）
   */
  getUniqueSavePath(directory, filename) {
    let savePath = path.join(directory, filename);
    let counter = 1;
    while (fs.existsSync(savePath)) {
      const ext = filename.includes(".") ? filename.split(".").pop() : "";
      const nameWithoutExt = ext ? filename.slice(0, -(ext.length + 1)) : filename;
      const newFilename = ext ? `${nameWithoutExt} (${counter}).${ext}` : `${filename} (${counter})`;
      savePath = path.join(directory, newFilename);
      counter++;
    }
    return savePath;
  }
  /**
   * 处理下载进度更新
   */
  async handleDownloadProgress(id, receivedBytes, totalBytes) {
    const active = this.activeDownloads.get(id);
    if (!active) return;
    const now = Date.now();
    const timeDiff = (now - active.lastTime) / 1e3;
    const bytesDiff = receivedBytes - active.lastBytes;
    const bytesPerSecond = timeDiff > 0 ? bytesDiff / timeDiff : 0;
    const percent = totalBytes > 0 ? receivedBytes / totalBytes * 100 : 0;
    active.lastBytes = receivedBytes;
    active.lastTime = now;
    await this.downloadRepository.update(id, {
      downloadedBytes: receivedBytes
    }).catch((err) => {
      console.error("[DownloadManager] 更新下载进度失败:", err);
    });
    const progress = {
      id,
      downloadedBytes: receivedBytes,
      totalBytes,
      percent,
      bytesPerSecond
    };
    mainEventBus.m.emit("download:progress", progress);
  }
  /**
   * 处理下载完成
   */
  async handleDownloadCompleted(id, totalBytes) {
    const active = this.activeDownloads.get(id);
    const actualBytes = active?.item.getReceivedBytes() || totalBytes;
    const finalBytes = totalBytes > 0 ? totalBytes : actualBytes;
    await this.downloadRepository.update(id, {
      state: "completed",
      endTime: Date.now(),
      downloadedBytes: finalBytes,
      fileSize: finalBytes
      // 同时更新 fileSize
    });
    mainEventBus.m.emit("download:completed", { id });
  }
  /**
   * 处理下载暂停
   */
  async handleDownloadPaused(id) {
    await this.downloadRepository.update(id, {
      state: "paused"
    });
    mainEventBus.m.emit("download:paused", { id });
  }
  /**
   * 处理下载中断
   */
  async handleDownloadInterrupted(id, item) {
    const canResume = item.canResume();
    await this.downloadRepository.update(id, {
      state: canResume ? "paused" : "failed",
      error: "Download interrupted",
      canResume
    });
    mainEventBus.m.emit("download:interrupted", { id, canResume });
  }
  /**
   * 处理下载取消
   */
  async handleDownloadCancelled(id) {
    await this.downloadRepository.update(id, {
      state: "cancelled",
      endTime: Date.now()
    });
    mainEventBus.m.emit("download:cancelled", { id });
  }
  /**
   * 处理下载失败
   */
  async handleDownloadFailed(id, error) {
    await this.downloadRepository.update(id, {
      state: "failed",
      error,
      endTime: Date.now()
    });
    mainEventBus.m.emit("download:failed", { id, error });
  }
  /**
   * 暂停下载
   */
  pauseDownload(id) {
    const active = this.activeDownloads.get(id);
    if (!active || active.item.isPaused()) {
      return false;
    }
    active.item.pause();
    return true;
  }
  /**
   * 恢复下载
   */
  resumeDownload(id) {
    const active = this.activeDownloads.get(id);
    if (!active || !active.item.canResume()) {
      return false;
    }
    if (active.item.isPaused()) {
      active.item.resume();
      this.downloadRepository.update(id, {
        state: "progressing"
      }).catch((err) => {
        console.error("[DownloadManager] 更新下载状态失败:", err);
      });
      return true;
    }
    return false;
  }
  /**
   * 取消下载
   */
  cancelDownload(id) {
    const active = this.activeDownloads.get(id);
    if (!active) {
      return false;
    }
    active.item.cancel();
    return true;
  }
  /**
   * 获取所有下载记录
   */
  async getAllDownloads() {
    return await this.downloadRepository.getAll();
  }
  /**
   * 获取下载统计
   */
  async getStats() {
    return await this.downloadRepository.getStats();
  }
  /**
   * 删除下载记录
   */
  async removeDownload(id) {
    return await this.downloadRepository.remove(id);
  }
  /**
   * 批量删除下载记录
   */
  async removeBatch(ids) {
    return await this.downloadRepository.removeBatch(ids);
  }
  /**
   * 清空所有下载记录
   */
  async clearAll() {
    return await this.downloadRepository.clearAll();
  }
}
const downloadManager = DownloadManager.getInstance();
exports.downloadManager = downloadManager;
