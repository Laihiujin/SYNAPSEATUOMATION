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
electron.contextBridge.exposeInMainWorld("lifecycleAPI", {
  sendReady: () => electron.ipcRenderer.send("agent-guide:ready")
});
electron.contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    on: (channel, func) => {
      const validChannels = ["show-agent-guide"];
      if (validChannels.includes(channel)) {
        const subscription = (_event, ...args) => func(...args);
        electron.ipcRenderer.on(channel, subscription);
        return subscription;
      }
      return void 0;
    },
    removeListener: (channel, func) => {
      const validChannels = ["show-agent-guide"];
      if (validChannels.includes(channel)) {
        electron.ipcRenderer.removeListener(channel, func);
      }
    },
    send: (channel, ...args) => {
      const validChannels = ["agent-guide:close"];
      if (validChannels.includes(channel)) {
        electron.ipcRenderer.send(channel, ...args);
      }
    }
  }
});
