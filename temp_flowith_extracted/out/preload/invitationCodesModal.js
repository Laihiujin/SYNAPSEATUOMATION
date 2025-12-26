"use strict";
const electron = require("electron");
const themeAPI = {
  getMode: () => electron.ipcRenderer.invoke("theme:getMode"),
  setMode: (mode) => electron.ipcRenderer.send("theme:setMode", mode),
  getGradientId: () => electron.ipcRenderer.invoke("theme:getGradientId"),
  setGradientId: (gradientId) => electron.ipcRenderer.send("theme:setGradientId", gradientId),
  onModeChange: (callback) => {
    const handler = (_event, state) => callback(state);
    electron.ipcRenderer.on("theme:update", handler);
    return () => electron.ipcRenderer.removeListener("theme:update", handler);
  },
  requestSync: () => electron.ipcRenderer.send("theme:request-sync")
};
electron.contextBridge.exposeInMainWorld("themeAPI", themeAPI);
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
electron.contextBridge.exposeInMainWorld("localeAPI", localeAPI);
electron.contextBridge.exposeInMainWorld("lifecycleAPI", {
  sendReady: () => electron.ipcRenderer.send("invitation-codes-modal:ready")
});
electron.contextBridge.exposeInMainWorld("invitationCodesModal", {
  close: () => {
    electron.ipcRenderer.send("invitationCodesModal:close");
  },
  getMyCodes: async () => {
    return await electron.ipcRenderer.invoke("os-invitation:get-my-codes");
  },
  copyToClipboard: async (text) => {
    return await electron.ipcRenderer.invoke("clipboard:writeText", text);
  },
  onRefresh: (callback) => {
    const handler = () => callback();
    electron.ipcRenderer.on("invitationCodesModal:refresh", handler);
    return () => electron.ipcRenderer.removeListener("invitationCodesModal:refresh", handler);
  }
});
