"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("lifecycleAPI", {
  sendReady: () => electron.ipcRenderer.send("update-toast:ready")
});
const themeAPI = {
  getMode: () => electron.ipcRenderer.invoke("theme:getMode"),
  setMode: (mode) => electron.ipcRenderer.send("theme:setMode", mode),
  getGradientId: () => electron.ipcRenderer.invoke("theme:getGradientId"),
  setGradientId: (gradientId) => electron.ipcRenderer.send("theme:setGradientId", gradientId),
  onModeChange: (listener) => {
    const handler = (_event, state) => listener(state);
    electron.ipcRenderer.on("theme:update", handler);
    return () => electron.ipcRenderer.removeListener("theme:update", handler);
  },
  requestSync: () => electron.ipcRenderer.send("theme:request-sync")
};
electron.contextBridge.exposeInMainWorld("themeAPI", themeAPI);
const localeAPI = {
  getLocale: () => electron.ipcRenderer.invoke("locale:getLocale"),
  setLocale: (locale) => electron.ipcRenderer.send("locale:setLocale", locale),
  onLocaleChange: (listener) => {
    const handler = (_event, state) => listener(state);
    electron.ipcRenderer.on("locale:update", handler);
    return () => electron.ipcRenderer.removeListener("locale:update", handler);
  },
  requestSync: () => electron.ipcRenderer.send("locale:request-sync")
};
electron.contextBridge.exposeInMainWorld("localeAPI", localeAPI);
electron.contextBridge.exposeInMainWorld("updateToast", {
  onUpdateInfo: (callback) => {
    const handler = (_event, info) => callback(info);
    electron.ipcRenderer.on("update-toast:info", handler);
    return () => electron.ipcRenderer.removeListener("update-toast:info", handler);
  },
  onDownloadProgress: (callback) => {
    const handler = (_event, progress) => callback(progress);
    electron.ipcRenderer.on("update-toast:progress", handler);
    return () => electron.ipcRenderer.removeListener("update-toast:progress", handler);
  },
  install: (updateInfo) => electron.ipcRenderer.invoke("update-toast:install", updateInfo),
  dismiss: () => electron.ipcRenderer.invoke("update-toast:dismiss"),
  minimize: () => electron.ipcRenderer.invoke("update-toast:minimize"),
  dismissCompleted: () => electron.ipcRenderer.invoke("update-toast:dismiss-completed"),
  setChannel: (channel) => electron.ipcRenderer.invoke("auto-update:set-channel", channel),
  checkForUpdates: () => electron.ipcRenderer.invoke("auto-update:check"),
  getUserInfo: () => electron.ipcRenderer.invoke("auth:getUserInfo"),
  openDownloadedInstaller: () => electron.ipcRenderer.invoke("update:open-downloaded-installer")
});
