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
  sendReady: () => electron.ipcRenderer.send("teach-mode-dialog:ready")
});
const teachModeAPI = {
  start: (goal) => electron.ipcRenderer.invoke("teach-mode:start", goal),
  finish: (options) => electron.ipcRenderer.invoke("teach-mode:finish", options),
  cancel: (reason) => electron.ipcRenderer.invoke("teach-mode:cancel", reason),
  reset: () => electron.ipcRenderer.invoke("teach-mode:reset"),
  getState: () => electron.ipcRenderer.invoke("teach-mode:get-state")
};
electron.contextBridge.exposeInMainWorld("sideBarAPI", {
  teachMode: teachModeAPI
});
const electronAPI = {
  ipcRenderer: {
    on: (channel, func) => {
      const handler = (event, ...args) => {
        if (channel === "show-teach-mode-dialog") {
          func(event, args[0], args[1]);
        } else if (channel === "teach-mode:state-update") {
          func(event, args[0]);
        }
      };
      electron.ipcRenderer.on(channel, handler);
    },
    removeListener: (channel, func) => {
      electron.ipcRenderer.removeListener(channel, func);
    },
    send: (channel, ...args) => {
      electron.ipcRenderer.send(channel, ...args);
    },
    invoke: (channel, params) => {
      return electron.ipcRenderer.invoke(channel, params);
    }
  }
};
electron.contextBridge.exposeInMainWorld("electron", electronAPI);
