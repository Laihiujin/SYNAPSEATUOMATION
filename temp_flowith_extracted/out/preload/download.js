"use strict";
const electron = require("electron");
const downloadAPI = {
  getAll: () => electron.ipcRenderer.invoke("download:getAll"),
  getStats: () => electron.ipcRenderer.invoke("download:getStats"),
  pause: (id) => electron.ipcRenderer.invoke("download:pause", id),
  resume: (id) => electron.ipcRenderer.invoke("download:resume", id),
  cancel: (id) => electron.ipcRenderer.invoke("download:cancel", id),
  remove: (id) => electron.ipcRenderer.invoke("download:remove", id),
  removeBatch: (ids) => electron.ipcRenderer.invoke("download:removeBatch", ids),
  clearAll: () => electron.ipcRenderer.invoke("download:clearAll"),
  openFile: (path) => electron.ipcRenderer.invoke("download:openFile", path),
  showInFolder: (path) => electron.ipcRenderer.invoke("download:showInFolder", path),
  onProgress: (callback) => {
    const handler = (_event, progress) => callback(progress);
    electron.ipcRenderer.on("download:progress", handler);
    return () => electron.ipcRenderer.removeListener("download:progress", handler);
  },
  onStarted: (callback) => {
    const handler = (_event, data) => callback(data);
    electron.ipcRenderer.on("download:started", handler);
    return () => electron.ipcRenderer.removeListener("download:started", handler);
  },
  onCompleted: (callback) => {
    const handler = (_event, data) => callback(data);
    electron.ipcRenderer.on("download:completed", handler);
    return () => electron.ipcRenderer.removeListener("download:completed", handler);
  },
  onFailed: (callback) => {
    const handler = (_event, data) => callback(data);
    electron.ipcRenderer.on("download:failed", handler);
    return () => electron.ipcRenderer.removeListener("download:failed", handler);
  },
  onCancelled: (callback) => {
    const handler = (_event, data) => callback(data);
    electron.ipcRenderer.on("download:cancelled", handler);
    return () => electron.ipcRenderer.removeListener("download:cancelled", handler);
  }
};
const tabsAPI = {
  create: (url, switchTo) => electron.ipcRenderer.invoke("tabs:create", url, switchTo),
  navigateCurrent: (url) => electron.ipcRenderer.invoke("tabs:navigateCurrent", url)
};
electron.contextBridge.exposeInMainWorld("downloadAPI", downloadAPI);
electron.contextBridge.exposeInMainWorld("tabsAPI", tabsAPI);
const themeAPI = {
  getMode: () => electron.ipcRenderer.invoke("theme:getMode"),
  setMode: (mode) => electron.ipcRenderer.send("theme:setMode", mode),
  getGradientId: () => electron.ipcRenderer.invoke("theme:getGradientId"),
  setGradientId: (gradientId) => electron.ipcRenderer.send("theme:setGradientId", gradientId),
  onModeChange: (listener) => {
    const handler = (_event, state) => {
      listener(state);
    };
    electron.ipcRenderer.on("theme:update", handler);
    return () => electron.ipcRenderer.removeListener("theme:update", handler);
  },
  requestSync: () => electron.ipcRenderer.send("theme:request-sync")
};
electron.contextBridge.exposeInMainWorld("themeAPI", themeAPI);
electron.contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    invoke: (channel, ...args) => electron.ipcRenderer.invoke(channel, ...args),
    on: (channel, listener) => electron.ipcRenderer.on(channel, listener),
    removeListener: (channel, listener) => electron.ipcRenderer.removeListener(channel, listener)
  }
});
console.log("Download preload loaded");
