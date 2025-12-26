"use strict";
const electron = require("electron");
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
electron.contextBridge.exposeInMainWorld("userMenuOverlay", {
  close: () => electron.ipcRenderer.send("user-menu-overlay:close"),
  performAction: (action) => electron.ipcRenderer.send("user-menu-overlay:action", action),
  resize: (height) => electron.ipcRenderer.send("user-menu-overlay:resize", height)
});
electron.contextBridge.exposeInMainWorld("sideBarAPI", {
  update: {
    checkForUpdates: () => electron.ipcRenderer.invoke("auto-update:check"),
    download: () => electron.ipcRenderer.invoke("auto-update:download"),
    install: () => electron.ipcRenderer.invoke("auto-update:install"),
    getVersion: () => electron.ipcRenderer.invoke("auto-update:get-version"),
    clearCache: () => electron.ipcRenderer.invoke("auto-update:clear-cache")
  },
  ui: {
    openInvitationCodesModal: () => {
      console.log("[userMenuOverlay preload] Opening invitation codes modal");
      electron.ipcRenderer.send("invitationCodesModal:open");
    },
    showLanguageDialog: async (position) => {
      const currentLocale = await electron.ipcRenderer.invoke("locale:getLocale");
      electron.ipcRenderer.send("language-dialog:show", currentLocale, position);
    }
  },
  tabs: {
    create: (url, switchTo) => electron.ipcRenderer.invoke("tabs:create", url, switchTo)
  },
  osInvitation: {
    getMyCodes: () => electron.ipcRenderer.invoke("os-invitation:get-my-codes")
  }
});
electron.ipcRenderer.on("user-menu-overlay:show", (_event, payload) => {
  window.dispatchEvent(
    new CustomEvent("userMenuOverlay:open", { detail: payload })
  );
});
electron.ipcRenderer.on("user-menu-overlay:hide", () => {
  window.dispatchEvent(new CustomEvent("userMenuOverlay:close"));
});
electron.ipcRenderer.on(
  "user-menu-overlay:codes-update",
  (_event, payload) => {
    window.dispatchEvent(
      new CustomEvent("userMenuOverlay:codesUpdate", { detail: payload })
    );
  }
);
electron.ipcRenderer.on("language-dialog:opened", () => {
  window.dispatchEvent(new CustomEvent("languageDialog:opened"));
});
electron.ipcRenderer.on("language-dialog:closed", () => {
  window.dispatchEvent(new CustomEvent("languageDialog:closed"));
});
