"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("tabNavigationBar", {
  sendAction: (action) => electron.ipcRenderer.send("tab-navigation-bar:action", action),
  onStateUpdate: (callback) => {
    const listener = (_event, state) => {
      callback(state);
    };
    electron.ipcRenderer.on("tab-navigation-bar:update-state", listener);
    return () => {
      electron.ipcRenderer.removeListener("tab-navigation-bar:update-state", listener);
    };
  },
  getCurrentState: () => electron.ipcRenderer.invoke("tab-navigation-bar:get-current-state")
});
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
electron.contextBridge.exposeInMainWorld("themeAPI", themeAPI);
electron.contextBridge.exposeInMainWorld("localeAPI", localeAPI);
