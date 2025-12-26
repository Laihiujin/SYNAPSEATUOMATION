"use strict";
const electron = require("electron");
const themeAPI = {
  setMode: (mode) => electron.ipcRenderer.send("theme:set", mode),
  onModeChange: (callback) => {
    const handler = (_event, state) => callback(state.mode);
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
try {
  electron.contextBridge.exposeInMainWorld("localeAPI", localeAPI);
} catch (error) {
  console.warn("[whitelistGate] localeAPI already exists, skipping:", error);
}
electron.contextBridge.exposeInMainWorld("lifecycleAPI", {
  sendReady: () => electron.ipcRenderer.send("whitelist-gate:ready")
});
electron.contextBridge.exposeInMainWorld("osInvitationGate", {
  verifyCode: async (code) => {
    return await electron.ipcRenderer.invoke("os-invitation:verify-code", code);
  },
  checkAccess: async () => {
    return await electron.ipcRenderer.invoke("os-invitation:check-access");
  },
  checkOnboardingStatus: async () => {
    return await electron.ipcRenderer.invoke("os-invitation:check-onboarding-status");
  },
  signOut: () => {
    electron.ipcRenderer.send("auth:logout");
  },
  login: async (params) => {
    return await electron.ipcRenderer.invoke("auth:login", params);
  },
  onLoginSuccess: (callback) => {
    const handler = () => callback();
    electron.ipcRenderer.on("auth:loginSuccess", handler);
    return () => electron.ipcRenderer.removeListener("auth:loginSuccess", handler);
  },
  completeOnboarding: async (settings) => {
    return await electron.ipcRenderer.invoke("os-invitation:complete-onboarding", settings);
  },
  // 浏览器相关 API
  detectInstalledBrowsers: async () => {
    return await electron.ipcRenderer.invoke("bookmarks:detectBrowsers");
  },
  importFromBrowser: async (browserType) => {
    try {
      const bookmarks = await electron.ipcRenderer.invoke("bookmarks:readFromBrowser", browserType);
      const result = await electron.ipcRenderer.invoke("bookmarks:import", bookmarks);
      return result;
    } catch (error) {
      console.error(`❌ Failed to import from ${browserType}:`, error);
      return {
        success: false,
        imported: 0,
        total: 0
      };
    }
  },
  resizeWindow: (width, height) => {
    electron.ipcRenderer.send("os-invitation:resize-window", width, height);
  },
  notifyPageChange: (currentPage) => {
    electron.ipcRenderer.send("os-invitation:page-changed", currentPage);
  },
  showRewardPage: async () => {
    await electron.ipcRenderer.invoke("reward-page:show");
  },
  // 通知主进程 React 组件已就绪（用于发送缓存的更新消息）
  notifyReactReady: () => {
    electron.ipcRenderer.send("whitelist-gate:react-ready");
  }
});
const updateToastAPI = {
  onUpdateInfo: (callback) => {
    const handler = (_event, info) => callback(info);
    electron.ipcRenderer.on("update-toast:info", handler);
    return () => electron.ipcRenderer.removeListener("update-toast:info", handler);
  },
  onDownloadProgress: (callback) => {
    const handler = (_event, progress) => callback(progress);
    electron.ipcRenderer.on("update-toast:progress", handler);
    return () => electron.ipcRenderer.removeListener("update-toast:progress", handler);
  },
  install: (updateInfo) => electron.ipcRenderer.invoke("update-toast:install", updateInfo),
  dismiss: () => electron.ipcRenderer.invoke("update-toast:dismiss"),
  dismissCompleted: () => electron.ipcRenderer.invoke("update-toast:dismiss-completed"),
  setChannel: (channel) => electron.ipcRenderer.invoke("auto-update:set-channel", channel),
  checkForUpdates: () => electron.ipcRenderer.invoke("auto-update:check"),
  getUserInfo: () => electron.ipcRenderer.invoke("auth:getUserInfo"),
  openDownloadedInstaller: () => electron.ipcRenderer.invoke("update:open-downloaded-installer")
};
electron.contextBridge.exposeInMainWorld("updateToast", updateToastAPI);
