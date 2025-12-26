"use strict";
const electron = require("electron");
const historyAPI = {
  getAll: () => electron.ipcRenderer.invoke("history:getAll"),
  search: (keyword) => electron.ipcRenderer.invoke("history:search", keyword),
  getByTimeRange: (range, custom) => electron.ipcRenderer.invoke("history:getByTimeRange", range, custom),
  remove: (id) => electron.ipcRenderer.invoke("history:remove", id),
  removeBatch: (ids) => electron.ipcRenderer.invoke("history:removeBatch", ids),
  removeByTimeRange: (range, custom) => electron.ipcRenderer.invoke("history:removeByTimeRange", range, custom),
  clear: () => electron.ipcRenderer.invoke("history:clear"),
  getStats: () => electron.ipcRenderer.invoke("history:getStats"),
  getFrequentUrls: (prefix) => electron.ipcRenderer.invoke("history:getFrequentUrls", prefix)
};
const tabsAPI = {
  create: (url, switchTo) => electron.ipcRenderer.invoke("tabs:create", url, switchTo)
};
electron.contextBridge.exposeInMainWorld("historyAPI", historyAPI);
electron.contextBridge.exposeInMainWorld("tabsAPI", tabsAPI);
const themeAPI = {
  getMode: () => electron.ipcRenderer.invoke("theme:getMode"),
  setMode: (mode) => electron.ipcRenderer.send("theme:setMode", mode),
  getGradientId: () => electron.ipcRenderer.invoke("theme:getGradientId"),
  setGradientId: (gradientId) => electron.ipcRenderer.send("theme:setGradientId", gradientId),
  onModeChange: (listener) => {
    const handler = (_event, state) => {
      listener(state);
    };
    electron.ipcRenderer.on("theme:update", handler);
    return () => electron.ipcRenderer.removeListener("theme:update", handler);
  },
  requestSync: () => electron.ipcRenderer.send("theme:request-sync")
};
electron.contextBridge.exposeInMainWorld("themeAPI", themeAPI);
electron.contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    invoke: (channel, ...args) => electron.ipcRenderer.invoke(channel, ...args),
    on: (channel, listener) => electron.ipcRenderer.on(channel, listener),
    removeListener: (channel, listener) => electron.ipcRenderer.removeListener(channel, listener)
  }
});
console.log("History preload loaded");
