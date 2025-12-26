"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("tabPreviewOverlay", {
  close: () => electron.ipcRenderer.send("tab-preview-overlay:close"),
  performAction: (action) => electron.ipcRenderer.send("tab-preview-overlay:action", action),
  notifyHideReady: () => electron.ipcRenderer.send("tab-preview-overlay:hide-ready"),
  bookmarks: {
    getAll: () => electron.ipcRenderer.invoke("bookmarks:getAll"),
    import: (bookmarks) => electron.ipcRenderer.invoke("bookmarks:import", bookmarks),
    update: (bookmarkId, updates) => electron.ipcRenderer.invoke("bookmarks:update", bookmarkId, updates),
    move: (bookmarkId, targetParentId, newIndex) => electron.ipcRenderer.invoke("bookmarks:move", bookmarkId, targetParentId, newIndex),
    createFolder: (name) => electron.ipcRenderer.invoke("bookmarks:createFolder", name)
  }
});
electron.ipcRenderer.on("tab-preview-overlay:show", (_event, payload) => {
  window.dispatchEvent(new CustomEvent("tabPreviewOverlay:open", { detail: payload }));
});
electron.ipcRenderer.on("tab-preview-overlay:prepare-hide", () => {
  window.dispatchEvent(new CustomEvent("tabPreviewOverlay:prepareHide"));
});
electron.ipcRenderer.on("tab-preview-overlay:hide", () => {
  window.dispatchEvent(new CustomEvent("tabPreviewOverlay:close"));
});
electron.ipcRenderer.on("tab-preview-overlay:update", (_event, payload) => {
  window.dispatchEvent(new CustomEvent("tabPreviewOverlay:update", { detail: payload }));
});
