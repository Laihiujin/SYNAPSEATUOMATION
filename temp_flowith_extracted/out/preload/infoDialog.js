"use strict";
const electron = require("electron");
const lifecycleAPI = {
  sendReady: () => {
    electron.ipcRenderer.send("info-dialog:ready");
  }
};
electron.contextBridge.exposeInMainWorld("lifecycleAPI", lifecycleAPI);
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
const electronBridge = {
  ipcRenderer: {
    on: (channel, func) => {
      const validChannels = ["show-info-dialog"];
      if (validChannels.includes(channel)) {
        const subscription = (_event, ...args) => {
          func(...args);
        };
        electron.ipcRenderer.on(channel, subscription);
        return subscription;
      }
      return void 0;
    },
    removeListener: (channel, func) => {
      const validChannels = ["show-info-dialog"];
      if (validChannels.includes(channel)) {
        electron.ipcRenderer.removeListener(channel, func);
      }
    },
    send: (channel) => {
      const validChannels = ["info-dialog:close"];
      if (validChannels.includes(channel)) {
        electron.ipcRenderer.send(channel);
      }
    }
  }
};
electron.contextBridge.exposeInMainWorld("electron", electronBridge);
console.log("[InfoDialog Preload] Preload script loaded");
