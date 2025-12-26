"use strict";
const electron = require("electron");
const themeAPI = {
  getMode: () => electron.ipcRenderer.invoke("theme:getMode"),
  setMode: (mode) => electron.ipcRenderer.send("theme:setMode", mode),
  getGradientId: () => electron.ipcRenderer.invoke("theme:getGradientId"),
  onModeChange: (callback) => {
    const handler = (_event, state) => callback(state);
    electron.ipcRenderer.on("theme:update", handler);
    return () => electron.ipcRenderer.removeListener("theme:update", handler);
  },
  requestSync: () => electron.ipcRenderer.send("theme:request-sync")
};
const localeAPI = {
  setLocale: (locale) => electron.ipcRenderer.send("locale:setLocale", locale),
  getLocale: () => electron.ipcRenderer.invoke("locale:getLocale"),
  onLocaleChange: (listener) => {
    const handler = (_event, state) => {
      listener(state);
    };
    electron.ipcRenderer.on("locale:update", handler);
    return () => electron.ipcRenderer.removeListener("locale:update", handler);
  },
  requestSync: () => electron.ipcRenderer.send("locale:request-sync")
};
electron.contextBridge.exposeInMainWorld("themeAPI", themeAPI);
electron.contextBridge.exposeInMainWorld("localeAPI", localeAPI);
electron.contextBridge.exposeInMainWorld("lifecycleAPI", {
  sendReady: () => electron.ipcRenderer.send("reward-page:ready")
});
const browserAgentAPI = {
  startShareTask: (platform, invitationCodes) => electron.ipcRenderer.invoke("reward-page:start-share-task", { platform, invitationCodes })
};
electron.contextBridge.exposeInMainWorld("browserAgentAPI", browserAgentAPI);
const invitationCodesAPI = {
  getMyCodes: () => electron.ipcRenderer.invoke("os-invitation:get-my-codes")
};
electron.contextBridge.exposeInMainWorld("invitationCodesAPI", invitationCodesAPI);
electron.contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    on: (channel, func) => {
      const validChannels = ["show-reward-page", "reward-page:credit-awarded"];
      if (validChannels.includes(channel)) {
        const subscription = (_event, ...args) => func(...args);
        electron.ipcRenderer.on(channel, subscription);
        return subscription;
      }
    },
    removeListener: (channel, func) => {
      const validChannels = ["show-reward-page", "reward-page:credit-awarded"];
      if (validChannels.includes(channel)) {
        electron.ipcRenderer.removeListener(channel, func);
      }
    },
    send: (channel, ...args) => {
      const validChannels = ["reward-page:close"];
      if (validChannels.includes(channel)) {
        electron.ipcRenderer.send(channel, ...args);
      }
    }
  }
});
