const { contextBridge, ipcRenderer } = require("electron");

// 暴露为 synapse (旧API，兼容性)
contextBridge.exposeInMainWorld("synapse", {
  settingsGet: () => ipcRenderer.invoke("settings:get"),
  settingsSet: (patch) => ipcRenderer.invoke("settings:set", patch),
  serviceStatus: () => ipcRenderer.invoke("service:status"),
  startAll: (opts) => ipcRenderer.invoke("service:startAll", opts),
  stop: (which) => ipcRenderer.invoke("service:stop", which),
  open: (url) => ipcRenderer.invoke("ui:open", url),
  onLog: (handler) => {
    ipcRenderer.on("log", (_evt, payload) => handler(payload));
    return () => ipcRenderer.removeAllListeners("log");
  },
});

// 同时暴露为 electronAPI (新API，用于加载页面)
contextBridge.exposeInMainWorld("electronAPI", {
  settingsGet: () => ipcRenderer.invoke("settings:get"),
  settingsSet: (patch) => ipcRenderer.invoke("settings:set", patch),
  serviceStatus: () => ipcRenderer.invoke("service:status"),
  startAll: (opts) => ipcRenderer.invoke("service:startAll", opts),
  stop: (which) => ipcRenderer.invoke("service:stop", which),
  open: (url) => ipcRenderer.invoke("ui:open", url),
  onLog: (handler) => {
    ipcRenderer.on("log", (_evt, payload) => handler(payload));
    return () => ipcRenderer.removeAllListeners("log");
  },
});

