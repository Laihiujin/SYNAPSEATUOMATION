"use strict";
const electron = require("electron");
const downloadNotificationAPI = {
  openDownloads: () => electron.ipcRenderer.invoke("downloadNotification:openDownloads"),
  dismiss: () => electron.ipcRenderer.invoke("downloadNotification:dismiss"),
  onShow: (callback) => {
    const handler = (_event, data) => callback(data);
    electron.ipcRenderer.on("download-notification:show", handler);
    return () => electron.ipcRenderer.removeListener("download-notification:show", handler);
  }
};
electron.contextBridge.exposeInMainWorld("downloadNotificationAPI", downloadNotificationAPI);
electron.contextBridge.exposeInMainWorld("lifecycleAPI", {
  sendReady: () => electron.ipcRenderer.send("download-notification:ready")
});
console.log("[DownloadNotification Preload] downloadNotificationAPI exposed");
