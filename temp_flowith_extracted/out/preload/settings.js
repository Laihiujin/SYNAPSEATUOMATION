"use strict";
const electron = require("electron");
const localeAPI = {
  setLocale: (locale) => electron.ipcRenderer.send("locale:setLocale", locale),
  getLocale: () => electron.ipcRenderer.invoke("locale:getLocale"),
  onLocaleChange: (listener) => {
    const handler = (_event, state) => {
      listener(state);
    };
    electron.ipcRenderer.on("locale:update", handler);
    return () => electron.ipcRenderer.removeListener("locale:update", handler);
  },
  requestSync: () => electron.ipcRenderer.send("locale:request-sync")
};
const historyAPI = {
  getAll: () => electron.ipcRenderer.invoke("history:getAll"),
  search: (keyword) => electron.ipcRenderer.invoke("history:search", keyword),
  remove: (id) => electron.ipcRenderer.invoke("history:remove", id),
  removeBatch: (ids) => electron.ipcRenderer.invoke("history:removeBatch", ids),
  removeByTimeRange: (range, custom) => electron.ipcRenderer.invoke("history:removeByTimeRange", range, custom),
  clearAll: () => electron.ipcRenderer.invoke("history:clearAll"),
  getStats: () => electron.ipcRenderer.invoke("history:getStats")
};
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
electron.contextBridge.exposeInMainWorld("localeAPI", localeAPI);
electron.contextBridge.exposeInMainWorld("historyAPI", historyAPI);
electron.contextBridge.exposeInMainWorld("downloadAPI", downloadAPI);
electron.contextBridge.exposeInMainWorld("tabsAPI", tabsAPI);
electron.contextBridge.exposeInMainWorld("settingsUpdateAPI", {
  getAccess: () => electron.ipcRenderer.invoke("app-update:get-access"),
  getChannel: () => electron.ipcRenderer.invoke("auto-update:get-channel"),
  setChannel: (ch) => electron.ipcRenderer.invoke("auto-update:set-channel", ch),
  checkForUpdates: () => electron.ipcRenderer.invoke("auto-update:check"),
  getVersion: () => electron.ipcRenderer.invoke("auto-update:get-version")
});
