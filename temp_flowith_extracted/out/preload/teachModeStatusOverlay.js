"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("teachModeStatusOverlay", {
  close: () => electron.ipcRenderer.send("teach-mode-status-overlay:close"),
  performAction: (action) => electron.ipcRenderer.send("teach-mode-status-overlay:action", action)
});
electron.ipcRenderer.on("teach-mode-status-overlay:show", (_event, payload) => {
  window.dispatchEvent(new CustomEvent("teachModeStatusOverlay:show", { detail: payload }));
});
electron.ipcRenderer.on("teach-mode-status-overlay:update", (_event, payload) => {
  window.dispatchEvent(new CustomEvent("teachModeStatusOverlay:update", { detail: payload }));
});
electron.ipcRenderer.on("teach-mode-status-overlay:hide", () => {
  window.dispatchEvent(new CustomEvent("teachModeStatusOverlay:hide"));
});
