const { contextBridge, ipcRenderer } = require("electron");

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

