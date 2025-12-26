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
electron.contextBridge.exposeInMainWorld("lifecycleAPI", {
  sendReady: () => electron.ipcRenderer.send("quit-warning:ready")
});
electron.contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    on: (channel, func) => {
      const validChannels = ["show-quit-warning", "hide-quit-warning"];
      if (validChannels.includes(channel)) {
        const subscription = (_event, ...args) => func(...args);
        electron.ipcRenderer.on(channel, subscription);
        return subscription;
      }
    },
    removeListener: (channel, func) => {
      const validChannels = ["show-quit-warning", "hide-quit-warning"];
      if (validChannels.includes(channel)) {
        electron.ipcRenderer.removeListener(channel, func);
      }
    }
  }
});
