"use strict";
const electron = require("electron");
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
electron.contextBridge.exposeInMainWorld("lifecycleAPI", {
  sendReady: () => electron.ipcRenderer.send("language-dialog:ready")
});
const localeAPI = {
  setLocale: (locale) => electron.ipcRenderer.send("locale:setLocale", locale),
  getLocale: () => electron.ipcRenderer.invoke("locale:getLocale"),
  onLocaleChange: (listener) => {
    const handler = (_event, state) => listener(state);
    electron.ipcRenderer.on("locale:update", handler);
    return () => electron.ipcRenderer.removeListener("locale:update", handler);
  },
  requestSync: () => electron.ipcRenderer.send("locale:request-sync")
};
electron.contextBridge.exposeInMainWorld("localeAPI", localeAPI);
electron.contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    on: (channel, func) => {
      const validChannels = ["show-language-dialog"];
      if (validChannels.includes(channel)) {
        const subscription = (event, ...args) => func(event, ...args);
        electron.ipcRenderer.on(channel, subscription);
        return subscription;
      }
      return void 0;
    },
    removeListener: (channel, func) => {
      const validChannels = ["show-language-dialog"];
      if (validChannels.includes(channel)) {
        electron.ipcRenderer.removeListener(channel, func);
      }
    },
    send: (channel, ...args) => {
      const validChannels = ["language-dialog:ready", "language-dialog:close"];
      if (validChannels.includes(channel)) {
        electron.ipcRenderer.send(channel, ...args);
      }
    }
  }
});
