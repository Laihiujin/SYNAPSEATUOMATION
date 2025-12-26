"use strict";
const electron = require("electron");
const themeAPI = {
  setMode: (mode) => electron.ipcRenderer.send("theme:set", mode),
  onModeChange: (callback) => {
    const handler = (_event, state) => callback(state.mode);
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
    const handler = (_event, state) => {
      listener(state);
    };
    electron.ipcRenderer.on("locale:update", handler);
    return () => electron.ipcRenderer.removeListener("locale:update", handler);
  },
  requestSync: () => electron.ipcRenderer.send("locale:request-sync")
};
electron.contextBridge.exposeInMainWorld("localeAPI", localeAPI);
electron.contextBridge.exposeInMainWorld("lifecycleAPI", {
  sendReady: () => electron.ipcRenderer.send("preset-dialog:ready")
});
electron.contextBridge.exposeInMainWorld("presetDialogAPI", {
  /**
   * 监听显示对话框事件
   */
  onShow: (callback) => {
    const handler = (_event, config) => {
      callback(config);
    };
    electron.ipcRenderer.on("show-preset-dialog", handler);
    return () => electron.ipcRenderer.removeListener("show-preset-dialog", handler);
  },
  /**
   * 发送对话框结果
   */
  sendResult: (result) => {
    electron.ipcRenderer.send("preset-dialog-result", result);
  }
});
