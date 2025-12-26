"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("tabBorderOverlayAPI", {
  onStateUpdate: (callback) => {
    const handler = (_event, state) => callback(state);
    electron.ipcRenderer.on("update-border-state", handler);
    return () => electron.ipcRenderer.removeListener("update-border-state", handler);
  },
  // 请求释放交互锁定
  requestRelease: () => {
    console.log("[TabBorderOverlay Preload] 📤 Sending request-release IPC");
    electron.ipcRenderer.send("tab-border-overlay:request-release");
    console.log("[TabBorderOverlay Preload] ✅ IPC sent");
  }
});
