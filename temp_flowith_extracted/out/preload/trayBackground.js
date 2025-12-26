"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("themeAPI", {
  onModeChange: (callback) => {
    const handler = (_event, state) => {
      callback(state);
    };
    electron.ipcRenderer.on("theme:update", handler);
    return () => electron.ipcRenderer.removeListener("theme:update", handler);
  }
});
